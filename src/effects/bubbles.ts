import * as THREE from 'three';
import { getSeabedHeight } from '../scene/seabed';

const BUBBLE_COUNT = 45;
const SPREAD_X = 50;
const SPREAD_Z = 50;
const WATER_Y = 4.5;

export interface BubbleSystem {
  points: THREE.Points;
  update: (elapsed: number, dt: number) => void;
}

export function createBubbles(scene: THREE.Scene): BubbleSystem {
  // Ring texture — transparent center, visible edge
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(200,230,220,0)');
  grad.addColorStop(0.65, 'rgba(200,230,220,0)');
  grad.addColorStop(0.8, 'rgba(200,240,225,0.6)');
  grad.addColorStop(0.95, 'rgba(220,250,240,0.3)');
  grad.addColorStop(1, 'rgba(200,230,220,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);

  // Per-bubble state
  const positions = new Float32Array(BUBBLE_COUNT * 3);
  const spawnX = new Float32Array(BUBBLE_COUNT);
  const spawnZ = new Float32Array(BUBBLE_COUNT);
  const floorY = new Float32Array(BUBBLE_COUNT);
  const speed = new Float32Array(BUBBLE_COUNT);
  const wobblePhase = new Float32Array(BUBBLE_COUNT);

  function resetBubble(i: number, randomizeY: boolean) {
    spawnX[i] = (Math.random() - 0.5) * SPREAD_X;
    spawnZ[i] = (Math.random() - 0.5) * SPREAD_Z;
    floorY[i] = getSeabedHeight(spawnX[i], spawnZ[i]);
    positions[i * 3] = spawnX[i];
    positions[i * 3 + 1] = randomizeY
      ? floorY[i] + Math.random() * (WATER_Y - floorY[i])
      : floorY[i];
    positions[i * 3 + 2] = spawnZ[i];
    speed[i] = 0.15 + Math.random() * 0.25;
    wobblePhase[i] = Math.random() * Math.PI * 2;
  }

  for (let i = 0; i < BUBBLE_COUNT; i++) {
    resetBubble(i, true);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.1,
    map: texture,
    transparent: true,
    opacity: 0.06,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  function update(elapsed: number, dt: number) {
    const arr = positions;
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      const i3 = i * 3;
      arr[i3 + 1] += speed[i] * dt;

      if (arr[i3 + 1] >= WATER_Y) {
        resetBubble(i, false);
      }

      arr[i3] = spawnX[i] + Math.sin(elapsed * 1.5 + wobblePhase[i]) * 0.08;
      arr[i3 + 2] = spawnZ[i] + Math.cos(elapsed * 1.2 + wobblePhase[i] * 1.3) * 0.06;
    }
    (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  }

  return { points, update };
}
