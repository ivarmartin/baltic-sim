import * as THREE from 'three';

/**
 * Rocky island blockout (Askö) - grouped dodecahedrons rising above the water surface.
 * Placeholder geometry for prototyping.
 */
export function createIsland(scene: THREE.Scene): THREE.Group {
  const group = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({
    color: 0x5a5a50,
    roughness: 0.9,
    metalness: 0.0,
  });

  // Main rock mass
  const rocks: { radius: number; pos: [number, number, number]; squash: number }[] = [
    { radius: 2.0, pos: [0, 4.8, 3], squash: 0.4 },
    { radius: 1.5, pos: [1.5, 4.5, 2.5], squash: 0.5 },
    { radius: 1.2, pos: [-1.2, 4.6, 3.5], squash: 0.45 },
    { radius: 0.8, pos: [0.5, 5.2, 4], squash: 0.5 },
    { radius: 1.0, pos: [-0.5, 4.4, 2], squash: 0.55 },
    // Below-water base
    { radius: 2.5, pos: [0, 3.5, 3], squash: 0.5 },
    { radius: 1.8, pos: [1.0, 3.0, 2.5], squash: 0.6 },
  ];

  for (const { radius, pos, squash } of rocks) {
    const geo = new THREE.DodecahedronGeometry(radius, 1);

    // Distort vertices for organic shape
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      p.setX(i, p.getX(i) * (1 + (Math.random() - 0.5) * 0.25));
      p.setY(i, p.getY(i) * squash);
      p.setZ(i, p.getZ(i) * (1 + (Math.random() - 0.5) * 0.25));
    }
    geo.computeVertexNormals();

    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.rotation.set(Math.random() * 0.3, Math.random() * Math.PI * 2, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  group.visible = false;
  scene.add(group);
  return group;
}
