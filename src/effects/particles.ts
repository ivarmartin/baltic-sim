import * as THREE from 'three';

const PARTICLE_COUNT = 600;
const BOX_SIZE = { x: 12, y: 5, z: 12 };

export interface ParticleSystem {
  update: (elapsed: number, dt: number) => void;
  setDensity: (factor: number) => void;
}

export function createParticles(scene: THREE.Scene): ParticleSystem {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);

  // Random initial positions
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * BOX_SIZE.x;
    positions[i * 3 + 1] = Math.random() * BOX_SIZE.y;
    positions[i * 3 + 2] = (Math.random() - 0.5) * BOX_SIZE.z;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Small circular texture for soft particles
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(180, 200, 170, 1)');
  gradient.addColorStop(1, 'rgba(180, 200, 170, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);

  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.PointsMaterial({
    size: 0.02,
    map: texture,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Visible count for density control
  let visibleCount = PARTICLE_COUNT;

  function update(elapsed: number, dt: number) {
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      // Gentle drift
      arr[i3] += Math.sin(elapsed * 0.3 + i * 0.17) * dt * 0.03;
      arr[i3 + 1] += dt * 0.015; // slow upward buoyancy
      arr[i3 + 2] += Math.cos(elapsed * 0.2 + i * 0.13) * dt * 0.025;

      // Wrap at boundaries
      if (arr[i3 + 1] > BOX_SIZE.y) arr[i3 + 1] = 0;
      if (arr[i3] > BOX_SIZE.x / 2) arr[i3] = -BOX_SIZE.x / 2;
      if (arr[i3] < -BOX_SIZE.x / 2) arr[i3] = BOX_SIZE.x / 2;
      if (arr[i3 + 2] > BOX_SIZE.z / 2) arr[i3 + 2] = -BOX_SIZE.z / 2;
      if (arr[i3 + 2] < -BOX_SIZE.z / 2) arr[i3 + 2] = BOX_SIZE.z / 2;
    }

    pos.needsUpdate = true;
    geometry.setDrawRange(0, visibleCount);
  }

  function setDensity(factor: number) {
    visibleCount = Math.floor(PARTICLE_COUNT * Math.max(0, Math.min(1, factor)));
  }

  return { update, setDensity };
}
