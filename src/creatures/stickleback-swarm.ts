import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Large stickleback swarm using InstancedMesh for performance.
 * 300 instances using the stickleback GLB model.
 */

const SWARM_COUNT = 300;

export interface SwarmResult {
  mesh: THREE.InstancedMesh;
  update: (elapsed: number, dt: number) => void;
}

export async function createSticklebackSwarm(scene: THREE.Scene, center: THREE.Vector3): Promise<SwarmResult> {
  // Load stickleback GLB model
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(import.meta.env.BASE_URL + 'assets/stickleback.glb');

  // Collect all meshes and merge into a single geometry
  const meshes: THREE.Mesh[] = [];
  let firstMaterial: THREE.MeshStandardMaterial | null = null;
  gltf.scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const m = child as THREE.Mesh;
      meshes.push(m);
      if (!firstMaterial) firstMaterial = m.material as THREE.MeshStandardMaterial;
    }
  });
  if (meshes.length === 0) throw new Error('No mesh found in stickleback.glb');

  // Bake each mesh's world transform into its geometry and merge
  // Pad missing attributes so mergeGeometries works across meshes with different attr sets
  const geos: THREE.BufferGeometry[] = [];
  const allAttrs = new Set<string>();
  for (const m of meshes) {
    const g = m.geometry.clone();
    m.updateWorldMatrix(true, false);
    g.applyMatrix4(m.matrixWorld);
    for (const name of Object.keys(g.attributes)) allAttrs.add(name);
    geos.push(g);
  }
  for (const g of geos) {
    for (const name of allAttrs) {
      if (!g.attributes[name]) {
        const ref = geos.find((o) => o.attributes[name])!.attributes[name];
        const itemSize = ref.itemSize;
        g.setAttribute(name, new THREE.BufferAttribute(
          new Float32Array(g.attributes.position.count * itemSize), itemSize,
        ));
      }
    }
  }
  const geometry = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);

  // Flip nose to +Z so rotation.y faces fish in travel direction
  geometry.rotateY(Math.PI);

  // Scale geometry to match procedural swarm convention (~0.05m body)
  geometry.computeBoundingBox();
  const rawLength = geometry.boundingBox!.max.z - geometry.boundingBox!.min.z;
  const scaleFactor = 0.05 / rawLength;
  geometry.scale(scaleFactor, scaleFactor, scaleFactor);

  // Use the GLB's baked material
  const material = firstMaterial!.clone();
  material.side = THREE.DoubleSide;

  const mesh = new THREE.InstancedMesh(geometry, material, SWARM_COUNT);
  mesh.castShadow = true;
  mesh.visible = false;

  // Per-instance data with extra noise parameters to break up uniform orbits
  interface FishData {
    radius: number; speed: number; yOffset: number; phase: number; yPhase: number;
    // Perturbation: radius wobble, lateral drift, dart timing
    radWobbleAmp: number; radWobbleFreq: number; radWobblePhase: number;
    driftAmp: number; driftFreq: number; driftPhase: number;
    dartPhase: number; dartFreq: number;
    scale: number;
  }
  const instanceData: FishData[] = [];

  const dummy = new THREE.Object3D();

  for (let i = 0; i < SWARM_COUNT; i++) {
    const radius = 0.5 + Math.random() * 3.0;
    const speed = 0.2 + Math.random() * 0.5;
    const yOffset = (Math.random() - 0.5) * 2.0;
    const phase = Math.random() * Math.PI * 2;
    const yPhase = Math.random() * Math.PI * 2;

    instanceData.push({
      radius, speed, yOffset, phase, yPhase,
      radWobbleAmp: 0.15 + Math.random() * 0.4,
      radWobbleFreq: 0.3 + Math.random() * 0.6,
      radWobblePhase: Math.random() * Math.PI * 2,
      driftAmp: 0.2 + Math.random() * 0.5,
      driftFreq: 0.15 + Math.random() * 0.3,
      driftPhase: Math.random() * Math.PI * 2,
      dartPhase: Math.random() * Math.PI * 2,
      dartFreq: 0.5 + Math.random() * 1.5,
      scale: 0.7 + Math.random() * 0.6,
    });

    // Initial placement
    const angle = phase;
    dummy.position.set(
      center.x + Math.cos(angle) * radius,
      center.y + yOffset,
      center.z + Math.sin(angle) * radius,
    );
    dummy.scale.setScalar(instanceData[i].scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;
  scene.add(mesh);

  // Reusable vectors for facing direction
  const _prev = new THREE.Vector3();
  const _curr = new THREE.Vector3();

  function update(elapsed: number, _dt: number) {
    if (!mesh.visible) return;

    for (let i = 0; i < SWARM_COUNT; i++) {
      const d = instanceData[i];
      const angle = elapsed * d.speed + d.phase;

      // Wobbling radius breaks the perfect circle
      const r = d.radius + Math.sin(elapsed * d.radWobbleFreq + d.radWobblePhase) * d.radWobbleAmp;

      // Lateral drift perpendicular to orbit (cross-track wander)
      const drift = Math.sin(elapsed * d.driftFreq + d.driftPhase) * d.driftAmp;

      // Small occasional dart (burst of displacement along orbit tangent)
      const dartRaw = Math.sin(elapsed * d.dartFreq + d.dartPhase);
      const dart = dartRaw > 0.85 ? (dartRaw - 0.85) * 3.0 : 0;

      const effAngle = angle + dart * 0.15;

      const x = center.x + Math.cos(effAngle) * r + Math.sin(effAngle) * drift;
      const z = center.z + Math.sin(effAngle) * r - Math.cos(effAngle) * drift;
      const y = center.y + d.yOffset + Math.sin(elapsed * 0.8 + d.yPhase) * 0.15;

      _curr.set(x, y, z);

      // Compute previous position for facing direction
      const pAngle = (elapsed - 0.016) * d.speed + d.phase;
      const pDartRaw = Math.sin((elapsed - 0.016) * d.dartFreq + d.dartPhase);
      const pDart = pDartRaw > 0.85 ? (pDartRaw - 0.85) * 3.0 : 0;
      const pEffAngle = pAngle + pDart * 0.15;
      const pR = d.radius + Math.sin((elapsed - 0.016) * d.radWobbleFreq + d.radWobblePhase) * d.radWobbleAmp;
      const pDrift = Math.sin((elapsed - 0.016) * d.driftFreq + d.driftPhase) * d.driftAmp;
      _prev.set(
        center.x + Math.cos(pEffAngle) * pR + Math.sin(pEffAngle) * pDrift,
        center.y + d.yOffset + Math.sin((elapsed - 0.016) * 0.8 + d.yPhase) * 0.15,
        center.z + Math.sin(pEffAngle) * pR - Math.cos(pEffAngle) * pDrift,
      );

      const dx = _curr.x - _prev.x;
      const dz = _curr.z - _prev.z;

      dummy.position.copy(_curr);
      dummy.rotation.y = Math.atan2(dx, dz);
      dummy.rotation.z = Math.sin(angle) * 0.12;

      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }

  return { mesh, update };
}
