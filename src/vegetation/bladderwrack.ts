import * as THREE from 'three';

/**
 * Appends a ribbon strip to shared vertex/index/normal arrays.
 */
function addRibbon(
  vertices: number[],
  indices: number[],
  normals: number[],
  segs: number,
  getPoint: (t: number) => [number, number, number],
  getWidth: (t: number) => number,
) {
  const baseIdx = vertices.length / 3;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const [x, y, z] = getPoint(t);
    const w = getWidth(t);
    vertices.push(x - w / 2, y, z);
    vertices.push(x + w / 2, y, z);
    normals.push(0, 0, 1, 0, 0, 1);
    if (i < segs) {
      const base = baseIdx + i * 2;
      indices.push(base, base + 1, base + 2);
      indices.push(base + 1, base + 3, base + 2);
    }
  }
}

/**
 * Creates a single bladderwrack frond with multi-level forking.
 * Main stem → 2 branches → 2 sub-branches each (4 tips total).
 */
function createFrondGeometry(height: number, width: number): THREE.BufferGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];

  // Main stem – 12 segments
  addRibbon(vertices, indices, normals, 12,
    (t) => [
      Math.sin(t * 2.5) * width * 0.4,
      t * height,
      0,
    ],
    (t) => width * (0.5 + 0.5 * Math.sin(t * Math.PI)),
  );

  // Primary fork at ~55% up the stem → 2 branches
  const forkT = 0.55;
  const forkY = forkT * height;
  const forkX = Math.sin(forkT * 2.5) * width * 0.4;

  for (let side = -1; side <= 1; side += 2) {
    const branchLen = height * 0.35;
    const branchSpread = width * 2.0;
    const branchEndX = forkX + side * branchSpread;
    const branchEndY = forkY + branchLen;
    const branchEndZ = side * 0.04;

    addRibbon(vertices, indices, normals, 6,
      (t) => [
        forkX + side * t * branchSpread,
        forkY + t * branchLen,
        side * t * 0.04,
      ],
      (t) => width * 0.7 * (1 - t * 0.5),
    );

    // Secondary fork → 2 sub-branches per branch
    for (let subSide = -1; subSide <= 1; subSide += 2) {
      const subLen = height * 0.18;
      const subSpread = width * 1.2;

      addRibbon(vertices, indices, normals, 4,
        (t) => [
          branchEndX + subSide * t * subSpread,
          branchEndY + t * subLen,
          branchEndZ + subSide * t * 0.025,
        ],
        (t) => width * 0.45 * (1 - t * 0.6),
      );
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
  const frondCount = 4 + Math.floor(Math.random() * 4); // 4–7 fronds

  for (let i = 0; i < frondCount; i++) {
    const height = Math.max(0.3, 0.75 + Math.random() * 0.75 + (Math.random() - 0.5) * 1.0);  // ±0.5m noise
    const width = (0.04 + Math.random() * 0.035) * (0.7 + Math.random() * 0.6); // ±30% noise
    const geo = createFrondGeometry(height, width);

    const frond = new THREE.Mesh(geo, material);
    frond.position.set(
      (Math.random() - 0.5) * 0.3,
      0,
      (Math.random() - 0.5) * 0.3,
    );
    frond.rotation.y = Math.random() * Math.PI * 2;
    frond.rotation.z = (Math.random() - 0.5) * 0.15;
    clump.add(frond);
  }

  clump.position.copy(position);
  return clump;
}

export interface BladderwrackResult {
  update: (elapsed: number, dt: number) => void;
  material: THREE.MeshStandardMaterial;
  setPikePos: (pos: THREE.Vector3) => void;
}

export function createBladderwrack(
  scene: THREE.Scene,
  rockPositions: THREE.Vector3[],
): BladderwrackResult {
  const material = new THREE.MeshStandardMaterial({
    color: 0x3a4a1a,
    roughness: 0.7,
    side: THREE.DoubleSide,
  });

  let shaderRef: { uniforms: Record<string, THREE.IUniform> } | null = null;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uPikePos = { value: new THREE.Vector3(0, -100, 0) };

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
      uniform float uTime;
      uniform vec3 uPikePos;
      `,
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      // Sway: base stays anchored, tips move most
      float yNorm = max(transformed.y, 0.0) / 1.5;
      float sway = sin(uTime * 1.2 + transformed.y * 2.0 + modelMatrix[3][0] * 2.0) * yNorm * 0.15;
      float swayZ = cos(uTime * 0.9 + transformed.y * 1.8 + modelMatrix[3][2] * 1.5) * yNorm * 0.1;
      transformed.x += sway;
      transformed.z += swayZ;
      // Pike avoidance – push frond tips aside
      vec3 wPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
      vec2 away = wPos.xz - uPikePos.xz;
      float pikeDist = length(away);
      float pushStr = (1.0 - smoothstep(0.0, 0.8, pikeDist)) * yNorm * 0.25;
      vec2 pDir = pikeDist > 0.001 ? normalize(away) : vec2(0.0);
      transformed.x += pDir.x * pushStr;
      transformed.z += pDir.y * pushStr;
      `,
    );

    shaderRef = shader;
  };

  const clumps: THREE.Group[] = [];

  function addClump(pos: THREE.Vector3) {
    const clump = createClump(pos, material);
    scene.add(clump);
    clumps.push(clump);
  }

  // ── Existing placements ───────────────────────────────────

  // Place on rocks
  for (const rockPos of rockPositions) {
    if (Math.random() > 0.6) continue;
    addClump(rockPos);
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
    if (Math.random() > 0.3) continue;
    addClump(pos);
  }

  // Dense cluster in the bladderwrack camera's field of view (chapter 1, stage 2)
  for (let i = 0; i < 30; i++) {
    addClump(new THREE.Vector3(
      -0.5 + Math.random() * 2.5,
      0,
      -2.5 + Math.random() * 2.5,
    ));
  }

  // ── Scattered patches around active camera areas ──────────

  // Stickleback / Pike / Seal bay – bladderwrack fills old reed area
  for (let i = 0; i < 12; i++) {
    addClump(new THREE.Vector3(
      -12 + Math.random() * 6,
      0,
      -9 + Math.random() * 5,
    ));
  }

  // Shipwreck area (shallow environment)
  for (let i = 0; i < 10; i++) {
    addClump(new THREE.Vector3(
      4 + Math.random() * 5,
      0,
      -7 + Math.random() * 4,
    ));
  }

  // Wetland / Lost Nurseries area
  for (let i = 0; i < 10; i++) {
    addClump(new THREE.Vector3(
      14 + Math.random() * 4,
      0,
      Math.random() * 5,
    ));
  }

  // Restored Wetland / Pike fry area
  for (let i = 0; i < 10; i++) {
    addClump(new THREE.Vector3(
      18 + Math.random() * 4,
      0,
      -8 + Math.random() * 4,
    ));
  }

  // General shallow-seabed scatter (avoid deep / dead zones)
  for (let i = 0; i < 15; i++) {
    addClump(new THREE.Vector3(
      (Math.random() - 0.5) * 30,
      0,
      -8 + Math.random() * 16,
    ));
  }

  const updateBladderwrack = function updateBladderwrack(elapsed: number, _dt: number) {
    if (shaderRef) {
      shaderRef.uniforms.uTime.value = elapsed;
    }
  };

  function setPikePos(pos: THREE.Vector3) {
    if (shaderRef) shaderRef.uniforms.uPikePos.value.copy(pos);
  }

  return { update: updateBladderwrack, material, setPikePos };
}
