import * as THREE from 'three';

const PERCH_COUNT = 3;

/**
 * Build a procedural European perch geometry.
 * Perch are 25-35cm, deep-bodied with a humped back, two dorsal fins,
 * dark vertical bars, and reddish-orange lower fins.
 */
function createPerchGeometry(): THREE.BufferGeometry {
  const segsAround = 10;
  const bodyLength = 1.0;

  // Perch profile: deep-bodied, high dorsal hump, laterally compressed
  // [z-normalized, xRadius (lateral), yRadius (dorso-ventral)]
  const profile: [number, number, number][] = [
    [0.00, 0.01, 0.02],  // mouth tip
    [0.04, 0.04, 0.07],  // snout
    [0.10, 0.08, 0.14],  // head
    [0.18, 0.11, 0.22],  // behind head - body deepens
    [0.28, 0.12, 0.28],  // front body - high dorsal hump
    [0.40, 0.13, 0.30],  // max depth
    [0.52, 0.12, 0.27],  // mid body
    [0.64, 0.10, 0.22],  // rear body
    [0.75, 0.07, 0.16],  // narrowing
    [0.84, 0.04, 0.10],  // tail peduncle
    [0.92, 0.02, 0.06],  // tail base
    [1.00, 0.00, 0.00],  // tail tip
  ];

  const vertices: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  // Generate body vertices with stripe coloring
  for (let s = 0; s < profile.length; s++) {
    const [zNorm, xR, yR] = profile[s];
    const z = zNorm * bodyLength;

    for (let a = 0; a < segsAround; a++) {
      const angle = (a / segsAround) * Math.PI * 2;
      const x = Math.cos(angle) * xR;
      const y = Math.sin(angle) * yR;
      vertices.push(x, y, z);

      // Perch coloring: olive-green back, golden-yellow sides, white belly
      // with dark vertical bars
      const isTop = Math.sin(angle) > 0.3;
      const isBottom = Math.sin(angle) < -0.5;

      // Vertical bar pattern: dark stripes at regular intervals
      const barFreq = 7.0;
      const bar = Math.pow(Math.abs(Math.sin(zNorm * barFreq * Math.PI)), 8.0);
      const barDarken = bar * 0.3;

      let r: number, g: number, b: number;
      if (isTop) {
        // Dark olive-green back
        r = 0.18 - barDarken;
        g = 0.28 - barDarken;
        b = 0.12 - barDarken;
      } else if (isBottom) {
        // Pale belly with hint of orange-red (perch have reddish lower fins/belly)
        r = 0.75 - barDarken * 0.5;
        g = 0.60 - barDarken * 0.5;
        b = 0.45 - barDarken * 0.5;
      } else {
        // Golden-yellow sides with dark vertical bars
        r = 0.55 - barDarken;
        g = 0.50 - barDarken;
        b = 0.20 - barDarken;
      }

      colors.push(Math.max(0, r), Math.max(0, g), Math.max(0, b));
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

  // --- Tail fin (forked) ---
  const tailBaseIdx = vertices.length / 3;
  const tailZ = bodyLength;

  vertices.push(0, 0, tailZ - 0.06); colors.push(0.3, 0.35, 0.15); // base
  vertices.push(-0.10, 0.12, tailZ + 0.14); colors.push(0.25, 0.30, 0.12); // upper lobe
  vertices.push(0, 0.02, tailZ + 0.08); colors.push(0.28, 0.32, 0.14); // center notch
  vertices.push(0.10, 0.12, tailZ + 0.14); colors.push(0.25, 0.30, 0.12); // upper lobe right
  vertices.push(-0.10, -0.12, tailZ + 0.14); colors.push(0.6, 0.35, 0.15); // lower lobe (reddish)
  vertices.push(0, -0.02, tailZ + 0.08); colors.push(0.5, 0.35, 0.18); // center notch bottom
  vertices.push(0.10, -0.12, tailZ + 0.14); colors.push(0.6, 0.35, 0.15); // lower lobe right

  // Upper fork
  indices.push(tailBaseIdx, tailBaseIdx + 1, tailBaseIdx + 2);
  indices.push(tailBaseIdx, tailBaseIdx + 2, tailBaseIdx + 3);
  // Lower fork
  indices.push(tailBaseIdx, tailBaseIdx + 4, tailBaseIdx + 5);
  indices.push(tailBaseIdx, tailBaseIdx + 5, tailBaseIdx + 6);

  // --- First dorsal fin (tall, spiny - the distinctive perch feature) ---
  const dorsal1Idx = vertices.length / 3;
  const d1Start = 0.20;
  const d1End = 0.48;
  const d1Height = 0.18;
  const d1Steps = 6;

  // Base vertices along the back
  for (let i = 0; i <= d1Steps; i++) {
    const t = i / d1Steps;
    const z = d1Start + t * (d1End - d1Start);
    const yBase = profile[Math.floor(t * 4 + 2)]?.[2] ?? 0.25;
    vertices.push(0, yBase * 0.9, z);
    colors.push(0.15, 0.22, 0.10);
  }
  // Top vertices (fin edge)
  for (let i = 0; i <= d1Steps; i++) {
    const t = i / d1Steps;
    const z = d1Start + t * (d1End - d1Start);
    // Fin shape: rises then falls, with a dip at the very front
    const envelope = Math.sin(t * Math.PI) * (0.8 + 0.2 * t);
    vertices.push(0, 0.28 + envelope * d1Height, z);
    colors.push(0.12, 0.18, 0.08);
  }
  // Faces
  for (let i = 0; i < d1Steps; i++) {
    const bl = dorsal1Idx + i;
    const br = dorsal1Idx + i + 1;
    const tl = dorsal1Idx + d1Steps + 1 + i;
    const tr = dorsal1Idx + d1Steps + 1 + i + 1;
    indices.push(bl, br, tl);
    indices.push(br, tr, tl);
  }

  // --- Second dorsal fin (smaller, soft-rayed) ---
  const dorsal2Idx = vertices.length / 3;
  const d2Start = 0.52;
  const d2End = 0.66;

  vertices.push(0, 0.24, d2Start); colors.push(0.18, 0.25, 0.12);
  vertices.push(0, 0.24, d2End); colors.push(0.18, 0.25, 0.12);
  vertices.push(0, 0.34, (d2Start + d2End) / 2); colors.push(0.15, 0.20, 0.10);
  indices.push(dorsal2Idx, dorsal2Idx + 1, dorsal2Idx + 2);

  // --- Anal fin (reddish-orange - distinctive perch feature) ---
  const analIdx = vertices.length / 3;
  vertices.push(0, -0.20, 0.55); colors.push(0.7, 0.30, 0.10);
  vertices.push(0, -0.20, 0.68); colors.push(0.7, 0.30, 0.10);
  vertices.push(0, -0.30, 0.60); colors.push(0.8, 0.35, 0.12);
  indices.push(analIdx, analIdx + 1, analIdx + 2);

  // --- Pectoral fins (orange-tinted) ---
  for (const side of [-1, 1]) {
    const finIdx = vertices.length / 3;
    vertices.push(side * 0.11, -0.04, 0.16); colors.push(0.65, 0.40, 0.15);
    vertices.push(side * 0.11, -0.04, 0.24); colors.push(0.65, 0.40, 0.15);
    vertices.push(side * 0.20, -0.10, 0.20); colors.push(0.70, 0.45, 0.18);
    indices.push(finIdx, finIdx + 1, finIdx + 2);
  }

  // --- Pelvic fins (red-orange) ---
  for (const side of [-1, 1]) {
    const finIdx = vertices.length / 3;
    vertices.push(side * 0.08, -0.18, 0.22); colors.push(0.75, 0.30, 0.10);
    vertices.push(side * 0.08, -0.18, 0.30); colors.push(0.75, 0.30, 0.10);
    vertices.push(side * 0.14, -0.26, 0.26); colors.push(0.80, 0.35, 0.12);
    indices.push(finIdx, finIdx + 1, finIdx + 2);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  // Realistic scale: 25-35cm body length
  geo.scale(0.30, 0.30, 0.30);

  return geo;
}

/**
 * Generate a perch swim path — perch patrol near structures (jetty, rocks).
 */
function generatePerchPath(): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = [];
  const count = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    points.push(new THREE.Vector3(
      (Math.random() - 0.5) * 6,
      0.4 + Math.random() * 1.8,
      (Math.random() - 0.5) * 6,
    ));
  }
  return new THREE.CatmullRomCurve3(points, true);
}

interface PerchInstance {
  mesh: THREE.Mesh;
  geometry: THREE.BufferGeometry;
  basePositions: Float32Array;
  path: THREE.CatmullRomCurve3;
  t: number;
  speed: number;
  swimPhase: number;
  bodyScale: number;
}

export function createPerch(scene: THREE.Scene): (elapsed: number, dt: number) => void {
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.35,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  const fishes: PerchInstance[] = [];

  for (let i = 0; i < PERCH_COUNT; i++) {
    const geometry = createPerchGeometry();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;

    const basePositions = new Float32Array(geometry.attributes.position.array);

    // Size variation: 0.85x to 1.2x (roughly 25-35cm)
    const scale = 0.85 + Math.random() * 0.35;
    mesh.scale.setScalar(scale);

    const fish: PerchInstance = {
      mesh,
      geometry,
      basePositions,
      path: generatePerchPath(),
      t: Math.random(),
      speed: 0.008 + Math.random() * 0.006, // slower than sticklebacks
      swimPhase: Math.random() * Math.PI * 2,
      bodyScale: 0.30,
    };

    scene.add(mesh);
    fishes.push(fish);
  }

  const _tangent = new THREE.Vector3();
  const _lookAt = new THREE.Vector3();

  return function updatePerch(elapsed: number, dt: number) {
    for (const fish of fishes) {
      // Advance along path
      fish.t = (fish.t + fish.speed * dt) % 1;
      const pos = fish.path.getPointAt(fish.t);
      fish.mesh.position.copy(pos);

      // Orient along path tangent (subtract because mesh -Z faces lookAt target, but nose is +Z)
      fish.path.getTangentAt(fish.t, _tangent);
      _lookAt.copy(pos).sub(_tangent);
      fish.mesh.lookAt(_lookAt);

      // Body undulation — perch have a stiffer swim, less tail amplitude than small fish
      const posAttr = fish.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      const base = fish.basePositions;

      for (let v = 0; v < posAttr.count; v++) {
        const i3 = v * 3;
        const bz = base[i3 + 2];
        const zNorm = bz / fish.bodyScale; // 0 at nose, ~1 at tail
        const amplitude = zNorm * zNorm * 0.012;
        const wave = Math.sin(elapsed * 5 + fish.swimPhase - zNorm * Math.PI * 2);
        arr[i3] = base[i3] + wave * amplitude;
      }

      posAttr.needsUpdate = true;

      // Occasionally pick a new patrol route
      if (Math.random() < 0.0003) {
        fish.path = generatePerchPath();
        fish.t = 0;
      }
    }
  };
}
