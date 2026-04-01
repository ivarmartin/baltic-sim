import * as THREE from 'three';

/**
 * Shipworm visualization + bore holes on the shipwreck for Stage 6.
 */
export function createShipworm(scene: THREE.Scene, shipwreckPosition: THREE.Vector3): THREE.Group {
  const group = new THREE.Group();

  // Bore holes: dark circles on wood surfaces
  const holeGeo = new THREE.CircleGeometry(0.008, 8);
  const holeMaterial = new THREE.MeshBasicMaterial({
    color: 0x0a0a0a,
    side: THREE.DoubleSide,
  });

  const holePositions: [number, number, number, number, number][] = [
    // x, y, z, rotX, rotY
    [0.3, 0.08, 0.5, -Math.PI / 2, 0],
    [0.5, 0.08, 0.3, -Math.PI / 2, 0],
    [-0.2, 0.08, 0.7, -Math.PI / 2, 0],
    [0.8, 0.08, -0.2, -Math.PI / 2, 0],
    [1.0, 0.08, 0.1, -Math.PI / 2, 0],
    [-0.5, 0.08, -0.3, -Math.PI / 2, 0],
    [0.1, 0.08, -0.8, -Math.PI / 2, 0],
    [0.6, 0.08, 0.8, -Math.PI / 2, 0],
  ];

  for (const [hx, hy, hz, rx, ry] of holePositions) {
    const hole = new THREE.Mesh(holeGeo, holeMaterial);
    hole.position.set(hx, hy, hz);
    hole.rotation.set(rx, ry, 0);
    group.add(hole);
  }

  // Shipworm: thin white tube emerging from a bore hole
  const wormCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.3, 0.08, 0.5),
    new THREE.Vector3(0.3, 0.12, 0.5),
    new THREE.Vector3(0.28, 0.18, 0.52),
    new THREE.Vector3(0.32, 0.22, 0.48),
    new THREE.Vector3(0.3, 0.28, 0.5),
  ]);

  const wormGeo = new THREE.TubeGeometry(wormCurve, 12, 0.004, 5, false);
  const wormMaterial = new THREE.MeshStandardMaterial({
    color: 0xeeeadd,
    roughness: 0.5,
    metalness: 0.0,
  });

  const worm = new THREE.Mesh(wormGeo, wormMaterial);
  group.add(worm);

  // Second smaller worm
  const worm2Curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.2, 0.08, 0.7),
    new THREE.Vector3(-0.2, 0.11, 0.71),
    new THREE.Vector3(-0.22, 0.15, 0.69),
    new THREE.Vector3(-0.19, 0.18, 0.72),
  ]);

  const worm2Geo = new THREE.TubeGeometry(worm2Curve, 8, 0.003, 5, false);
  const worm2 = new THREE.Mesh(worm2Geo, wormMaterial);
  group.add(worm2);

  group.position.copy(shipwreckPosition);
  group.visible = false;
  scene.add(group);
  return group;
}
