import * as THREE from 'three';

/**
 * Large stickleback swarm using InstancedMesh for performance.
 * 300 instances with GPU-driven body sway via onBeforeCompile.
 */

const SWARM_COUNT = 300;

/** Simplified stickleback geometry for instancing. */
function createSwarmFishGeometry(): THREE.BufferGeometry {
  const segsAround = 6;
  const bodyLength = 1.0;

  const profile: [number, number, number][] = [
    [0.00, 0.02, 0.03],
    [0.10, 0.08, 0.12],
    [0.30, 0.12, 0.18],
    [0.50, 0.12, 0.19],
    [0.70, 0.07, 0.12],
    [0.85, 0.03, 0.05],
    [1.00, 0.00, 0.00],
  ];

  const vertices: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let s = 0; s < profile.length; s++) {
    const [zNorm, xR, yR] = profile[s];
    const z = zNorm * bodyLength;
    for (let a = 0; a < segsAround; a++) {
      const angle = (a / segsAround) * Math.PI * 2;
      vertices.push(Math.cos(angle) * xR, Math.sin(angle) * yR, z);
      const topness = Math.max(0, Math.sin(angle));
      colors.push(0.35 + (1 - topness) * 0.35, 0.42 + (1 - topness) * 0.30, 0.30 + (1 - topness) * 0.25);
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

  // Small tail
  const tailBaseIdx = vertices.length / 3;
  vertices.push(0, 0, 0.94); colors.push(0.5, 0.55, 0.45);
  vertices.push(-0.06, 0.05, 1.08); colors.push(0.45, 0.5, 0.4);
  vertices.push(0.06, 0.05, 1.08); colors.push(0.45, 0.5, 0.4);
  vertices.push(-0.06, -0.05, 1.08); colors.push(0.55, 0.6, 0.5);
  vertices.push(0.06, -0.05, 1.08); colors.push(0.55, 0.6, 0.5);

  indices.push(tailBaseIdx, tailBaseIdx + 1, tailBaseIdx + 2);
  indices.push(tailBaseIdx, tailBaseIdx + 3, tailBaseIdx + 4);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.scale(0.05, 0.05, 0.05);

  return geo;
}

export interface SwarmResult {
  mesh: THREE.InstancedMesh;
  update: (elapsed: number, dt: number) => void;
}

export function createSticklebackSwarm(scene: THREE.Scene, center: THREE.Vector3): SwarmResult {
  const geometry = createSwarmFishGeometry();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.4,
    metalness: 0.15,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, SWARM_COUNT);
  mesh.castShadow = true;
  mesh.visible = false;

  // Pre-compute per-instance data: orbit radius, orbit speed, Y offset, phase
  const instanceData: { radius: number; speed: number; yOffset: number; phase: number; yPhase: number }[] = [];

  const dummy = new THREE.Object3D();

  for (let i = 0; i < SWARM_COUNT; i++) {
    const radius = 0.5 + Math.random() * 3.0;
    const speed = 0.3 + Math.random() * 0.5;
    const yOffset = (Math.random() - 0.5) * 2.0;
    const phase = Math.random() * Math.PI * 2;
    const yPhase = Math.random() * Math.PI * 2;

    instanceData.push({ radius, speed, yOffset, phase, yPhase });

    // Initial placement
    const angle = phase;
    dummy.position.set(
      center.x + Math.cos(angle) * radius,
      center.y + yOffset,
      center.z + Math.sin(angle) * radius,
    );
    dummy.scale.setScalar(0.7 + Math.random() * 0.6);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;
  scene.add(mesh);

  function update(elapsed: number, _dt: number) {
    if (!mesh.visible) return;

    for (let i = 0; i < SWARM_COUNT; i++) {
      const d = instanceData[i];
      const angle = elapsed * d.speed + d.phase;

      // Orbit around center with slight vertical bobbing
      dummy.position.set(
        center.x + Math.cos(angle) * d.radius,
        center.y + d.yOffset + Math.sin(elapsed * 0.8 + d.yPhase) * 0.15,
        center.z + Math.sin(angle) * d.radius,
      );

      // Face direction of travel
      const nextAngle = angle + 0.05;
      const dx = Math.cos(nextAngle) * d.radius - Math.cos(angle) * d.radius;
      const dz = Math.sin(nextAngle) * d.radius - Math.sin(angle) * d.radius;
      dummy.rotation.y = Math.atan2(dx, dz);

      // Slight banking into turns
      dummy.rotation.z = Math.sin(angle) * 0.15;

      dummy.scale.setScalar(0.7 + (i % 5) * 0.1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }

  return { mesh, update };
}
