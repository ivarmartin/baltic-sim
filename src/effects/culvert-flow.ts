import * as THREE from 'three';

export interface CulvertFlowResult {
  group: THREE.Group;
  update: (elapsed: number) => void;
}

/**
 * Creates two effects at the culvert bay-side opening:
 * 1. Particle bubbles/foam drifting out from the pipe mouth
 * 2. Vertex displacement ripple on the water surface near the outlet
 */
export function createCulvertFlow(
  scene: THREE.Scene,
  waterSurface: THREE.Mesh,
): CulvertFlowResult {
  const group = new THREE.Group();

  // Culvert mouth position (bay-facing end)
  const mouthX = 24;
  const mouthY = 4.0;
  const mouthZ = 21.5 - 10; // centerZ - pipeLength/2 = 11.5
  const innerRadius = 1.05;

  // -------------------------------------------------------
  // 1. Particle spray — small bubbles / foam drifting out
  // -------------------------------------------------------
  const particleCount = 80;
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const lifetimes = new Float32Array(particleCount);
  const ages = new Float32Array(particleCount);

  function resetParticle(i: number) {
    // Spawn inside the pipe mouth circle
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * innerRadius * 0.7;
    positions[i * 3] = mouthX + Math.cos(angle) * r;
    positions[i * 3 + 1] = mouthY + Math.sin(angle) * r * 0.5; // flattened vertically
    positions[i * 3 + 2] = mouthZ;

    // Drift outward (-Z toward bay) with slight spread
    velocities[i * 3] = (Math.random() - 0.5) * 0.15;
    velocities[i * 3 + 1] = Math.random() * 0.08;
    velocities[i * 3 + 2] = -(0.4 + Math.random() * 0.3);

    lifetimes[i] = 2.0 + Math.random() * 2.0;
    ages[i] = Math.random() * lifetimes[i]; // stagger initial ages
  }

  for (let i = 0; i < particleCount; i++) {
    resetParticle(i);
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Small round sprite texture (circle with soft edge)
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.6, 'rgba(255,255,255,0.4)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 32);
  const circleTexture = new THREE.CanvasTexture(canvas);

  const particleMat = new THREE.PointsMaterial({
    color: 0x88bbaa,
    size: 0.04,
    map: circleTexture,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(particleGeo, particleMat);
  group.add(points);

  // -------------------------------------------------------
  // 2. Water surface ripple — displace vertices near outlet
  // -------------------------------------------------------
  // Store reference to surface geometry for per-frame displacement
  const surfaceGeo = waterSurface.geometry as THREE.BufferGeometry;
  const surfacePos = surfaceGeo.attributes.position;

  // Pre-compute which surface vertices are near the culvert outlet
  // and store their original Y and distance for the ripple effect
  const rippleRadius = 2.5;
  const rippleIndices: number[] = [];
  const rippleBaseY: number[] = [];
  const rippleDist: number[] = [];
  const rippleAngle: number[] = [];

  for (let i = 0; i < surfacePos.count; i++) {
    const sx = surfacePos.getX(i);
    const sz = surfacePos.getZ(i);
    const dx = sx - mouthX;
    const dz = sz - mouthZ;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < rippleRadius) {
      rippleIndices.push(i);
      rippleBaseY.push(surfacePos.getY(i));
      rippleDist.push(dist);
      rippleAngle.push(Math.atan2(dz, dx));
    }
  }

  // --- Add to scene ---
  scene.add(group);

  // --- Previous elapsed for dt calculation ---
  let prevElapsed = 0;

  return {
    group,
    update(elapsed: number) {
      const dt = Math.min(elapsed - prevElapsed, 0.05);
      prevElapsed = elapsed;

      // Update particles
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        ages[i] += dt;
        if (ages[i] >= lifetimes[i]) {
          resetParticle(i);
          ages[i] = 0;
        }

        posAttr.array[i * 3] += velocities[i * 3] * dt;
        posAttr.array[i * 3 + 1] += velocities[i * 3 + 1] * dt;
        posAttr.array[i * 3 + 2] += velocities[i * 3 + 2] * dt;
      }
      posAttr.needsUpdate = true;

      // Update surface ripple
      for (let j = 0; j < rippleIndices.length; j++) {
        const idx = rippleIndices[j];
        const dist = rippleDist[j];
        const falloff = 1.0 - dist / rippleRadius;
        // Concentric ripple radiating outward + directional bias toward -Z
        const ripple =
          Math.sin(dist * 3.0 - elapsed * 3.5) * 0.15 * falloff * falloff
          + Math.sin(dist * 5.0 - elapsed * 5.0) * 0.06 * falloff;
        surfacePos.setY(idx, rippleBaseY[j] + ripple);
      }
      if (rippleIndices.length > 0) {
        surfacePos.needsUpdate = true;
      }
    },
  };
}
