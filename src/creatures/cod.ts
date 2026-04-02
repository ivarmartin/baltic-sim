import * as THREE from 'three';

/**
 * Procedural Atlantic cod + ghost wireframe variant.
 * Body cross-section extrusion along Z axis, same pattern as stickleback.
 */

function createCodGeometry(): THREE.BufferGeometry {
  const segsAround = 8;
  const bodyLength = 1.0;

  // Cod profile: rounder, larger body than stickleback
  const profile: [number, number, number][] = [
    [0.00, 0.02, 0.03],  // nose tip
    [0.04, 0.08, 0.10],  // snout
    [0.10, 0.14, 0.18],  // head
    [0.20, 0.20, 0.26],  // behind head - wider
    [0.35, 0.24, 0.30],  // front body
    [0.50, 0.22, 0.28],  // mid body (max girth)
    [0.65, 0.18, 0.24],  // rear body
    [0.75, 0.12, 0.18],  // narrowing
    [0.83, 0.07, 0.12],  // tail peduncle start
    [0.90, 0.04, 0.07],  // tail peduncle
    [0.95, 0.02, 0.04],  // tail base
    [1.00, 0.00, 0.00],  // tail tip
  ];

  const vertices: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let s = 0; s < profile.length; s++) {
    const [zNorm, xR, yR] = profile[s];
    const z = zNorm * bodyLength;

    for (let a = 0; a < segsAround; a++) {
      const angle = (a / segsAround) * Math.PI * 2;
      const x = Math.cos(angle) * xR;
      const y = Math.sin(angle) * yR;
      vertices.push(x, y, z);

      // Cod colors: greenish-brown on top, pale belly, dark lateral line
      const topness = Math.max(0, Math.sin(angle));
      const r = 0.40 + (1 - topness) * 0.35;
      const g = 0.38 + (1 - topness) * 0.30;
      const b = 0.28 + (1 - topness) * 0.25;
      colors.push(r, g, b);
    }
  }

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

  // Tail fin
  const tailBaseIdx = vertices.length / 3;
  const tailZ = bodyLength;
  const tailSpread = 0.12;
  const tailLength = 0.15;

  vertices.push(0, 0, tailZ - 0.08); colors.push(0.45, 0.42, 0.35);
  vertices.push(-tailSpread, tailSpread * 0.7, tailZ + tailLength); colors.push(0.4, 0.38, 0.3);
  vertices.push(0, 0, tailZ + tailLength * 0.7); colors.push(0.4, 0.38, 0.3);
  vertices.push(tailSpread, tailSpread * 0.7, tailZ + tailLength); colors.push(0.4, 0.38, 0.3);
  vertices.push(-tailSpread, -tailSpread * 0.7, tailZ + tailLength); colors.push(0.5, 0.48, 0.4);
  vertices.push(tailSpread, -tailSpread * 0.7, tailZ + tailLength); colors.push(0.5, 0.48, 0.4);

  indices.push(tailBaseIdx, tailBaseIdx + 1, tailBaseIdx + 2);
  indices.push(tailBaseIdx, tailBaseIdx + 2, tailBaseIdx + 3);
  indices.push(tailBaseIdx, tailBaseIdx + 4, tailBaseIdx + 2);
  indices.push(tailBaseIdx, tailBaseIdx + 2, tailBaseIdx + 5);

  // Dorsal fin (single long fin)
  const dorsalIdx = vertices.length / 3;
  vertices.push(-0.01, 0.28, 0.25); colors.push(0.38, 0.36, 0.28);
  vertices.push(0.01, 0.28, 0.25); colors.push(0.38, 0.36, 0.28);
  vertices.push(0, 0.36, 0.40); colors.push(0.42, 0.40, 0.32);
  vertices.push(-0.01, 0.24, 0.55); colors.push(0.38, 0.36, 0.28);
  vertices.push(0.01, 0.24, 0.55); colors.push(0.38, 0.36, 0.28);
  vertices.push(0, 0.30, 0.65); colors.push(0.42, 0.40, 0.32);

  indices.push(dorsalIdx, dorsalIdx + 1, dorsalIdx + 2);
  indices.push(dorsalIdx + 3, dorsalIdx + 4, dorsalIdx + 5);

  // Barbel (chin whisker - iconic cod feature)
  const barbelIdx = vertices.length / 3;
  vertices.push(0, -0.10, 0.06); colors.push(0.55, 0.52, 0.45);
  vertices.push(0.005, -0.10, 0.06); colors.push(0.55, 0.52, 0.45);
  vertices.push(0.002, -0.14, 0.03); colors.push(0.6, 0.58, 0.5);
  indices.push(barbelIdx, barbelIdx + 1, barbelIdx + 2);

  // Pectoral fins
  for (const side of [-1, 1]) {
    const finIdx = vertices.length / 3;
    const finZ = 0.18;
    vertices.push(side * 0.14, -0.03, finZ); colors.push(0.48, 0.45, 0.38);
    vertices.push(side * 0.14, -0.03, finZ + 0.08); colors.push(0.48, 0.45, 0.38);
    vertices.push(side * 0.24, -0.08, finZ + 0.04); colors.push(0.52, 0.50, 0.42);
    indices.push(finIdx, finIdx + 1, finIdx + 2);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  // Scale: ~45cm thin modern cod (still small compared to historical size)
  geo.scale(0.4, 0.4, 0.4);

  return geo;
}

