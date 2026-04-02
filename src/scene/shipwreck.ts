import * as THREE from 'three';

export interface ShipwreckResult {
  group: THREE.Group;
  material: THREE.MeshStandardMaterial;
}

/**
 * Centuries-old schooner wreck: keel, ribs, scattered planks and debris.
 * Built entirely from low-poly primitives for performance.
 */
export function createShipwreck(scene: THREE.Scene): ShipwreckResult {
  const group = new THREE.Group();

  // Aged, dark waterlogged wood
  const material = new THREE.MeshStandardMaterial({
    color: 0x3a3020,
    roughness: 0.95,
    metalness: 0.0,
  });

  // --- Keel (backbone lying on seabed) ---
  const keelLength = 5;
  const keelGeo = new THREE.CylinderGeometry(0.08, 0.1, keelLength, 6);
  keelGeo.rotateZ(Math.PI / 2); // lay horizontal along X
  const keel = new THREE.Mesh(keelGeo, material);
  keel.position.set(0, 0.06, 0);
  keel.castShadow = true;
  keel.receiveShadow = true;
  group.add(keel);

  // --- Ribs (curved frames arching up from keel) ---
  const ribCount = 7;
  const ribSpacing = keelLength / (ribCount + 1);
  // Shared rib curve - a half-arch
  const ribCurvePoints = [];
  for (let i = 0; i <= 8; i++) {
    const t = (i / 8) * Math.PI; // 0 to PI
    ribCurvePoints.push(new THREE.Vector3(0, Math.sin(t) * 0.9, Math.cos(t) * 0.6));
  }
  const ribCurve = new THREE.CatmullRomCurve3(ribCurvePoints);
  const ribGeo = new THREE.TubeGeometry(ribCurve, 8, 0.03, 4, false);

  for (let i = 0; i < ribCount; i++) {
    const xPos = -keelLength / 2 + ribSpacing * (i + 1);
    // Vary height - ribs near bow/stern are shorter (broken off)
    const distFromCenter = Math.abs(xPos) / (keelLength / 2);
    const heightScale = 1.0 - distFromCenter * 0.5;

    // Some ribs only have one side remaining
    const hasBothSides = i % 3 !== 0;

    // Port side rib
    const ribPort = new THREE.Mesh(ribGeo, material);
    ribPort.position.set(xPos, 0.06, 0);
    ribPort.scale.set(1, heightScale, 1);
    ribPort.castShadow = true;
    group.add(ribPort);

    // Starboard side (mirrored)
    if (hasBothSides) {
      const ribStarboard = new THREE.Mesh(ribGeo, material);
      ribStarboard.position.set(xPos, 0.06, 0);
      ribStarboard.scale.set(1, heightScale, -1);
      ribStarboard.castShadow = true;
      group.add(ribStarboard);
    }
  }

  // --- Stem post (angled bow timber) ---
  const stemGeo = new THREE.CylinderGeometry(0.05, 0.07, 1.2, 5);
  const stem = new THREE.Mesh(stemGeo, material);
  stem.position.set(keelLength / 2, 0.4, 0);
  stem.rotation.z = 0.4; // lean forward
  stem.castShadow = true;
  group.add(stem);

  // --- Scattered planks (hull remnants & debris) ---
  const plankGeo = new THREE.BoxGeometry(0.8, 0.02, 0.12);
  const plankPositions: [number, number, number, number, number, number][] = [
    // x, y, z, rotX, rotY, rotZ
    [-0.6, 0.02, 0.8, 0.05, 0.3, 0],
    [0.4, 0.01, -0.9, -0.03, -0.5, 0.1],
    [1.5, 0.02, 0.4, 0, 1.2, 0.05],
    [-1.8, 0.01, -0.5, 0.04, 0.8, -0.08],
    [0.8, 0.02, 1.2, 0, -0.2, 0.15],
    [-0.3, 0.03, -1.4, 0.06, 0.6, 0],
  ];

  for (const [px, py, pz, rx, ry, rz] of plankPositions) {
    const plank = new THREE.Mesh(plankGeo, material);
    plank.position.set(px, py, pz);
    plank.rotation.set(rx, ry, rz);
    // Vary plank size slightly
    const s = 0.7 + Math.random() * 0.6;
    plank.scale.set(s, 1, 0.8 + Math.random() * 0.4);
    plank.receiveShadow = true;
    group.add(plank);
  }

  // --- Small debris (barrel stave, broken timber, etc.) ---
  const debrisGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.5, 5);
  const debrisPositions: [number, number, number, number][] = [
    // x, z, rotX, rotZ
    [1.0, 1.0, 0.3, 1.2],
    [-1.2, 0.7, -0.1, 0.5],
    [2.0, -0.3, 0.5, -0.8],
    [-0.5, -1.1, 0.2, 1.8],
  ];

  for (const [dx, dz, rx, rz] of debrisPositions) {
    const debris = new THREE.Mesh(debrisGeo, material);
    debris.position.set(dx, 0.02, dz);
    debris.rotation.set(rx, 0, rz);
    debris.receiveShadow = true;
    group.add(debris);
  }

  // Position the wreck on the seabed, away from the jetty
  group.position.set(5, 0, -6);
  group.rotation.y = -0.3; // slight angle for natural look

  scene.add(group);
  return { group, material };
}
