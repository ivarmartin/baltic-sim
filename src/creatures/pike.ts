import * as THREE from 'three';

/**
 * Simple pike blockout — elongated predator fish lurking in Stage 3 background.
 */

function createPikeGeometry(): THREE.BufferGeometry {
  const segsAround = 8;
  const bodyLength = 1.0;

  // Pike profile: long, narrow, torpedo-shaped with flat snout
  const profile: [number, number, number][] = [
    [0.00, 0.04, 0.03],  // nose tip (flat, duck-bill-like)
    [0.06, 0.06, 0.05],  // snout
    [0.14, 0.08, 0.08],  // head
    [0.25, 0.10, 0.12],  // behind head
    [0.40, 0.11, 0.14],  // front body
    [0.55, 0.11, 0.14],  // mid body (long and even)
    [0.70, 0.10, 0.13],  // rear body
    [0.80, 0.08, 0.10],  // narrowing
    [0.88, 0.05, 0.07],  // tail peduncle
    [0.94, 0.03, 0.04],  // tail base
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

      // Pike colors: dark green-brown with lighter belly, yellow-green speckles
      const topness = Math.max(0, Math.sin(angle));
      const r = 0.25 + (1 - topness) * 0.40;
      const g = 0.35 + (1 - topness) * 0.30;
      const b = 0.15 + (1 - topness) * 0.25;
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

  // Tail fin (pike has a large tail set far back)
  const tailBaseIdx = vertices.length / 3;
  const tailZ = bodyLength;
  const tailSpread = 0.10;
  const tailLength = 0.14;

  vertices.push(0, 0, tailZ - 0.06); colors.push(0.3, 0.38, 0.2);
  vertices.push(-tailSpread, tailSpread * 0.8, tailZ + tailLength); colors.push(0.28, 0.35, 0.18);
  vertices.push(0, 0, tailZ + tailLength * 0.7); colors.push(0.28, 0.35, 0.18);
  vertices.push(tailSpread, tailSpread * 0.8, tailZ + tailLength); colors.push(0.28, 0.35, 0.18);
  vertices.push(-tailSpread, -tailSpread * 0.8, tailZ + tailLength); colors.push(0.35, 0.42, 0.22);
  vertices.push(tailSpread, -tailSpread * 0.8, tailZ + tailLength); colors.push(0.35, 0.42, 0.22);

  indices.push(tailBaseIdx, tailBaseIdx + 1, tailBaseIdx + 2);
  indices.push(tailBaseIdx, tailBaseIdx + 2, tailBaseIdx + 3);
  indices.push(tailBaseIdx, tailBaseIdx + 4, tailBaseIdx + 2);
  indices.push(tailBaseIdx, tailBaseIdx + 2, tailBaseIdx + 5);

  // Dorsal fin (set far back, near tail)
  const dorsalIdx = vertices.length / 3;
  vertices.push(-0.01, 0.13, 0.72); colors.push(0.28, 0.36, 0.18);
  vertices.push(0.01, 0.13, 0.72); colors.push(0.28, 0.36, 0.18);
  vertices.push(0, 0.20, 0.82); colors.push(0.32, 0.40, 0.22);
  indices.push(dorsalIdx, dorsalIdx + 1, dorsalIdx + 2);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  // Scale: ~80cm realistic pike size
  geo.scale(0.7, 0.7, 0.7);

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

/** Mark position for pike hold — side-on to camera, close. */
const PIKE_MARK = new THREE.Vector3(-11, 0.8, -8);

export interface PikeResult {
  group: THREE.Group;
  update: (elapsed: number, dt: number) => void;
  material: THREE.MeshStandardMaterial;
  setHold: (hold: boolean) => void;
}

export function createPike(scene: THREE.Scene, position: THREE.Vector3): PikeResult {
  const group = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.35,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  const geometry = createPikeGeometry();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  group.add(mesh);

  const basePositions = new Float32Array(geometry.attributes.position.array);

  // Very slow patrol path — pike lurks mostly motionless
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(position.x - 0.5, position.y, position.z - 0.5),
    new THREE.Vector3(position.x, position.y + 0.1, position.z),
    new THREE.Vector3(position.x + 0.5, position.y, position.z + 0.5),
    new THREE.Vector3(position.x, position.y - 0.1, position.z),
  ], true);

  let t = 0;
  const speed = 0.01; // very slow
  const swimPhase = Math.random() * Math.PI * 2;
  const _tangent = new THREE.Vector3();
  const _lookAt = new THREE.Vector3();

  // Hold state (decelerate-on-path, same as perch/stickleback)
  let holdRequested = false;
  let isHolding = false;
  const markT = findClosestT(path, PIKE_MARK);

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
        let s = speed;
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
    mesh.position.copy(pos);

    path.getTangentAt(t, _tangent);
    _lookAt.copy(pos).sub(_tangent);
    mesh.lookAt(_lookAt);

    // Subtle body undulation (always active — pike breathes)
    const holding = holdRequested || isHolding;
    const posAttr = geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    for (let v = 0; v < posAttr.count; v++) {
      const i3 = v * 3;
      const bz = basePositions[i3 + 2];
      const zNorm = bz / 0.7;
      const amplitude = zNorm * zNorm * (holding ? 0.001 : 0.003);
      const wave = Math.sin(elapsed * (holding ? 1.5 : 3) + swimPhase - zNorm * Math.PI * 2);
      arr[i3] = basePositions[i3] + wave * amplitude;
    }
    posAttr.needsUpdate = true;
  }

  group.visible = false;
  scene.add(group);

  return { group, update, material, setHold };
}
