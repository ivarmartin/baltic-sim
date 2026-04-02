import * as THREE from 'three';

/**
 * Cormorant blockout - recognizable diving bird silhouette.
 * Body, long neck, pointed beak, folded wings.
 */

export interface CormorantResult {
  group: THREE.Group;
  update: (elapsed: number, dt: number) => void;
  material: THREE.MeshStandardMaterial;
}

export function createCormorant(scene: THREE.Scene, center: THREE.Vector3): CormorantResult {
  const group = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.6,
    metalness: 0.05,
  });

  const chestMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2520,
    roughness: 0.6,
  });

  // Body - torpedo shape
  const bodyGeo = new THREE.CapsuleGeometry(0.08, 0.22, 6, 8);
  bodyGeo.rotateZ(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, material);
  body.castShadow = true;
  group.add(body);

  // Chest - slightly lighter, front underside
  const chestGeo = new THREE.SphereGeometry(0.07, 6, 4);
  chestGeo.scale(1.0, 0.8, 0.8);
  const chest = new THREE.Mesh(chestGeo, chestMaterial);
  chest.position.set(0.06, -0.03, 0);
  group.add(chest);

  // Neck - chain of small spheres for a curved neck
  const neckSegments = 5;
  for (let i = 0; i < neckSegments; i++) {
    const nf = i / (neckSegments - 1);
    const segGeo = new THREE.SphereGeometry(0.035 - nf * 0.01, 5, 4);
    const seg = new THREE.Mesh(segGeo, material);
    // Neck curves upward and forward in an S-shape
    seg.position.set(
      0.16 + nf * 0.12,
      0.04 + nf * 0.1 + Math.sin(nf * Math.PI) * 0.04,
      0,
    );
    group.add(seg);
  }

  // Head - small sphere
  const headGeo = new THREE.SphereGeometry(0.03, 6, 4);
  headGeo.scale(1.3, 0.9, 0.9);
  const head = new THREE.Mesh(headGeo, material);
  head.position.set(0.32, 0.16, 0);
  group.add(head);

  // Beak - cone
  const beakGeo = new THREE.ConeGeometry(0.012, 0.08, 4);
  beakGeo.rotateZ(-Math.PI / 2);
  const beak = new THREE.Mesh(beakGeo, new THREE.MeshStandardMaterial({ color: 0x3a3520, roughness: 0.8 }));
  beak.position.set(0.38, 0.155, 0);
  group.add(beak);

  // Wings - flat elongated shapes, folded along body
  const wingGeo = new THREE.BoxGeometry(0.25, 0.01, 0.12);
  const leftWing = new THREE.Mesh(wingGeo, material);
  leftWing.position.set(-0.02, 0.04, 0.09);
  leftWing.rotation.set(0.1, 0, 0.05);
  group.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeo.clone(), material);
  rightWing.position.set(-0.02, 0.04, -0.09);
  rightWing.rotation.set(-0.1, 0, 0.05);
  group.add(rightWing);

  // Tail - thin wedge
  const tailGeo = new THREE.BoxGeometry(0.12, 0.008, 0.05);
  const tail = new THREE.Mesh(tailGeo, material);
  tail.position.set(-0.18, 0.01, 0);
  group.add(tail);

  // Webbed feet - two small flat discs tucked under body
  const footGeo = new THREE.CircleGeometry(0.025, 5);
  const footMat = new THREE.MeshStandardMaterial({ color: 0x2a2a20, roughness: 0.8, side: THREE.DoubleSide });
  const leftFoot = new THREE.Mesh(footGeo, footMat);
  leftFoot.position.set(-0.08, -0.08, 0.05);
  leftFoot.rotation.x = -Math.PI / 2;
  group.add(leftFoot);
  const rightFoot = new THREE.Mesh(footGeo.clone(), footMat);
  rightFoot.position.set(-0.08, -0.08, -0.05);
  rightFoot.rotation.x = -Math.PI / 2;
  group.add(rightFoot);

  // Scale up
  group.scale.setScalar(1.8);

  // Diving path - comes from surface, dives down, goes back up
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(center.x - 4, center.y + 3.0, center.z - 1),
    new THREE.Vector3(center.x - 2, center.y + 1.5, center.z),
    new THREE.Vector3(center.x, center.y + 0.5, center.z + 0.5),
    new THREE.Vector3(center.x + 2, center.y + 1.0, center.z),
    new THREE.Vector3(center.x + 3, center.y + 2.5, center.z - 1),
    new THREE.Vector3(center.x + 1, center.y + 3.5, center.z - 2),
  ], true);

  let pathT = 0;
  const speed = 0.03;
  const _tangent = new THREE.Vector3();
  const _lookAt = new THREE.Vector3();

  function update(elapsed: number, dt: number) {
    pathT = (pathT + speed * dt) % 1;

    const pos = path.getPointAt(pathT);
    group.position.copy(pos);

    path.getTangentAt(pathT, _tangent);
    _lookAt.copy(pos).add(_tangent);
    group.lookAt(_lookAt);

    // Slight pitch adjustment based on direction
    group.rotation.z += Math.sin(elapsed * 2.0) * 0.03;
  }

  group.visible = false;
  scene.add(group);

  return { group, update, material };
}
