import * as THREE from 'three';
import { getSeabedHeight } from './seabed';

export interface JettyResult {
  group: THREE.Group;
  woodMaterial: THREE.MeshStandardMaterial;
}

export function createJetty(scene: THREE.Scene): JettyResult {
  const group = new THREE.Group();

  const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0x5a4a2a,
    roughness: 0.9,
    metalness: 0.0,
  });

  const deckY = 4.6; // just above water surface (Y=4.5)
  const poleTop = deckY + 0.02;
  const poleXPositions = [-1.2, 0, 1.2];

  // --- Determine shore-end of jetty ---
  // Walk northward (+Z) until ground meets deck height
  let shoreEndZ = -2;
  for (let z = -2; z <= 30; z += 0.5) {
    const groundY = getSeabedHeight(0, z);
    if (groundY >= deckY - 0.05) {
      shoreEndZ = z;
      break;
    }
    shoreEndZ = z;
  }

  // --- Build all pole row Z positions ---
  const seaRowZs = [-3.2, -2]; // original sea-end rows
  const extensionRowZs: number[] = [];
  for (let z = 0; z <= shoreEndZ; z += 2) {
    const groundY = getSeabedHeight(0, z);
    if (groundY >= deckY - 0.05) break;
    extensionRowZs.push(z);
  }
  const allRowZs = [...seaRowZs, ...extensionRowZs];

  // --- Poles ---
  for (const rowZ of allRowZs) {
    for (const px of poleXPositions) {
      const groundY = getSeabedHeight(px, rowZ);
      const poleBase = groundY - 0.3; // sink slightly into ground
      const height = poleTop - poleBase;
      if (height < 0.15) continue;

      const poleGeo = new THREE.CylinderGeometry(0.08, 0.11, height, 8);
      const pole = new THREE.Mesh(poleGeo, woodMaterial);
      pole.position.set(px, poleBase + height / 2, rowZ);
      pole.castShadow = true;
      pole.receiveShadow = true;
      group.add(pole);
    }
  }

  // --- Horizontal beams within each row (X-direction) ---
  for (const rowZ of allRowZs) {
    const groundY = getSeabedHeight(0, rowZ);
    for (const beamY of [1.5, 3.0]) {
      if (groundY > beamY - 0.2) continue; // beam would be underground
      const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6);
      beamGeo.rotateZ(Math.PI / 2);
      for (const bx of [-0.6, 0.6]) {
        const beam = new THREE.Mesh(beamGeo, woodMaterial);
        beam.position.set(bx, beamY, rowZ);
        beam.castShadow = true;
        group.add(beam);
      }
    }
  }

  // --- Cross-beams between adjacent rows (Z-direction) ---
  for (let i = 0; i < allRowZs.length - 1; i++) {
    const z0 = allRowZs[i];
    const z1 = allRowZs[i + 1];
    const midZ = (z0 + z1) / 2;
    const dist = z1 - z0;
    const groundY = getSeabedHeight(0, midZ);

    for (const crossY of [1.5, 3.0]) {
      if (groundY > crossY - 0.2) continue;
      const crossGeo = new THREE.CylinderGeometry(0.04, 0.04, dist, 6);
      crossGeo.rotateX(Math.PI / 2);
      for (const cx of poleXPositions) {
        const cross = new THREE.Mesh(crossGeo, woodMaterial);
        cross.position.set(cx, crossY, midZ);
        cross.castShadow = true;
        group.add(cross);
      }
    }
  }

  // --- Ladder (sea-end, front-center pole) ---
  const ladderGroup = new THREE.Group();
  const railGeo = new THREE.BoxGeometry(0.04, 4, 0.04);
  const rungGeo = new THREE.BoxGeometry(0.04, 0.03, 0.38);

  const leftRail = new THREE.Mesh(railGeo, woodMaterial);
  leftRail.position.set(-0.19, 2, 0);
  ladderGroup.add(leftRail);

  const rightRail = new THREE.Mesh(railGeo, woodMaterial);
  rightRail.position.set(0.19, 2, 0);
  ladderGroup.add(rightRail);

  for (let i = 0; i < 9; i++) {
    const rung = new THREE.Mesh(rungGeo, woodMaterial);
    rung.position.set(0, 0.3 + i * 0.45, 0);
    rung.castShadow = true;
    ladderGroup.add(rung);
  }

  ladderGroup.position.set(0, 0, -1.85);
  group.add(ladderGroup);

  // --- Planked deck ---
  const deckSeaEnd = -3.5;
  const deckShoreEnd = extensionRowZs.length > 0
    ? extensionRowZs[extensionRowZs.length - 1] + 0.3
    : -1.7;
  const deckX0 = -1.5;
  const deckX1 = 1.5;
  const plankCount = 10;
  const plankWidth = (deckX1 - deckX0) / plankCount;
  const plankDepth = deckShoreEnd - deckSeaEnd;

  const deckMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a2a18,
    roughness: 0.9,
    metalness: 0.0,
    fog: false,
  });

  const plankGeo = new THREE.BoxGeometry(plankWidth - 0.02, 0.04, plankDepth);
  for (let i = 0; i < plankCount; i++) {
    const plank = new THREE.Mesh(plankGeo, deckMaterial);
    plank.position.set(
      deckX0 + plankWidth * (i + 0.5),
      deckY,
      (deckSeaEnd + deckShoreEnd) / 2,
    );
    plank.castShadow = true;
    plank.receiveShadow = true;
    group.add(plank);
  }

  // --- Human figure (simple 3D box mannequin on deck, sea-end) ---
  const figureMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a, fog: false });
  const figureGroup = new THREE.Group();

  const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.38, 5);
  const legL = new THREE.Mesh(legGeo, figureMat);
  legL.position.set(-0.04, 0.19, 0);
  figureGroup.add(legL);
  const legR = new THREE.Mesh(legGeo, figureMat);
  legR.position.set(0.04, 0.19, 0);
  figureGroup.add(legR);

  const torsoGeo = new THREE.BoxGeometry(0.14, 0.25, 0.08);
  const torso = new THREE.Mesh(torsoGeo, figureMat);
  torso.position.set(0, 0.50, 0);
  figureGroup.add(torso);

  const armGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.28, 5);
  const armL = new THREE.Mesh(armGeo, figureMat);
  armL.position.set(-0.10, 0.46, 0);
  armL.rotation.z = 0.15;
  figureGroup.add(armL);
  const armR = new THREE.Mesh(armGeo, figureMat);
  armR.position.set(0.10, 0.46, 0);
  armR.rotation.z = -0.15;
  figureGroup.add(armR);

  const headGeo = new THREE.SphereGeometry(0.05, 6, 6);
  const head = new THREE.Mesh(headGeo, figureMat);
  head.position.set(0, 0.68, 0);
  figureGroup.add(head);

  figureGroup.position.set(0, deckY + 0.04, -1.75);
  group.add(figureGroup);

  scene.add(group);
  return { group, woodMaterial };
}
