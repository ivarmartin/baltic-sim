import * as THREE from 'three';

const FISH_COUNT = 6;

/**
 * Build a procedural three-spined stickleback fish geometry.
 * Cross-section extrusion along Z axis with vertex colors.
 */
function createFishGeometry(): THREE.BufferGeometry {
  const segsAlong = 12; // cross-sections along body
  const segsAround = 8; // vertices per cross-section
  const bodyLength = 1.0;

  // Body profile: [z-normalized, xRadius, yRadius]
  const profile: [number, number, number][] = [
    [0.00, 0.02, 0.03],  // nose tip
    [0.05, 0.06, 0.08],  // snout
    [0.12, 0.10, 0.14],  // head
    [0.22, 0.12, 0.18],  // behind head
    [0.35, 0.13, 0.20],  // front body
    [0.50, 0.12, 0.19],  // mid body (max girth)
    [0.62, 0.10, 0.16],  // rear body
    [0.72, 0.07, 0.12],  // narrowing
    [0.80, 0.04, 0.08],  // tail peduncle start
    [0.88, 0.02, 0.05],  // tail peduncle
    [0.94, 0.01, 0.03],  // tail base
    [1.00, 0.00, 0.00],  // tail tip
  ];

  const vertices: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  // Generate body vertices
  for (let s = 0; s < profile.length; s++) {
    const [zNorm, xR, yR] = profile[s];
    const z = zNorm * bodyLength;

    for (let a = 0; a < segsAround; a++) {
      const angle = (a / segsAround) * Math.PI * 2;
      const x = Math.cos(angle) * xR;
      const y = Math.sin(angle) * yR;
      vertices.push(x, y, z);

      // Vertex colors: dark olive-green on top, silvery on belly
      const topness = Math.max(0, Math.sin(angle)); // 1 at top, 0 at sides/bottom
      const r = 0.35 + (1 - topness) * 0.35;
      const g = 0.42 + (1 - topness) * 0.30;
      const b = 0.30 + (1 - topness) * 0.25;
      colors.push(r, g, b);
    }
  }

  // Generate body faces
  for (let s = 0; s < profile.length - 1; s++) {
    for (let a = 0; a < segsAround; a++) {
      const curr = s * segsAround + a;
      const next = s * segsAround + (a + 1) % segsAround;
      const currNext = (s + 1) * segsAround + a;
      const nextNext = (s + 1) * segsAround + (a + 1) % segsAround;

      indices.push(curr, next, currNext);
      indices.push(next, nextNext, currNext);
    }
  }

  // Tail fin: a flat fan at the end
  const tailBaseIdx = vertices.length / 3;
  const tailZ = bodyLength;
  const tailSpread = 0.08;
  const tailLength = 0.12;

  // 5 tail fan vertices
  vertices.push(0, 0, tailZ - 0.06); colors.push(0.5, 0.55, 0.45); // base center
  vertices.push(-tailSpread, tailSpread * 0.7, tailZ + tailLength); colors.push(0.45, 0.5, 0.4);
  vertices.push(0, 0, tailZ + tailLength * 0.8); colors.push(0.45, 0.5, 0.4);
  vertices.push(tailSpread, tailSpread * 0.7, tailZ + tailLength); colors.push(0.45, 0.5, 0.4);
  vertices.push(-tailSpread, -tailSpread * 0.7, tailZ + tailLength); colors.push(0.55, 0.6, 0.5);
  vertices.push(tailSpread, -tailSpread * 0.7, tailZ + tailLength); colors.push(0.55, 0.6, 0.5);

  // Tail triangles
  indices.push(tailBaseIdx, tailBaseIdx + 1, tailBaseIdx + 2);
  indices.push(tailBaseIdx, tailBaseIdx + 2, tailBaseIdx + 3);
  indices.push(tailBaseIdx, tailBaseIdx + 4, tailBaseIdx + 2);
  indices.push(tailBaseIdx, tailBaseIdx + 2, tailBaseIdx + 5);

  // Dorsal spines (3 thin triangles on top)
  for (let i = 0; i < 3; i++) {
    const spineIdx = vertices.length / 3;
    const sz = 0.28 + i * 0.1;
    const spineH = 0.06 + Math.random() * 0.03;

    vertices.push(-0.005, 0.18, sz); colors.push(0.4, 0.45, 0.35);
    vertices.push(0.005, 0.18, sz); colors.push(0.4, 0.45, 0.35);
    vertices.push(0, 0.18 + spineH, sz + 0.01); colors.push(0.45, 0.5, 0.4);

    indices.push(spineIdx, spineIdx + 1, spineIdx + 2);
  }

  // Pectoral fins (small triangles on each side)
  for (const side of [-1, 1]) {
    const finIdx = vertices.length / 3;
    const finZ = 0.2;

    vertices.push(side * 0.10, -0.02, finZ); colors.push(0.5, 0.55, 0.45);
    vertices.push(side * 0.10, -0.02, finZ + 0.06); colors.push(0.5, 0.55, 0.45);
    vertices.push(side * 0.18, -0.06, finZ + 0.03); colors.push(0.55, 0.6, 0.5);

    indices.push(finIdx, finIdx + 1, finIdx + 2);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  // Realistic scale: ~5-8cm
  geo.scale(0.06, 0.06, 0.06);

  return geo;
}

/**
 * Generate a random swim path as a CatmullRomCurve3.
 */
function generatePath(): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = [];
  const count = 5 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    points.push(new THREE.Vector3(
      (Math.random() - 0.5) * 8,
      0.3 + Math.random() * 2.0,
      (Math.random() - 0.5) * 8,
    ));
  }
  return new THREE.CatmullRomCurve3(points, true);
}

