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

  // Pole positions: 2 rows of 3 poles
  const polePositions: [number, number][] = [
    [-1.2, -2], [0, -2], [1.2, -2],
    [-1.2, -3.2], [0, -3.2], [1.2, -3.2],
  ];

  const poleHeight = 6;
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.11, poleHeight, 8);

  for (const [px, pz] of polePositions) {
    const pole = new THREE.Mesh(poleGeo, woodMaterial);
    pole.position.set(px, poleHeight / 2 - 0.5, pz);
    pole.castShadow = true;
    pole.receiveShadow = true;
    group.add(pole);
  }

  // Horizontal cross-beams between poles in each row
  const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6);
  beamGeo.rotateZ(Math.PI / 2);

  for (const beamY of [2.5, 4.0]) {
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

  for (const crossY of [2.5, 4.0]) {
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

  scene.add(group);
  return { group, woodMaterial };
}
