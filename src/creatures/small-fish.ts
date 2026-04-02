import * as THREE from 'three';

/**
 * Small fish school (perch/roach) - ~10 generic small fish swimming in a loose group.
 * Simple procedural geometry, background element.
 */

export interface SmallFishResult {
  group: THREE.Group;
  update: (elapsed: number, dt: number) => void;
  material: THREE.MeshStandardMaterial;
}

function createSmallFishGeo(): THREE.BufferGeometry {
  const segs = 6;
  const around = 6;
  const verts: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  // Generic small fish profile
  const profile: [number, number, number][] = [
    [0.0, 0.005, 0.005],
    [0.15, 0.02, 0.015],
    [0.35, 0.03, 0.025],
    [0.55, 0.028, 0.022],
    [0.80, 0.015, 0.012],
    [1.0, 0.0, 0.0],
  ];

  const bodyLen = 0.08; // 8cm fish

  for (let s = 0; s < segs; s++) {
    const [zN, xR, yR] = profile[s];
    const z = zN * bodyLen;
    for (let a = 0; a < around; a++) {
      const angle = (a / around) * Math.PI * 2;
      verts.push(Math.cos(angle) * xR, Math.sin(angle) * yR, z);
      // Silver-green coloring
      const top = Math.max(0, Math.sin(angle));
      colors.push(
        0.4 + (1 - top) * 0.4,
        0.45 + (1 - top) * 0.35,
        0.3 + (1 - top) * 0.3,
      );
    }
  }

  for (let s = 0; s < segs - 1; s++) {
    for (let a = 0; a < around; a++) {
      const c = s * around + a;
      const n = s * around + (a + 1) % around;
      const cn = (s + 1) * around + a;
      const nn = (s + 1) * around + (a + 1) % around;
      indices.push(c, n, cn, n, nn, cn);
    }
  }

  // Simple tail fin
  const ti = verts.length / 3;
  const tz = bodyLen;
  verts.push(0, 0, tz - 0.01); colors.push(0.35, 0.4, 0.28);
  verts.push(-0.015, 0.01, tz + 0.015); colors.push(0.35, 0.4, 0.28);
  verts.push(0.015, 0.01, tz + 0.015); colors.push(0.35, 0.4, 0.28);
  verts.push(-0.015, -0.01, tz + 0.015); colors.push(0.38, 0.43, 0.3);
  verts.push(0.015, -0.01, tz + 0.015); colors.push(0.38, 0.43, 0.3);
  indices.push(ti, ti + 1, ti + 2, ti, ti + 3, ti + 4);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function createSmallFish(scene: THREE.Scene, center: THREE.Vector3): SmallFishResult {
  const group = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.35,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  const fishCount = 10;
  const baseGeo = createSmallFishGeo();
  const fishData: { mesh: THREE.Mesh; orbitRadius: number; orbitSpeed: number; yOffset: number; phase: number }[] = [];

  for (let i = 0; i < fishCount; i++) {
    const mesh = new THREE.Mesh(baseGeo, material);
    mesh.castShadow = true;

    const orbitRadius = 0.8 + Math.random() * 1.5;
    const orbitSpeed = 0.2 + Math.random() * 0.3;
    const yOffset = (Math.random() - 0.5) * 0.6;
    const phase = (i / fishCount) * Math.PI * 2 + Math.random() * 0.5;

    const scale = 0.8 + Math.random() * 0.5;
    mesh.scale.setScalar(scale);

    group.add(mesh);
    fishData.push({ mesh, orbitRadius, orbitSpeed, yOffset, phase });
  }

  function update(elapsed: number, _dt: number) {
    for (const fish of fishData) {
      const angle = elapsed * fish.orbitSpeed + fish.phase;
      fish.mesh.position.set(
        center.x + Math.cos(angle) * fish.orbitRadius,
        center.y + 0.3 + fish.yOffset + Math.sin(elapsed * 0.8 + fish.phase) * 0.1,
        center.z + Math.sin(angle) * fish.orbitRadius,
      );
      // Face direction of movement
      fish.mesh.rotation.y = -angle + Math.PI / 2;
    }
  }

  group.visible = false;
  scene.add(group);

  return { group, update, material };
}
