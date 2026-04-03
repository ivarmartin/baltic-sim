import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const FISH_COUNT = 6;

/**
 * Generate a random swim path as a CatmullRomCurve3.
 */
function generatePath(): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = [];
  const count = 5 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    points.push(new THREE.Vector3(
      (Math.random() - 0.5) * 8,
      0.3 + Math.random() * 2.0,
      (Math.random() - 0.5) * 8,
    ));
  }
  return new THREE.CatmullRomCurve3(points, true);
}

/** The mark position for the narrative stickleback. */
export const STICKLEBACK_MARK = new THREE.Vector3(2.37, 0.45, -4.39);

/** Fixed patrol path for the narrative stickleback - loops near the Stickleback camera view. */
function createPresetSticklebackPath(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(2.77, 0.5, -5.59),
    new THREE.Vector3(2.57, 0.47, -4.89),
    new THREE.Vector3(2.37, 0.45, -4.39),    // mark area - side-on to camera, close
    new THREE.Vector3(2.17, 0.47, -3.89),
    new THREE.Vector3(1.97, 0.5, -3.39),
    new THREE.Vector3(2.27, 0.48, -4.09),
    new THREE.Vector3(2.57, 0.48, -4.89),
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

interface FishInstance {
  mesh: THREE.Mesh;
  geometry: THREE.BufferGeometry;
  basePositions: Float32Array;
  path: THREE.CatmullRomCurve3;
  t: number;
  speed: number;
  swimPhase: number;
  isPreset: boolean;
  markT: number;
  holdRequested: boolean;
  isHolding: boolean;
}

export interface SticklebackResult {
  group: THREE.Object3D;
  update: (elapsed: number, dt: number) => void;
  material: THREE.MeshStandardMaterial;
  setHold: (hold: boolean) => void;
}

export async function createSticklebacks(scene: THREE.Scene): Promise<SticklebackResult> {
  // Load stickleback GLB model
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(import.meta.env.BASE_URL + 'assets/stickleback.glb');

  // Collect all meshes and merge into a single geometry
  const meshes: THREE.Mesh[] = [];
  let firstMaterial: THREE.MeshStandardMaterial | null = null;
  gltf.scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const m = child as THREE.Mesh;
      meshes.push(m);
      if (!firstMaterial) firstMaterial = m.material as THREE.MeshStandardMaterial;
    }
  });
  if (meshes.length === 0) throw new Error('No mesh found in stickleback.glb');

  // Bake each mesh's world transform into its geometry and merge
  // Collect the union of all attribute names, then pad missing ones so mergeGeometries works
  const geos: THREE.BufferGeometry[] = [];
  const allAttrs = new Set<string>();
  for (const m of meshes) {
    const g = m.geometry.clone();
    m.updateWorldMatrix(true, false);
    g.applyMatrix4(m.matrixWorld);
    for (const name of Object.keys(g.attributes)) allAttrs.add(name);
    geos.push(g);
  }
  for (const g of geos) {
    for (const name of allAttrs) {
      if (!g.attributes[name]) {
        const ref = geos.find((o) => o.attributes[name])!.attributes[name];
        const itemSize = ref.itemSize;
        g.setAttribute(name, new THREE.BufferAttribute(
          new Float32Array(g.attributes.position.count * itemSize), itemSize,
        ));
      }
    }
  }
  const sourceGeometry = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);

  // Scale geometry to match procedural convention (~0.06m body)
  sourceGeometry.computeBoundingBox();
  const rawLength = sourceGeometry.boundingBox!.max.z - sourceGeometry.boundingBox!.min.z;
  const scaleFactor = 0.06 / rawLength;
  sourceGeometry.scale(scaleFactor, scaleFactor, scaleFactor);

  // Compute body extent for undulation normalization
  // Nose is at -Z (low z, faces lookAt direction), tail at +Z (high z)
  sourceGeometry.computeBoundingBox();
  const zMin = sourceGeometry.boundingBox!.min.z;
  const bodyLength = sourceGeometry.boundingBox!.max.z - zMin;

  // Use the GLB's baked material
  const material = firstMaterial!.clone();
  material.side = THREE.DoubleSide;

  const group = new THREE.Group();
  const fishes: FishInstance[] = [];

  for (let i = 0; i < FISH_COUNT; i++) {
    const geometry = sourceGeometry.clone();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;

    const basePositions = new Float32Array(geometry.attributes.position.array);

    const isPreset = i === 0;
    const path = isPreset ? createPresetSticklebackPath() : generatePath();
    const scale = isPreset ? 1.5 : (0.8 + Math.random() * 0.5);
    mesh.scale.setScalar(scale);

    const fish: FishInstance = {
      mesh,
      geometry,
      basePositions,
      path,
      t: Math.random(),
      speed: isPreset ? 0.08 : (0.015 + Math.random() * 0.01),
      swimPhase: Math.random() * Math.PI * 2,
      isPreset,
      markT: isPreset ? findClosestT(path, STICKLEBACK_MARK) : 0,
      holdRequested: false,
      isHolding: false,
    };

    group.add(mesh);
    fishes.push(fish);
  }
  scene.add(group);

  const _tangent = new THREE.Vector3();
  const _lookAt = new THREE.Vector3();

  const updateFish = function updateFish(elapsed: number, dt: number) {
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

      // --- Body undulation (always active, even when holding) ---
      const posAttr = fish.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      const base = fish.basePositions;

      for (let v = 0; v < posAttr.count; v++) {
        const i3 = v * 3;
        const bz = base[i3 + 2];
        const zNorm = (bz - zMin) / bodyLength;
        const amplitude = zNorm * zNorm * 0.0025;
        const wave = Math.sin(elapsed * 8 + fish.swimPhase - zNorm * Math.PI * 2);
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

  return { group, update: updateFish, material, setHold };
}
