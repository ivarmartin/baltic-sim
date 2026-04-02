import * as THREE from 'three';

/**
 * Creates a single bladderwrack frond as a flat ribbon that forks once.
 */
function createFrondGeometry(height: number, width: number): THREE.BufferGeometry {
  const segments = 10;
  const vertices: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];

  // Main stem
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * height;
    const w = width * (0.5 + 0.5 * Math.sin(t * Math.PI)); // wider in middle
    const xOffset = Math.sin(t * 2.5) * width * 0.3; // slight natural curve

    vertices.push(xOffset - w / 2, y, 0);
    vertices.push(xOffset + w / 2, y, 0);
    normals.push(0, 0, 1, 0, 0, 1);

    if (i < segments) {
      const base = i * 2;
      indices.push(base, base + 1, base + 2);
      indices.push(base + 1, base + 3, base + 2);
    }
  }

  // Fork: two short branches diverging from ~60% up the stem
  const forkStart = Math.floor(segments * 0.6);
  const forkBaseIdx = vertices.length / 3;
  const branchSegs = 5;

  for (let side = -1; side <= 1; side += 2) {
    const baseVertIdx = vertices.length / 3;
    const forkY = (forkStart / segments) * height;
    const forkX = Math.sin((forkStart / segments) * 2.5) * width * 0.3;

    for (let i = 0; i <= branchSegs; i++) {
      const t = i / branchSegs;
      const y = forkY + t * height * 0.4;
      const branchW = width * 0.7 * (1 - t * 0.6);
      const xOff = forkX + side * t * width * 1.5;

      vertices.push(xOff - branchW / 2, y, side * t * 0.02);
      vertices.push(xOff + branchW / 2, y, side * t * 0.02);
      normals.push(0, 0, 1, 0, 0, 1);

      if (i < branchSegs) {
        const base = baseVertIdx + i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a clump of bladderwrack fronds at a given position.
 */
function createClump(position: THREE.Vector3, material: THREE.MeshStandardMaterial): THREE.Group {
  const clump = new THREE.Group();
  const frondCount = 3 + Math.floor(Math.random() * 4);

  for (let i = 0; i < frondCount; i++) {
    const height = 0.25 + Math.random() * 0.3;
    const width = 0.025 + Math.random() * 0.02;
    const geo = createFrondGeometry(height, width);

    const frond = new THREE.Mesh(geo, material);
    frond.position.set(
      (Math.random() - 0.5) * 0.1,
      0,
      (Math.random() - 0.5) * 0.1,
    );
    frond.rotation.y = Math.random() * Math.PI * 2;
    frond.rotation.z = (Math.random() - 0.5) * 0.2;
    clump.add(frond);
  }

  // Air bladders at branch tips
  const bladderGeo = new THREE.SphereGeometry(0.01, 4, 4);
  for (let i = 0; i < 2; i++) {
    const bladder = new THREE.Mesh(bladderGeo, material);
    bladder.position.set(
      (Math.random() - 0.5) * 0.08,
      0.3 + Math.random() * 0.15,
      (Math.random() - 0.5) * 0.06,
    );
    clump.add(bladder);
  }

  clump.position.copy(position);
  return clump;
}

export interface BladderwrackResult {
  update: (elapsed: number, dt: number) => void;
  material: THREE.MeshStandardMaterial;
}

export function createBladderwrack(
  scene: THREE.Scene,
  rockPositions: THREE.Vector3[],
): BladderwrackResult {
  // Material with sway animation via onBeforeCompile
  const material = new THREE.MeshStandardMaterial({
    color: 0x3a4a1a,
    roughness: 0.7,
    side: THREE.DoubleSide,
  });

  // Store shader reference for time uniform updates
  let shaderRef: { uniforms: Record<string, THREE.IUniform> } | null = null;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };

    // Inject varying and uniform declarations
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
      uniform float uTime;
      `,
    );

    // Inject sway displacement before the project_vertex include
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      // Sway: base stays anchored, tips move most
      float yNorm = max(transformed.y, 0.0) / 0.5;
      float sway = sin(uTime * 1.5 + transformed.y * 3.0 + modelMatrix[3][0] * 2.0) * yNorm * 0.04;
      float swayZ = cos(uTime * 1.1 + transformed.y * 2.5 + modelMatrix[3][2] * 1.5) * yNorm * 0.025;
      transformed.x += sway;
      transformed.z += swayZ;
      `,
    );

    shaderRef = shader;
  };

  const clumps: THREE.Group[] = [];

  // Place on rocks
  for (const rockPos of rockPositions) {
    if (Math.random() > 0.6) continue; // Not every rock gets seaweed
    const clump = createClump(rockPos, material);
    scene.add(clump);
    clumps.push(clump);
  }

  // Place along jetty pole bases
  const jettyBasePositions = [
    new THREE.Vector3(-1.2, 0, -2),
    new THREE.Vector3(0, 0, -2),
    new THREE.Vector3(1.2, 0, -2),
    new THREE.Vector3(-1.2, 0, -3.2),
    new THREE.Vector3(1.2, 0, -3.2),
  ];

  for (const pos of jettyBasePositions) {
    if (Math.random() > 0.4) continue;
    const clump = createClump(pos, material);
    scene.add(clump);
    clumps.push(clump);
  }

  // Scatter some on the open seabed
  for (let i = 0; i < 8; i++) {
    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * 10,
      0,
      (Math.random() - 0.5) * 10,
    );
    const clump = createClump(pos, material);
    scene.add(clump);
    clumps.push(clump);
  }

  // Dense cluster in the bladderwrack camera's field of view (chapter 1, stage 2)
  for (let i = 0; i < 25; i++) {
    const pos = new THREE.Vector3(
      -0.5 + Math.random() * 2.5,   // x: -0.5 to 2.0
      0,
      -2.5 + Math.random() * 2.5,   // z: -2.5 to 0.0
    );
    const clump = createClump(pos, material);
    scene.add(clump);
    clumps.push(clump);
  }

  const updateBladderwrack = function updateBladderwrack(elapsed: number, _dt: number) {
    if (shaderRef) {
      shaderRef.uniforms.uTime.value = elapsed;
    }
  };

  return { update: updateBladderwrack, material };
}
