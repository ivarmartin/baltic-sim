import * as THREE from 'three';

/**
 * Dead zone floor: dark barren mud plane for Stage 5.
 */
export function createDeadZone(scene: THREE.Scene): THREE.Group {
  const group = new THREE.Group();

  // Dark mud floor
  const floorGeo = new THREE.PlaneGeometry(30, 30, 8, 8);
  floorGeo.rotateX(-Math.PI / 2);

  const material = new THREE.MeshStandardMaterial({
    color: 0x1a1510,
    roughness: 1.0,
    metalness: 0.0,
  });

  const floor = new THREE.Mesh(floorGeo, material);
  floor.position.set(2, -8.5, -22);
  floor.receiveShadow = true;
  group.add(floor);

  group.visible = false;
  scene.add(group);
  return group;
}
