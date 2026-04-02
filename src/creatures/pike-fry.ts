import * as THREE from 'three';

/**
 * Pike fry - group of ~20 tiny fish darting in a small area.
 * Simplified pike shape at tiny scale.
 */

export interface PikeFryResult {
  group: THREE.Group;
  update: (elapsed: number, dt: number) => void;
}

function createTinyFishGeo(): THREE.BufferGeometry {
  // Very simplified fish: just a few segments
  const verts: number[] = [];
  const indices: number[] = [];
  const colors: number[] = [];
  const segs = 5;
  const around = 5;

  const profile: [number, number][] = [
    [0.0, 0.01],
    [0.25, 0.03],
    [0.5, 0.03],
    [0.75, 0.02],
    [1.0, 0.0],
  ];

  for (let s = 0; s < segs; s++) {
    const [zN, r] = profile[s];
    const z = zN * 0.04; // 4cm long
    for (let a = 0; a < around; a++) {
      const angle = (a / around) * Math.PI * 2;
      verts.push(Math.cos(angle) * r, Math.sin(angle) * r, z);
      // Greenish translucent fry color
      colors.push(0.45 + Math.random() * 0.1, 0.55 + Math.random() * 0.1, 0.3);
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

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function createPikeFry(scene: THREE.Scene, center: THREE.Vector3): PikeFryResult {
  const group = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.4,
    metalness: 0.05,
    transparent: true,
    opacity: 0.8,
  });

  const fryCount = 20;
  const fryData: { mesh: THREE.Mesh; offset: THREE.Vector3; speed: number; phase: number }[] = [];

  const baseGeo = createTinyFishGeo();

  for (let i = 0; i < fryCount; i++) {
    const mesh = new THREE.Mesh(baseGeo, material);
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 1.2,
      0.05 + Math.random() * 0.3,
      (Math.random() - 0.5) * 1.2,
    );
    mesh.position.copy(center).add(offset);
    mesh.rotation.y = Math.random() * Math.PI * 2;
    group.add(mesh);

    fryData.push({
      mesh,
      offset,
      speed: 0.5 + Math.random() * 1.0,
      phase: Math.random() * Math.PI * 2,
    });
  }

  function update(elapsed: number, _dt: number) {
    for (const fry of fryData) {
      // Darting motion: quick changes in direction
      const t = elapsed * fry.speed + fry.phase;
      const dx = Math.sin(t * 2.3) * 0.3;
      const dz = Math.cos(t * 1.7) * 0.3;
      const dy = Math.sin(t * 3.1) * 0.05;

      fry.mesh.position.set(
        center.x + fry.offset.x + dx,
        center.y + fry.offset.y + dy,
        center.z + fry.offset.z + dz,
      );

      // Face direction of movement
      fry.mesh.rotation.y = Math.atan2(
        Math.cos(t * 2.3) * 2.3,
        -Math.sin(t * 1.7) * 1.7,
      );
    }
  }

  group.visible = false;
  scene.add(group);

  return { group, update };
}
