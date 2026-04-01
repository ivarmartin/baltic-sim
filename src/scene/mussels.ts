import * as THREE from 'three';

/**
 * Mussel clusters attached to the shipwreck for Stage 6.
 */
export function createMussels(scene: THREE.Scene, shipwreckPosition: THREE.Vector3): THREE.Group {
  const group = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({
    color: 0x1a1a30,
    roughness: 0.6,
    metalness: 0.2,
  });

  const shellGeo = new THREE.SphereGeometry(0.015, 4, 4);

  // Create 4 clusters
  const clusterOffsets: [number, number, number][] = [
    [0.3, 0.4, 0.2],
    [-0.5, 0.3, -0.1],
    [1.2, 0.2, 0.4],
    [-0.8, 0.5, 0.3],
  ];

  for (const [cx, cy, cz] of clusterOffsets) {
    const count = 8 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i++) {
      const shell = new THREE.Mesh(shellGeo, material);
      shell.position.set(
        cx + (Math.random() - 0.5) * 0.08,
        cy + (Math.random() - 0.5) * 0.06,
        cz + (Math.random() - 0.5) * 0.08,
      );
      shell.scale.set(
        0.8 + Math.random() * 0.6,
        0.5 + Math.random() * 0.4,
        0.8 + Math.random() * 0.6,
      );
      group.add(shell);
    }
  }

  group.position.copy(shipwreckPosition);
  group.visible = false;
  scene.add(group);
  return group;
}
