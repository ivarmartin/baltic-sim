import * as THREE from 'three';

/**
 * Grey seal blockout — recognizable silhouette from merged primitives.
 * Elongated body, distinct head, front/rear flippers.
 */

export interface SealResult {
  group: THREE.Group;
  update: (elapsed: number, dt: number) => void;
  material: THREE.MeshStandardMaterial;
}

export function createSeal(scene: THREE.Scene, center: THREE.Vector3): SealResult {
  const group = new THREE.Group();

  // Inner group rotated so the body (built along +X) faces +Z for lookAt
  const bodyGroup = new THREE.Group();
  bodyGroup.rotation.y = -Math.PI / 2;
  group.add(bodyGroup);

  const material = new THREE.MeshStandardMaterial({
    color: 0x5a6068,
    roughness: 0.5,
    metalness: 0.05,
  });

  const bellyMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a8a80,
    roughness: 0.5,
    metalness: 0.05,
  });

  // Body — elongated capsule
  const bodyGeo = new THREE.CapsuleGeometry(0.18, 0.9, 6, 10);
  bodyGeo.rotateZ(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, material);
  body.castShadow = true;
  bodyGroup.add(body);

  // Belly — slightly flattened sphere underneath
  const bellyGeo = new THREE.SphereGeometry(0.16, 8, 6);
  bellyGeo.scale(1.8, 0.6, 1);
  const belly = new THREE.Mesh(bellyGeo, bellyMaterial);
  belly.position.set(0, -0.06, 0);
  belly.castShadow = true;
  bodyGroup.add(belly);

  // Head — sphere with slight forward protrusion
  const headGeo = new THREE.SphereGeometry(0.14, 8, 6);
  headGeo.scale(1.1, 0.9, 0.9);
  const head = new THREE.Mesh(headGeo, material);
  head.position.set(0.58, 0.04, 0);
  head.castShadow = true;
  bodyGroup.add(head);

  // Snout — small elongated sphere
  const snoutGeo = new THREE.SphereGeometry(0.06, 6, 4);
  snoutGeo.scale(1.4, 0.8, 0.9);
  const snout = new THREE.Mesh(snoutGeo, material);
  snout.position.set(0.72, 0.01, 0);
  bodyGroup.add(snout);

  // Eyes — tiny dark spheres
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
  const eyeGeo = new THREE.SphereGeometry(0.02, 6, 4);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(0.64, 0.08, 0.1);
  bodyGroup.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.64, 0.08, -0.1);
  bodyGroup.add(rightEye);

  // Front flippers — flat ellipsoids
  const flipperGeo = new THREE.SphereGeometry(0.08, 6, 4);
  flipperGeo.scale(1.5, 0.3, 0.8);

  const leftFront = new THREE.Mesh(flipperGeo, material);
  leftFront.position.set(0.25, -0.12, 0.2);
  leftFront.rotation.set(0, 0, -0.4);
  bodyGroup.add(leftFront);

  const rightFront = new THREE.Mesh(flipperGeo.clone(), material);
  rightFront.position.set(0.25, -0.12, -0.2);
  rightFront.rotation.set(0, 0, -0.4);
  bodyGroup.add(rightFront);

  // Rear flippers — wider, flatter
  const rearFlipperGeo = new THREE.SphereGeometry(0.1, 6, 4);
  rearFlipperGeo.scale(1.2, 0.2, 1.4);

  const tailFlipper = new THREE.Mesh(rearFlipperGeo, material);
  tailFlipper.position.set(-0.55, -0.04, 0);
  bodyGroup.add(tailFlipper);

  // Scale the seal to be ~1.5m long
  group.scale.setScalar(1.2);

  // Playful swim path — confident arcing loop with depth variation
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(center.x - 3,   center.y + 0.4, center.z - 2),
    new THREE.Vector3(center.x - 1.5, center.y + 1.2, center.z - 0.5), // arc up
    new THREE.Vector3(center.x,       center.y + 0.3, center.z + 1),    // dive down
    new THREE.Vector3(center.x + 1.5, center.y + 0.8, center.z + 0.5), // rise
    new THREE.Vector3(center.x + 2.5, center.y + 0.2, center.z - 1),   // swoop low
    new THREE.Vector3(center.x + 1,   center.y + 1.0, center.z - 2.5), // arc back up
  ], true);

  let t = 0;
  const speed = 0.035; // confident pace
  const _tangent = new THREE.Vector3();
  const _lookAt = new THREE.Vector3();
  const _up = new THREE.Vector3(0, 1, 0);

  // Quaternion-based orientation for smooth banking
  const currentQuat = new THREE.Quaternion();
  const targetQuat = new THREE.Quaternion();
  const rotMatrix = new THREE.Matrix4();

  function update(elapsed: number, dt: number) {
    t = (t + speed * dt) % 1;

    const pos = path.getPointAt(t);
    group.position.copy(pos);

    // Face direction of travel
    path.getTangentAt(t, _tangent);
    _lookAt.copy(pos).add(_tangent);
    rotMatrix.lookAt(pos, _lookAt, _up);
    targetQuat.setFromRotationMatrix(rotMatrix);

    // Smooth slerp for fluid turning
    currentQuat.slerp(targetQuat, 0.08);
    group.quaternion.copy(currentQuat);

    // Playful banking into turns — roll proportional to lateral tangent change
    const bankAngle = Math.sin(elapsed * 1.2) * 0.15 + _tangent.x * 0.3;
    group.rotateZ(bankAngle);

    // Gentle pitch oscillation — nose dips and rises like a real seal
    group.rotateX(Math.sin(elapsed * 2.0) * 0.06);
  }

  group.visible = false;
  scene.add(group);

  return { group, update, material };
}
