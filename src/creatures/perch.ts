import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const PERCH_COUNT = 3;

/** The mark position for the narrative perch (where it pauses in front of its camera). */
export const PERCH_MARK = new THREE.Vector3(1.5, 0.85, 1.0);

/**
 * Generate a random perch swim path — perch patrol near structures.
 */
function generatePerchPath(): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = [];
  const count = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    points.push(new THREE.Vector3(
      (Math.random() - 0.5) * 6,
      0.4 + Math.random() * 1.8,
      (Math.random() - 0.5) * 6,
    ));
  }
  return new THREE.CatmullRomCurve3(points, true);
}

/** Fixed patrol path for the narrative perch — loops near the Perch camera view. */
function createPresetPerchPath(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(2.5, 0.95, -0.5),
    new THREE.Vector3(1.8, 0.88, 0.3),
    new THREE.Vector3(1.5, 0.85, 1.0),     // mark area — side-on to camera, close
    new THREE.Vector3(1.2, 0.88, 1.8),
    new THREE.Vector3(0.5, 0.95, 2.5),
    new THREE.Vector3(-0.5, 1.0, 1.5),
    new THREE.Vector3(0.5, 1.0, -0.2),
  ], true);
}

/** Find the arc-length t parameter on a curve closest to a world position. */
function findClosestT(path: THREE.CatmullRomCurve3, target: THREE.Vector3): number {
  let bestT = 0;
  let bestDist = Infinity;
  for (let i = 0; i <= 200; i++) {
    const t = i / 200;
    const d = path.getPointAt(t).distanceTo(target);
    if (d < bestDist) {
      bestDist = d;
      bestT = t;
    }
  }
  return bestT;
}

/** Forward arc distance on the circular [0, 1) parameter ring. */
function forwardDist(current: number, target: number): number {
  return target >= current ? target - current : 1 - current + target;
}

interface PerchInstance {
  mesh: THREE.Mesh;
  geometry: THREE.BufferGeometry;
  basePositions: Float32Array;
  path: THREE.CatmullRomCurve3;
  t: number;
  speed: number;
  swimPhase: number;
  zMin: number;
  bodyLength: number;
  isPreset: boolean;
  markT: number;
  holdRequested: boolean;
  isHolding: boolean;
}

export interface PerchResult {
  update: (elapsed: number, dt: number) => void;
  material: THREE.MeshStandardMaterial;
  setHold: (hold: boolean) => void;
}

export async function createPerch(scene: THREE.Scene): Promise<PerchResult> {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(import.meta.env.BASE_URL + 'assets/perch.glb');

  // Find the first mesh in the loaded scene
  let sourceMesh: THREE.Mesh | null = null;
  gltf.scene.traverse((child) => {
    if (!sourceMesh && (child as THREE.Mesh).isMesh) {
      sourceMesh = child as THREE.Mesh;
    }
  });

  if (!sourceMesh) throw new Error('No mesh found in perch.glb');

  // Bake any transforms from the GLB hierarchy into the geometry
  const sourceGeo = (sourceMesh as THREE.Mesh).geometry.clone();
  (sourceMesh as THREE.Mesh).updateWorldMatrix(true, false);
  sourceGeo.applyMatrix4((sourceMesh as THREE.Mesh).matrixWorld);

  // Rotate so nose (-X in GLB) aligns with -Z (Three.js lookAt forward)
  sourceGeo.rotateY(-Math.PI / 2);

  // Compute body extent along Z for undulation normalization
  sourceGeo.computeBoundingBox();
  const zMin = sourceGeo.boundingBox!.min.z;
  const zMax = sourceGeo.boundingBox!.max.z;
  const bodyLength = zMax - zMin;

  // Use the GLB's baked material
  const material = ((sourceMesh as THREE.Mesh).material as THREE.MeshStandardMaterial).clone();

  const fishes: PerchInstance[] = [];

  for (let i = 0; i < PERCH_COUNT; i++) {
    const geometry = sourceGeo.clone();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;

    const basePositions = new Float32Array(geometry.attributes.position.array);

    const isPreset = i === 0;
    const path = isPreset ? createPresetPerchPath() : generatePerchPath();
    const scale = isPreset ? 1.0 : (0.85 + Math.random() * 0.35);
    mesh.scale.setScalar(scale);

    const fish: PerchInstance = {
      mesh,
      geometry,
      basePositions,
      path,
      t: Math.random(),
      speed: isPreset ? 0.06 : (0.008 + Math.random() * 0.006),
      swimPhase: Math.random() * Math.PI * 2,
      zMin,
      bodyLength,
      isPreset,
      markT: isPreset ? findClosestT(path, PERCH_MARK) : 0,
      holdRequested: false,
      isHolding: false,
    };

    scene.add(mesh);
    fishes.push(fish);
  }

  const _tangent = new THREE.Vector3();
  const _lookAt = new THREE.Vector3();

  const updatePerch = function updatePerch(elapsed: number, dt: number) {
    for (const fish of fishes) {
      // --- Advance along path ---
      if (fish.isPreset && fish.holdRequested) {
        if (fish.isHolding) {
          fish.t = fish.markT;
        } else {
          const dist = forwardDist(fish.t, fish.markT);
          if (dist < 0.002) {
            fish.t = fish.markT;
            fish.isHolding = true;
          } else {
            let speed = Math.max(fish.speed, dist / 2.0);
            if (dist < 0.08) {
              speed *= Math.max(dist / 0.08, 0.05);
            }
            const prevDist = dist;
            fish.t = (fish.t + speed * dt) % 1;
            if (forwardDist(fish.t, fish.markT) > prevDist) {
              fish.t = fish.markT;
              fish.isHolding = true;
            }
          }
        }
      } else {
        if (fish.isPreset) fish.isHolding = false;
        fish.t = (fish.t + fish.speed * dt) % 1;
      }

      // --- Position & orient ---
      const pos = fish.path.getPointAt(fish.t);
      fish.mesh.position.copy(pos);

      fish.path.getTangentAt(fish.t, _tangent);
      _lookAt.copy(pos).sub(_tangent);
      fish.mesh.lookAt(_lookAt);

      // --- Body undulation (lateral sine wave, amplitude grows toward tail) ---
      const posAttr = fish.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      const base = fish.basePositions;

      for (let v = 0; v < posAttr.count; v++) {
        const i3 = v * 3;
        const bz = base[i3 + 2];
        const zNorm = (bz - fish.zMin) / fish.bodyLength; // 0 at nose, 1 at tail
        const amplitude = zNorm * zNorm * 0.012;
        const wave = Math.sin(elapsed * 5 + fish.swimPhase - zNorm * Math.PI * 2);
        arr[i3] = base[i3] + wave * amplitude;
      }

      posAttr.needsUpdate = true;
    }
  };

  function setHold(hold: boolean) {
    const preset = fishes[0];
    if (preset) {
      preset.holdRequested = hold;
      if (!hold) preset.isHolding = false;
    }
  }

  return { update: updatePerch, material, setHold };
}
