import * as THREE from 'three';

export interface CulvertResult {
  group: THREE.Group;
  concreteMaterial: THREE.MeshStandardMaterial;
  metalMaterial: THREE.MeshStandardMaterial;
}

/**
 * Creates a concrete culvert pipe with vertical iron bars (grate)
 * blocking the bay-facing opening. Positioned in the creek channel
 * at X ≈ 24, mostly submerged with the top just above waterline.
 */
export function createCulvert(scene: THREE.Scene): CulvertResult {
  const group = new THREE.Group();

  // --- Dimensions ---
  const outerRadius = 1.2;
  const wallThickness = 0.15;
  const innerRadius = outerRadius - wallThickness;
  const pipeLength = 20;

  // Position: creek center X=24, pushed well inland so pipe extends from bay into land
  // Center Y=4.0 → top at 5.2 (0.7 above water), bottom at 2.8
  const centerX = 24;
  const centerY = 4.0;
  const centerZ = 21.5;

  // --- Concrete material ---
  const concreteMaterial = new THREE.MeshStandardMaterial({
    color: 0x7a7a72,
    roughness: 0.95,
    metalness: 0.05,
  });

  // --- Pipe: hollow cylinder (outer shell) ---
  // Use a tube-like approach: outer cylinder - inner cylinder via two meshes
  // Outer cylinder
  const outerGeo = new THREE.CylinderGeometry(
    outerRadius, outerRadius, pipeLength, 24, 1, false,
  );
  // Rotate to lie along Z axis (default cylinder is along Y)
  outerGeo.rotateX(Math.PI / 2);

  const outerMesh = new THREE.Mesh(outerGeo, concreteMaterial);
  outerMesh.castShadow = true;
  outerMesh.receiveShadow = true;
  group.add(outerMesh);

  // Inner cylinder (slightly darker, represents the hollow interior)
  const innerMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3a35,
    roughness: 1.0,
    metalness: 0.0,
    side: THREE.BackSide,
  });

  const innerGeo = new THREE.CylinderGeometry(
    innerRadius, innerRadius, pipeLength + 0.02, 24, 1, false,
  );
  innerGeo.rotateX(Math.PI / 2);

  const innerMesh = new THREE.Mesh(innerGeo, innerMaterial);
  group.add(innerMesh);

  // --- End rings (concrete lip at each opening) ---
  const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 24);
  const bayRing = new THREE.Mesh(ringGeo, concreteMaterial);
  bayRing.position.set(0, 0, -pipeLength / 2);
  bayRing.receiveShadow = true;
  group.add(bayRing);

  const shoreRing = new THREE.Mesh(ringGeo.clone(), concreteMaterial);
  shoreRing.position.set(0, 0, pipeLength / 2);
  shoreRing.rotation.y = Math.PI; // face outward
  shoreRing.receiveShadow = true;
  group.add(shoreRing);

  // --- Iron grate (vertical bars) on bay-facing end ---
  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a28,
    roughness: 0.6,
    metalness: 0.8,
  });

  const barRadius = 0.035;
  const barCount = 7;
  const grateZ = -pipeLength / 2 - 0.01; // just in front of the bay opening
  const spacing = (innerRadius * 2) / (barCount + 1);

  for (let i = 1; i <= barCount; i++) {
    const barX = -innerRadius + i * spacing;
    // Each bar spans the full height of the circle at that X position
    // Height = 2 * sqrt(r² - x²)
    const halfH = Math.sqrt(
      Math.max(0, innerRadius * innerRadius - barX * barX),
    );
    const barHeight = halfH * 2;

    const barGeo = new THREE.CylinderGeometry(
      barRadius, barRadius, barHeight, 6,
    );
    const bar = new THREE.Mesh(barGeo, metalMaterial);
    bar.position.set(barX, 0, grateZ);
    bar.castShadow = true;
    group.add(bar);
  }

  // Horizontal frame bar across the top and bottom of the grate
  const frameRadius = 0.04;
  const frameWidth = innerRadius * 2;
  const frameGeo = new THREE.CylinderGeometry(
    frameRadius, frameRadius, frameWidth, 6,
  );
  frameGeo.rotateZ(Math.PI / 2); // horizontal

  const topFrame = new THREE.Mesh(frameGeo, metalMaterial);
  topFrame.position.set(0, innerRadius * 0.85, grateZ);
  topFrame.castShadow = true;
  group.add(topFrame);

  const bottomFrame = new THREE.Mesh(frameGeo.clone(), metalMaterial);
  bottomFrame.position.set(0, -innerRadius * 0.85, grateZ);
  bottomFrame.castShadow = true;
  group.add(bottomFrame);

  // Middle horizontal frame bar
  const midFrame = new THREE.Mesh(frameGeo.clone(), metalMaterial);
  midFrame.position.set(0, 0, grateZ);
  midFrame.castShadow = true;
  group.add(midFrame);

  // --- Position the whole group in the scene ---
  group.position.set(centerX, centerY, centerZ);

  scene.add(group);

  return { group, concreteMaterial, metalMaterial };
}
