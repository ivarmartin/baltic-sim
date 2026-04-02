import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/** Find the closest t parameter on a path to a target world position. */
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

/** Mark position for pike hold — side-on to camera, close. */
const PIKE_MARK = new THREE.Vector3(-11, 0.8, -8);

export interface PikeResult {
  group: THREE.Group;
  update: (elapsed: number, dt: number) => void;
  material: THREE.MeshStandardMaterial;
  setHold: (hold: boolean) => void;
}

export async function createPike(scene: THREE.Scene, position: THREE.Vector3): Promise<PikeResult> {
  const group = new THREE.Group();

  // Load pike GLB model
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(import.meta.env.BASE_URL + 'assets/pike.glb');

  let sourceMesh: THREE.Mesh | null = null;
  gltf.scene.traverse((child) => {
    if (!sourceMesh && (child as THREE.Mesh).isMesh) {
      sourceMesh = child as THREE.Mesh;
    }
  });

  if (!sourceMesh) throw new Error('No mesh found in pike.glb');

  // Bake any transforms from the GLB hierarchy into the geometry
  const geometry = (sourceMesh as THREE.Mesh).geometry.clone();
  (sourceMesh as THREE.Mesh).updateWorldMatrix(true, false);
  geometry.applyMatrix4((sourceMesh as THREE.Mesh).matrixWorld);

  // Blender -Y nose becomes +Z after glTF coord conversion; flip to -Z for lookAt
  geometry.rotateY(Math.PI);

  // Compute body extent along Z for undulation normalization
  geometry.computeBoundingBox();
  const zMin = geometry.boundingBox!.min.z;
  const zMax = geometry.boundingBox!.max.z;
  const bodyLength = zMax - zMin;

  // Use the GLB's baked material
  const material = ((sourceMesh as THREE.Mesh).material as THREE.MeshStandardMaterial).clone();

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  group.add(mesh);

  const basePositions = new Float32Array(geometry.attributes.position.array);

  // Very slow patrol path — pike lurks mostly motionless
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(position.x - 0.5, position.y, position.z - 0.5),
    new THREE.Vector3(position.x, position.y + 0.1, position.z),
    new THREE.Vector3(position.x + 0.5, position.y, position.z + 0.5),
    new THREE.Vector3(position.x, position.y - 0.1, position.z),
  ], true);

  let t = 0;
  const speed = 0.01; // very slow
  const swimPhase = Math.random() * Math.PI * 2;
  const _tangent = new THREE.Vector3();
  const _lookAt = new THREE.Vector3();

  // Hold state (decelerate-on-path, same as perch/stickleback)
  let holdRequested = false;
  let isHolding = false;
  const markT = findClosestT(path, PIKE_MARK);

  function setHold(value: boolean) {
    holdRequested = value;
    if (!value) isHolding = false;
  }

  function update(elapsed: number, dt: number) {
    if (holdRequested && !isHolding) {
      const dist = forwardDist(t, markT);
      if (dist < 0.002) {
        t = markT;
        isHolding = true;
      } else {
        let s = speed;
        if (dist < 0.08) {
          s *= Math.max(dist / 0.08, 0.05);
        }
        t = (t + s * dt) % 1;
      }
    } else if (isHolding) {
      t = markT;
    } else {
      t = (t + speed * dt) % 1;
    }

    const pos = path.getPointAt(t);
    mesh.position.copy(pos);

    path.getTangentAt(t, _tangent);
    _lookAt.copy(pos).sub(_tangent);
    mesh.lookAt(_lookAt);

    // Subtle body undulation (always active — pike breathes)
    const holding = holdRequested || isHolding;
    const posAttr = geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    for (let v = 0; v < posAttr.count; v++) {
      const i3 = v * 3;
      const bz = basePositions[i3 + 2];
      const zNorm = (bz - zMin) / bodyLength; // 0 at nose, 1 at tail
      const amplitude = zNorm * zNorm * (holding ? 0.001 : 0.003);
      const wave = Math.sin(elapsed * (holding ? 1.5 : 3) + swimPhase - zNorm * Math.PI * 2);
      arr[i3] = basePositions[i3] + wave * amplitude;
    }
    posAttr.needsUpdate = true;
  }

  group.visible = false;
  scene.add(group);

  return { group, update, material, setHold };
}
