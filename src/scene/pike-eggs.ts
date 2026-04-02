import * as THREE from 'three';

/**
 * Pike egg cluster - small translucent spheres on vegetation.
 * Visible in pike chapter Stage 3 (Stickleback Invasion).
 */

export interface PikeEggsResult {
  group: THREE.Group;
}

export function createPikeEggs(scene: THREE.Scene, center: THREE.Vector3): PikeEggsResult {
  const group = new THREE.Group();

  const eggMat = new THREE.MeshStandardMaterial({
    color: 0xd4c888,
    roughness: 0.2,
    metalness: 0.0,
    transparent: true,
    opacity: 0.6,
  });

  // Small plant stem that eggs are attached to
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x4a6a2a,
    roughness: 0.8,
  });
  const stemGeo = new THREE.CylinderGeometry(0.004, 0.006, 0.15, 4);
  stemGeo.translate(0, 0.075, 0);
  const stem = new THREE.Mesh(stemGeo, stemMat);
  group.add(stem);

  // Cluster of ~25 tiny eggs
  const eggGeo = new THREE.SphereGeometry(0.008, 5, 4);
  for (let i = 0; i < 25; i++) {
    const egg = new THREE.Mesh(eggGeo, eggMat);
    // Cluster around the stem in a rough ball shape
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const r = 0.015 + Math.random() * 0.02;
    egg.position.set(
      Math.sin(phi) * Math.cos(theta) * r,
      0.04 + Math.sin(phi) * Math.sin(theta) * r * 0.6 + Math.random() * 0.04,
      Math.cos(phi) * r,
    );
    group.add(egg);
  }

  // A second smaller cluster nearby
  const cluster2 = new THREE.Group();
  const stem2 = new THREE.Mesh(stemGeo.clone(), stemMat);
  cluster2.add(stem2);
  for (let i = 0; i < 15; i++) {
    const egg = new THREE.Mesh(eggGeo, eggMat);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const r = 0.012 + Math.random() * 0.015;
    egg.position.set(
      Math.sin(phi) * Math.cos(theta) * r,
      0.03 + Math.sin(phi) * Math.sin(theta) * r * 0.6 + Math.random() * 0.03,
      Math.cos(phi) * r,
    );
    cluster2.add(egg);
  }
  cluster2.position.set(0.15, 0, 0.1);
  group.add(cluster2);

  group.position.copy(center);
  group.visible = false;
  scene.add(group);

  return { group };
}
