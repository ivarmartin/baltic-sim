import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/** The mark position for the narrative ambient seal (where it pauses when held). */
export const AMBIENT_SEAL_MARK = new THREE.Vector3(-20, 3.5, -3);

export interface AmbientSealResult {
  group: THREE.Object3D;
  update: (elapsed: number, dt: number) => void;
  material: THREE.MeshStandardMaterial;
  setHold: (hold: boolean) => void;
}

/**
 * Large perimeter oval that stays well outside all camera positions.
 * Y=3.5 = ~1 m below the water surface (Y=4.5).
 */
function createPerimeterPath(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(  5,   3.5,  12),
    new THREE.Vector3(-15,   2.8,   8),
    new THREE.Vector3(-20,   3.8,  -3),   // mark area
    new THREE.Vector3(-18,   2.5, -15),
    new THREE.Vector3( -5,   3.5, -25),
    new THREE.Vector3( 10,   2.9, -25),
    new THREE.Vector3( 25,   4.2, -15),
    new THREE.Vector3( 28,   2.7,  -2),
    new THREE.Vector3( 22,   3.5,   8),
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

export async function createAmbientSeal(scene: THREE.Scene): Promise<AmbientSealResult> {
  const group = new THREE.Group();

  // Load the same seal GLB model
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(import.meta.env.BASE_URL + 'assets/seal_swimming_idle.glb');

  const model = gltf.scene;

  // Clone the first material and assign to ALL meshes so depth-lighting covers everything
  let material: THREE.MeshStandardMaterial | null = null;
  const meshes: THREE.Mesh[] = [];
  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      meshes.push(child as THREE.Mesh);
      const m = child as THREE.Mesh;
      m.castShadow = true;
      if (!material && m.material instanceof THREE.MeshStandardMaterial) {
        material = m.material.clone();
      }
    }
  });

  if (!material) {
    material = new THREE.MeshStandardMaterial({ color: 0x5a6068 });
  }

  // Apply the single cloned material to every mesh
  for (const m of meshes) {
    m.material = material;
  }

  // Blender -Y forward → Three.js; rotate so forward = +X for path-following
  model.rotation.y = Math.PI / 2;

  group.add(model);

  // Set up animation mixer for embedded swimming animation
  const mixer = new THREE.AnimationMixer(model);
  if (gltf.animations.length > 0) {
    const action = mixer.clipAction(gltf.animations[0]);
    action.play();
  }

  // --- Path & movement ---
  const path = createPerimeterPath();
  const markT = findClosestT(path, AMBIENT_SEAL_MARK);

  let pathT = Math.random(); // start at random point along the oval
  const speed = 0.018;       // slower than pike-chapter seal — lazy cruising

  // Hold state (same pattern as perch/stickleback)
  let holdRequested = false;
  let isHolding = false;

  // Orientation temporaries
  const _tangent = new THREE.Vector3();
  const currentQuat = new THREE.Quaternion();
  const targetQuat = new THREE.Quaternion();
  const bankQuat = new THREE.Quaternion();
  const _up = new THREE.Vector3(0, 1, 0);
  const _right = new THREE.Vector3();
  const _correctedUp = new THREE.Vector3();
  const _basis = new THREE.Matrix4();

  // Shallow noise offsets — makes the path feel organic
  const noisePhaseX = Math.random() * Math.PI * 2;
  const noisePhaseY = Math.random() * Math.PI * 2;
  const noisePhaseZ = Math.random() * Math.PI * 2;
  const _noiseOffset = new THREE.Vector3();

  function update(elapsed: number, dt: number) {
    mixer.update(dt);

    // --- Advance along path (with hold support) ---
    if (holdRequested) {
      if (isHolding) {
        pathT = markT;
      } else {
        const dist = forwardDist(pathT, markT);
        if (dist < 0.002) {
          pathT = markT;
          isHolding = true;
        } else {
          let spd = Math.max(speed, dist / 2.0);
          if (dist < 0.08) {
            spd *= Math.max(dist / 0.08, 0.05);
          }
          const prevDist = dist;
          pathT = (pathT + spd * dt) % 1;
          if (forwardDist(pathT, markT) > prevDist) {
            pathT = markT;
            isHolding = true;
          }
        }
      }
    } else {
      isHolding = false;
      pathT = (pathT + speed * dt) % 1;
    }

    // --- Position from path + shallow noise ---
    const pos = path.getPointAt(pathT);

    // Add gentle organic drift (small amplitude, slow frequencies)
    _noiseOffset.set(
      Math.sin(elapsed * 0.3  + noisePhaseX) * 0.6,
      Math.sin(elapsed * 0.25 + noisePhaseY) * 0.25,
      Math.sin(elapsed * 0.35 + noisePhaseZ) * 0.6,
    );
    pos.add(_noiseOffset);

    group.position.copy(pos);

    // --- Orientation from tangent ---
    path.getTangentAt(pathT, _tangent).normalize();

    _right.crossVectors(_tangent, _up).normalize();
    _correctedUp.crossVectors(_right, _tangent).normalize();
    _basis.makeBasis(_tangent, _correctedUp, _right);
    targetQuat.setFromRotationMatrix(_basis);

    // Shortest-path slerp
    if (currentQuat.dot(targetQuat) < 0) {
      targetQuat.set(-targetQuat.x, -targetQuat.y, -targetQuat.z, -targetQuat.w);
    }

    // Smooth slerp — slightly softer than pike-chapter seal for lazy feel
    currentQuat.slerp(targetQuat, 0.06);
    group.quaternion.copy(currentQuat);

    // Gentle banking roll
    const bankAmount = Math.sin(elapsed * 0.8) * 0.10;
    bankQuat.setFromAxisAngle(_tangent, bankAmount);
    group.quaternion.premultiply(bankQuat);
  }

  group.visible = true;
  scene.add(group);

  function setHold(hold: boolean) {
    holdRequested = hold;
    if (!hold) isHolding = false;
  }

  return { group, update, material, setHold };
}
