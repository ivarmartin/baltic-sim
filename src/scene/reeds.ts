import * as THREE from 'three';

/**
 * Thin reeds growing from the seabed for Stage 3 (shallow bay).
 * Also includes a small stickleback nest made of plant fibers.
 */

export interface ReedsResult {
  group: THREE.Group;
  update: (elapsed: number) => void;
  setPikePos: (pos: THREE.Vector3) => void;
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
    shader.uniforms.uPikePos = { value: new THREE.Vector3(0, -100, 0) };
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
      uniform float uTime;
      uniform vec3 uPikePos;`,
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      float yNorm = max(transformed.y, 0.0) / 5.0;
      float sway = sin(uTime * 1.2 + modelMatrix[3][0] * 2.0 + transformed.y * 2.0) * yNorm * 0.12;
      transformed.x += sway;
      transformed.z += cos(uTime * 0.9 + modelMatrix[3][2] * 1.5) * yNorm * 0.07;
      // Pike avoidance – push reed tips aside
      vec3 wPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
      vec2 away = wPos.xz - uPikePos.xz;
      float pikeDist = length(away);
      float pushStr = (1.0 - smoothstep(0.0, 1.0, pikeDist)) * yNorm * 0.4;
      vec2 pDir = pikeDist > 0.001 ? normalize(away) : vec2(0.0);
      transformed.x += pDir.x * pushStr;
      transformed.z += pDir.y * pushStr;`,
    );
    shaderRef = shader;
  };

  // Dense reed bed – tall enough to break the surface (Y ≈ 4.5)
  for (let i = 0; i < 80; i++) {
    const height = 4.0 + Math.random() * 2.0;  // 4–6 m, surface at 4.5
    const geo = new THREE.CylinderGeometry(0.005, 0.008, height, 4);
    geo.translate(0, height / 2, 0);

    const reed = new THREE.Mesh(geo, reedMaterial);
    reed.position.set(
      center.x + (Math.random() - 0.5) * 5,
      center.y,
      center.z + (Math.random() - 0.5) * 5,
    );
    reed.rotation.z = (Math.random() - 0.5) * 0.1;
    group.add(reed);
  }

  // Reed backdrop behind the pike (visible from pike chapter camera)
  for (let i = 0; i < 40; i++) {
    const rz = -9.5 + (Math.random() - 0.5) * 3;
    // Match seabed slope: ground drops 0.4 per unit below Z=-8
    const groundY = rz < -8 ? -(-rz - 8) * 0.4 : 0;
    const height = 4.0 + Math.random() * 2.0 - groundY; // taller to compensate
    const geo = new THREE.CylinderGeometry(0.005, 0.008, height, 4);
    geo.translate(0, height / 2, 0);

    const reed = new THREE.Mesh(geo, reedMaterial);
    reed.position.set(
      -12.5 + (Math.random() - 0.5) * 3,
      groundY,
      rz,
    );
    reed.rotation.z = (Math.random() - 0.5) * 0.1;
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

  function setPikePos(pos: THREE.Vector3) {
    if (shaderRef) shaderRef.uniforms.uPikePos.value.copy(pos);
  }

  return { group, update, setPikePos };
}