/** Find the closest t parameter on a path to a target world position. */
function findClosestT(path: THREE.CatmullRomCurve3, target: THREE.Vector3): number {
  let bestT = 0;
  let bestDist = Infinity;
  for (let i = 0; i <= 200; i++) {
    const t = i / 200;
    const d = path.getPointAt(t).distanceTo(target);
    if (d < bestDist) {
      bestDist = d;
      bestT = t;
    }
  }
  return bestT;
}

/** Forward arc distance on the circular [0, 1) parameter ring. */
function forwardDist(current: number, target: number): number {
  return target >= current ? target - current : 1 - current + target;
}

/** Mark position for the cod hold - side-on to camera, close. */
const COD_MARK = new THREE.Vector3(3, -2.8, -15.5);

export interface CodResult {
  group: THREE.Group;
  update: (elapsed: number, dt: number) => void;
  material: THREE.MeshStandardMaterial;
  setHold: (hold: boolean) => void;
}

export function createCod(scene: THREE.Scene): CodResult {
  const group = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.4,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  // Real (small, thin) cod
  const codGeo = createCodGeometry();
  const codMesh = new THREE.Mesh(codGeo, material);
  codMesh.castShadow = true;
  group.add(codMesh);

  const basePositions = new Float32Array(codGeo.attributes.position.array);

  // Ghost outline: 1980s healthy cod (2x scale)
  const ghostGeo = createCodGeometry();
  const ghostMaterial = new THREE.MeshBasicMaterial({
    wireframe: true,
    transparent: true,
    opacity: 0.25,
    color: 0x88aacc,
  });
  const ghostMesh = new THREE.Mesh(ghostGeo, ghostMaterial);
  ghostMesh.scale.setScalar(2.0);
  group.add(ghostMesh);

  // Swim path near Stage 4 camera
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(4, -2.5, -15),
    new THREE.Vector3(3, -3.0, -16),
    new THREE.Vector3(2, -3.2, -17),
    new THREE.Vector3(1, -2.8, -16.5),
    new THREE.Vector3(2, -2.5, -15.5),
    new THREE.Vector3(3.5, -2.3, -14.5),
  ], true);

  let t = 0;
  const speed = 0.04;
  const swimPhase = Math.random() * Math.PI * 2;
  const _tangent = new THREE.Vector3();
  const _lookAt = new THREE.Vector3();

  // Hold state (decelerate-on-path, same as perch/stickleback)
  let holdRequested = false;
  let isHolding = false;
  const markT = findClosestT(path, COD_MARK);

  function setHold(value: boolean) {
    holdRequested = value;
    if (!value) isHolding = false;
  }

  function update(elapsed: number, dt: number) {
    if (holdRequested && !isHolding) {
      const dist = forwardDist(t, markT);
      if (dist < 0.002) {
        t = markT;
        isHolding = true;
      } else {
        let s = Math.max(speed, dist / 2.0);
        if (dist < 0.08) {
          s *= Math.max(dist / 0.08, 0.05);
        }
        t = (t + s * dt) % 1;
      }
    } else if (isHolding) {
      t = markT;
    } else {
      t = (t + speed * dt) % 1;
    }

    const pos = path.getPointAt(t);
    codMesh.position.copy(pos);

    // Ghost swims alongside, slightly offset
    ghostMesh.position.copy(pos);
    ghostMesh.position.x += 0.4;
    ghostMesh.position.y += 0.1;

    // Orient both along path
    path.getTangentAt(t, _tangent);
    _lookAt.copy(pos).sub(_tangent);
    codMesh.lookAt(_lookAt);

    _lookAt.copy(ghostMesh.position).sub(_tangent);
    ghostMesh.lookAt(_lookAt);

    // Body undulation on the real cod (reduced when holding)
    const posAttr = codGeo.attributes.position;
    const arr = posAttr.array as Float32Array;
    const holding = holdRequested || isHolding;
    for (let v = 0; v < posAttr.count; v++) {
      const i3 = v * 3;
      const bz = basePositions[i3 + 2];
      const zNorm = bz / 0.4;
      const amplitude = zNorm * zNorm * (holding ? 0.002 : 0.005);
      const wave = Math.sin(elapsed * (holding ? 2.5 : 5) + swimPhase - zNorm * Math.PI * 2);
      arr[i3] = basePositions[i3] + wave * amplitude;
    }
    posAttr.needsUpdate = true;
  }

  group.visible = false;
  scene.add(group);

  return { group, update, material, setHold };
}
