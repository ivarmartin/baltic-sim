import * as THREE from 'three';

/**
 * Drained wetland blockout — conveys lost pike nursery habitat.
 * Dry brown/grey ground, concrete channel, sparse dead vegetation stubs.
 */

export interface WetlandResult {
  group: THREE.Group;
}

export function createWetland(scene: THREE.Scene, center: THREE.Vector3): WetlandResult {
  const group = new THREE.Group();

  // Ground — dry, cracked-looking flat plane
  const groundGeo = new THREE.PlaneGeometry(8, 6, 8, 6);
  groundGeo.rotateX(-Math.PI / 2);
  // Add slight undulation to ground
  const posAttr = groundGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const y = posAttr.getY(i);
    posAttr.setY(i, y + (Math.random() - 0.5) * 0.08);
  }
  posAttr.needsUpdate = true;
  groundGeo.computeVertexNormals();

  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x6a5a40,
    roughness: 1.0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.receiveShadow = true;
  group.add(ground);

  // Concrete channel — straightened ditch
  const channelWidth = 0.6;
  const channelDepth = 0.3;
  const channelLength = 7;

  const channelMat = new THREE.MeshStandardMaterial({
    color: 0x8a8a82,
    roughness: 0.9,
  });

  // Channel floor
  const floorGeo = new THREE.BoxGeometry(channelWidth, 0.05, channelLength);
  const floor = new THREE.Mesh(floorGeo, channelMat);
  floor.position.set(0, -channelDepth, 0);
  floor.receiveShadow = true;
  group.add(floor);

  // Channel walls
  const wallGeo = new THREE.BoxGeometry(0.08, channelDepth, channelLength);
  const leftWall = new THREE.Mesh(wallGeo, channelMat);
  leftWall.position.set(-channelWidth / 2, -channelDepth / 2, 0);
  leftWall.castShadow = true;
  group.add(leftWall);

  const rightWall = new THREE.Mesh(wallGeo.clone(), channelMat);
  rightWall.position.set(channelWidth / 2, -channelDepth / 2, 0);
  rightWall.castShadow = true;
  group.add(rightWall);

  // Dead vegetation stubs — short broken cylinders
  const stubMat = new THREE.MeshStandardMaterial({
    color: 0x5a4a30,
    roughness: 1.0,
  });

  for (let i = 0; i < 15; i++) {
    const height = 0.05 + Math.random() * 0.15;
    const stubGeo = new THREE.CylinderGeometry(0.008, 0.012, height, 4);
    stubGeo.translate(0, height / 2, 0);
    const stub = new THREE.Mesh(stubGeo, stubMat);
    stub.position.set(
      (Math.random() - 0.5) * 6,
      0,
      (Math.random() - 0.5) * 4,
    );
    // Avoid placing stubs in the channel
    if (Math.abs(stub.position.x) < channelWidth) continue;
    stub.rotation.z = (Math.random() - 0.5) * 0.4;
    group.add(stub);
  }

  // A few scattered dry dirt mounds
  for (let i = 0; i < 5; i++) {
    const moundGeo = new THREE.SphereGeometry(0.15 + Math.random() * 0.2, 5, 4);
    moundGeo.scale(1, 0.3, 1);
    const mound = new THREE.Mesh(moundGeo, groundMat);
    mound.position.set(
      (Math.random() - 0.5) * 5,
      0,
      (Math.random() - 0.5) * 3,
    );
    group.add(mound);
  }

  group.position.copy(center);
  group.visible = false;
  scene.add(group);

  return { group };
}
