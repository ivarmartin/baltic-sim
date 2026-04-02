import * as THREE from 'three';

/**
 * Filamentous algae: thin bright-green strands smothering rocks/bladderwrack.
 * Stage 2 - The Underwater Forest.
 */

function createStrandGeometry(length: number): THREE.BufferGeometry {
  const segments = 8;
  const vertices: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * length;
    const width = 0.003 * (1 - t * 0.3); // tapers slightly
    const drift = Math.sin(t * 3) * 0.02; // droopy curve

    vertices.push(drift - width, y, 0);
    vertices.push(drift + width, y, 0);

    if (i < segments) {
      const base = i * 2;
      indices.push(base, base + 1, base + 2);
      indices.push(base + 1, base + 3, base + 2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export interface FilamentousAlgaeResult {
  group: THREE.Group;
  update: (elapsed: number) => void;
}

export function createFilamentousAlgae(scene: THREE.Scene, rockPositions: THREE.Vector3[]): FilamentousAlgaeResult {
  const group = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({
    color: 0x4a8a2a,
    roughness: 0.6,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
  });

  // Shader for sway
  let shaderRef: { uniforms: Record<string, THREE.IUniform> } | null = null;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
      uniform float uTime;`,
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      float yNorm = max(transformed.y, 0.0) / 0.3;
      transformed.x += sin(uTime * 2.0 + modelMatrix[3][0] * 3.0 + transformed.y * 5.0) * yNorm * 0.03;
      transformed.z += cos(uTime * 1.5 + modelMatrix[3][2] * 2.0) * yNorm * 0.02;`,
    );
    shaderRef = shader;
  };

  // Place strands on rocks that are within the Stage 2 area (near origin)
  const stage2Rocks = rockPositions.filter(
    (p) => Math.abs(p.x) < 5 && Math.abs(p.z) < 5,
  );

  for (const rockPos of stage2Rocks) {
    const strandCount = 6 + Math.floor(Math.random() * 8);
    for (let i = 0; i < strandCount; i++) {
      const length = 0.08 + Math.random() * 0.15;
      const geo = createStrandGeometry(length);
      const strand = new THREE.Mesh(geo, material);
      strand.position.set(
        rockPos.x + (Math.random() - 0.5) * 0.3,
        rockPos.y + 0.05 + Math.random() * 0.15,
        rockPos.z + (Math.random() - 0.5) * 0.3,
      );
      strand.rotation.y = Math.random() * Math.PI * 2;
      strand.rotation.z = (Math.random() - 0.5) * 0.4;
      group.add(strand);
    }
  }

  // Also scatter some on open seabed near bladderwrack area
  for (let i = 0; i < 15; i++) {
    const length = 0.06 + Math.random() * 0.12;
    const geo = createStrandGeometry(length);
    const strand = new THREE.Mesh(geo, material);
    strand.position.set(
      (Math.random() - 0.5) * 6,
      0.02 + Math.random() * 0.1,
      (Math.random() - 0.5) * 6,
    );
    strand.rotation.y = Math.random() * Math.PI * 2;
    strand.rotation.z = (Math.random() - 0.5) * 0.5;
    group.add(strand);
  }

  group.visible = false;
  scene.add(group);

  function update(elapsed: number) {
    if (shaderRef) shaderRef.uniforms.uTime.value = elapsed;
  }

  return { group, update };
}
