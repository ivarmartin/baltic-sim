import * as THREE from 'three';

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

  // Pole positions: 2 rows of 3 poles
  const polePositions: [number, number][] = [
    [-1.2, -2], [0, -2], [1.2, -2],
    [-1.2, -3.2], [0, -3.2], [1.2, -3.2],
  ];

  const poleBottom = -0.5;
  const poleTop = deckY + 0.02; // poles reach up to the deck
  const poleHeight = poleTop - poleBottom;
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.11, poleHeight, 8);

  for (const [px, pz] of polePositions) {
    const pole = new THREE.Mesh(poleGeo, woodMaterial);
    pole.position.set(px, poleBottom + poleHeight / 2, pz);
    pole.castShadow = true;
    pole.receiveShadow = true;
    group.add(pole);
  }

  // Horizontal cross-beams between poles in each row
  const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6);
  beamGeo.rotateZ(Math.PI / 2);

  for (const beamY of [1.5, 3.0]) {
    for (const rowZ of [-2, -3.2]) {
      // Beams connecting adjacent poles in X direction
      for (const bx of [-0.6, 0.6]) {
        const beam = new THREE.Mesh(beamGeo, woodMaterial);
        beam.position.set(bx, beamY, rowZ);
        beam.castShadow = true;
        group.add(beam);
      }
    }
  }

  // Cross-beams connecting front and back rows
  const crossGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6);
  crossGeo.rotateX(Math.PI / 2);

  for (const crossY of [1.5, 3.0]) {
    for (const cx of [-1.2, 0, 1.2]) {
      const cross = new THREE.Mesh(crossGeo, woodMaterial);
      cross.position.set(cx, crossY, -2.6);
      cross.castShadow = true;
      group.add(cross);
    }
  }

  // --- Ladder ---
  const ladderGroup = new THREE.Group();
  const railGeo = new THREE.BoxGeometry(0.04, 4, 0.04);
  const rungGeo = new THREE.BoxGeometry(0.04, 0.03, 0.38);

  // Two vertical rails
  const leftRail = new THREE.Mesh(railGeo, woodMaterial);
  leftRail.position.set(-0.19, 2, 0);
  ladderGroup.add(leftRail);

  const rightRail = new THREE.Mesh(railGeo, woodMaterial);
  rightRail.position.set(0.19, 2, 0);
  ladderGroup.add(rightRail);

  // Rungs
  for (let i = 0; i < 9; i++) {
    const rung = new THREE.Mesh(rungGeo, woodMaterial);
    rung.position.set(0, 0.3 + i * 0.45, 0);
    rung.castShadow = true;
    ladderGroup.add(rung);
  }

  // Attach ladder to front-center pole
  ladderGroup.position.set(0, 0, -1.85);
  group.add(ladderGroup);

  // --- Planked deck on top of poles ---
  const deckZ0 = -1.7; // front edge (slightly beyond front pole row)
  const deckZ1 = -3.5; // back edge (slightly beyond back pole row)
  const deckX0 = -1.5; // left edge
  const deckX1 = 1.5;  // right edge
  const plankCount = 10;
  const plankWidth = (deckX1 - deckX0) / plankCount;
  const plankDepth = Math.abs(deckZ1 - deckZ0);
  const plankGeo = new THREE.BoxGeometry(plankWidth - 0.02, 0.04, plankDepth);

  // Separate dark material for deck planks - fog disabled so they read as
  // dark silhouettes when viewed from below through the water surface.
  const deckMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a2a18,
    roughness: 0.9,
    metalness: 0.0,
    fog: false,
  });

  for (let i = 0; i < plankCount; i++) {
    const plank = new THREE.Mesh(plankGeo, deckMaterial);
    plank.position.set(
      deckX0 + plankWidth * (i + 0.5),
      deckY,
      (deckZ0 + deckZ1) / 2,
    );
    plank.castShadow = true;
    plank.receiveShadow = true;
    group.add(plank);
  }

  // --- Human figure (simple 3D box mannequin on deck) ---
  const figureMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a, fog: false });
  const figureGroup = new THREE.Group();

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.38, 5);
  const legL = new THREE.Mesh(legGeo, figureMat);
  legL.position.set(-0.04, 0.19, 0);
  figureGroup.add(legL);
  const legR = new THREE.Mesh(legGeo, figureMat);
  legR.position.set(0.04, 0.19, 0);
  figureGroup.add(legR);

  // Torso
  const torsoGeo = new THREE.BoxGeometry(0.14, 0.25, 0.08);
  const torso = new THREE.Mesh(torsoGeo, figureMat);
  torso.position.set(0, 0.50, 0);
  figureGroup.add(torso);

  // Arms
  const armGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.28, 5);
  const armL = new THREE.Mesh(armGeo, figureMat);
  armL.position.set(-0.10, 0.46, 0);
  armL.rotation.z = 0.15;
  figureGroup.add(armL);
  const armR = new THREE.Mesh(armGeo, figureMat);
  armR.position.set(0.10, 0.46, 0);
  armR.rotation.z = -0.15;
  figureGroup.add(armR);

  // Head
  const headGeo = new THREE.SphereGeometry(0.05, 6, 6);
  const head = new THREE.Mesh(headGeo, figureMat);
  head.position.set(0, 0.68, 0);
  figureGroup.add(head);

  figureGroup.position.set(0, deckY + 0.04, -1.75);
  group.add(figureGroup);

  scene.add(group);
  return { group, woodMaterial };
}
