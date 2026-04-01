import * as THREE from 'three';

/**
 * Thin reeds growing from the seabed for Stage 3 (shallow bay).
 * Also includes a small stickleback nest made of plant fibers.
 */

export interface ReedsResult {
  group: THREE.Group;
  update: (elapsed: number) => void;
}

export function createReeds(scene: THREE.Scene, center: THREE.Vector3): ReedsResult {
  const group = new THREE.Group();

  const reedMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a6a2a,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });

  // Shader for reed sway
  let shaderRef: { uniforms: Record<string, THREE.IUniform> } | null = null;
  reedMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
      uniform float uTime;`,
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      float yNorm = max(transformed.y, 0.0) / 1.5;
      float sway = sin(uTime * 1.2 + modelMatrix[3][0] * 2.0 + transformed.y * 2.0) * yNorm * 0.06;
      transformed.x += sway;
      transformed.z += cos(uTime * 0.9 + modelMatrix[3][2] * 1.5) * yNorm * 0.03;`,
    );
    shaderRef = shader;
  };

  // Create 25 reeds in a cluster
  for (let i = 0; i < 25; i++) {
    const height = 0.8 + Math.random() * 0.7;
    const geo = new THREE.CylinderGeometry(0.005, 0.008, height, 4);
    geo.translate(0, height / 2, 0);

    const reed = new THREE.Mesh(geo, reedMaterial);
    reed.position.set(
      center.x + (Math.random() - 0.5) * 3,
      center.y,
      center.z + (Math.random() - 0.5) * 3,
    );
    reed.rotation.z = (Math.random() - 0.5) * 0.15;
    group.add(reed);
  }

  // Stickleback nest: small cluster of plant fiber on the bottom
  const nestMaterial = new THREE.MeshStandardMaterial({
    color: 0x6a5a30,
    roughness: 1.0,
  });

  const nestGroup = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const length = 0.03 + Math.random() * 0.04;
    const fiberGeo = new THREE.CylinderGeometry(0.002, 0.002, length, 3);
    const fiber = new THREE.Mesh(fiberGeo, nestMaterial);
    fiber.position.set(
      (Math.random() - 0.5) * 0.05,
      0.01 + Math.random() * 0.02,
      (Math.random() - 0.5) * 0.05,
    );
    fiber.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI,
    );
    nestGroup.add(fiber);
  }
  nestGroup.position.set(center.x - 1, center.y, center.z - 1);
  group.add(nestGroup);

  group.visible = false;
  scene.add(group);

  function update(elapsed: number) {
    if (shaderRef) shaderRef.uniforms.uTime.value = elapsed;
  }

  return { group, update };
}
