import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export interface SealResult {
  group: THREE.Group;
  update: (elapsed: number, dt: number) => void;
  material: THREE.MeshStandardMaterial;
}

export async function createSeal(scene: THREE.Scene, center: THREE.Vector3): Promise<SealResult> {
  const group = new THREE.Group();

  // Load seal GLB model
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(import.meta.env.BASE_URL + 'assets/seal_swimming_idle.glb');

  const model = gltf.scene;

  // Find meshes and primary material
  let material: THREE.MeshStandardMaterial | null = null;
  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const m = child as THREE.Mesh;
      m.castShadow = true;
      if (!material && m.material instanceof THREE.MeshStandardMaterial) {
        material = m.material;
      }
    }
  });

  if (!material) {
    material = new THREE.MeshStandardMaterial({ color: 0x5a6068 });
  }

  // Blender -Y forward → Three.js +Z after glTF conversion;
  // rotate so forward = +X to match quaternion path-following code
  model.rotation.y = Math.PI / 2;

  // Scale to match procedural seal size (~1.5 units long)
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const targetLength = 1.5;
  const scaleFactor = targetLength / maxDim;
  model.scale.setScalar(scaleFactor);

  group.add(model);

  // Set up animation mixer for embedded swimming animation
  const mixer = new THREE.AnimationMixer(model);
  if (gltf.animations.length > 0) {
    const action = mixer.clipAction(gltf.animations[0]);
    action.play();
  }

  // Playful swim path - confident arcing loop with depth variation
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(center.x - 3,   center.y + 0.4, center.z - 2),
    new THREE.Vector3(center.x - 1.5, center.y + 1.2, center.z - 0.5),
    new THREE.Vector3(center.x,       center.y + 0.3, center.z + 1),
    new THREE.Vector3(center.x + 1.5, center.y + 0.8, center.z + 0.5),
    new THREE.Vector3(center.x + 2.5, center.y + 0.2, center.z - 1),
    new THREE.Vector3(center.x + 1,   center.y + 1.0, center.z - 2.5),
  ], true);

  let pathT = 0;
  const speed = 0.035;
  const _tangent = new THREE.Vector3();

  // Orientation: build rotation from tangent + world up (no singularity)
  const currentQuat = new THREE.Quaternion();
  const targetQuat = new THREE.Quaternion();
  const bankQuat = new THREE.Quaternion();
  const _up = new THREE.Vector3(0, 1, 0);
  const _right = new THREE.Vector3();
  const _correctedUp = new THREE.Vector3();
  const _basis = new THREE.Matrix4();
  const _side = new THREE.Vector3();

  function update(elapsed: number, dt: number) {
    mixer.update(dt);

    pathT = (pathT + speed * dt) % 1;

    const pos = path.getPointAt(pathT);
    group.position.copy(pos);

    // Get forward direction
    path.getTangentAt(pathT, _tangent).normalize();

    // Build stable orientation: +X = forward, +Y = up-ish, +Z = right
    _right.crossVectors(_tangent, _up).normalize();
    _correctedUp.crossVectors(_right, _tangent).normalize();
    _basis.makeBasis(_tangent, _correctedUp, _right);
    targetQuat.setFromRotationMatrix(_basis);

    // Ensure shortest-path slerp
    if (currentQuat.dot(targetQuat) < 0) {
      targetQuat.set(-targetQuat.x, -targetQuat.y, -targetQuat.z, -targetQuat.w);
    }

    // Smooth slerp for fluid turning
    currentQuat.slerp(targetQuat, 0.08);
    group.quaternion.copy(currentQuat);

    // Playful banking: roll around the forward axis
    _side.crossVectors(_tangent, _up).normalize();
    const bankAmount = Math.sin(elapsed * 1.2) * 0.12;
    bankQuat.setFromAxisAngle(_tangent, bankAmount);
    group.quaternion.premultiply(bankQuat);
  }

  group.visible = false;
  scene.add(group);

  return { group, update, material };
}