interface FishInstance {
  mesh: THREE.Mesh;
  geometry: THREE.BufferGeometry;
  basePositions: Float32Array;
  path: THREE.CatmullRomCurve3;
  t: number;
  speed: number;
  swimPhase: number;
}

export function createSticklebacks(scene: THREE.Scene): (elapsed: number, dt: number) => void {
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.4,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  const fishes: FishInstance[] = [];

  for (let i = 0; i < FISH_COUNT; i++) {
    const geometry = createFishGeometry();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;

    const basePositions = new Float32Array(geometry.attributes.position.array);

    const fish: FishInstance = {
      mesh,
      geometry,
      basePositions,
      path: generatePath(),
      t: Math.random(),
      speed: 0.015 + Math.random() * 0.01,
      swimPhase: Math.random() * Math.PI * 2,
    };

    // Slight size variation
    const scale = 0.8 + Math.random() * 0.5;
    mesh.scale.setScalar(scale);

    scene.add(mesh);
    fishes.push(fish);
  }

  const _tangent = new THREE.Vector3();
  const _lookAt = new THREE.Vector3();

  return function updateFish(elapsed: number, dt: number) {
    for (const fish of fishes) {
      // Advance along path
      fish.t = (fish.t + fish.speed * dt) % 1;
      const pos = fish.path.getPointAt(fish.t);
      fish.mesh.position.copy(pos);

      // Orient along path tangent
      fish.path.getTangentAt(fish.t, _tangent);
      _lookAt.copy(pos).add(_tangent);
      fish.mesh.lookAt(_lookAt);

      // Body undulation: sinusoidal wave along Z with increasing amplitude
      const posAttr = fish.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      const base = fish.basePositions;

      for (let v = 0; v < posAttr.count; v++) {
        const i3 = v * 3;
        const bz = base[i3 + 2]; // base Z position
        // Normalize Z (body is 0 to ~0.06 after scaling)
        const zNorm = bz / 0.06; // 0 at nose, ~1 at tail
        const amplitude = zNorm * zNorm * 0.0025;
        const wave = Math.sin(elapsed * 8 + fish.swimPhase - zNorm * Math.PI * 2);
        arr[i3] = base[i3] + wave * amplitude; // displace X
      }

      posAttr.needsUpdate = true;

      // Generate new path when loop completes (already handled by modulo, but regenerate occasionally)
      if (Math.random() < 0.0005) {
        fish.path = generatePath();
        fish.t = 0;
      }
    }
  };
}
