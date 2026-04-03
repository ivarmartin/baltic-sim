import * as THREE from 'three';

/**
 * Compute the seabed height at any world (x, z) position.
 * Used by both the seabed mesh and the jetty to keep poles grounded.
 */
export function getSeabedHeight(x: number, z: number): number {
  // Base undulation — gentle rolling terrain
  let y = Math.sin(x * 0.5) * Math.cos(z * 0.3) * 0.15
         + Math.sin(x * 1.2 + z * 0.8) * 0.05;

  // Deep zone slope: for Z < -8, seabed descends
  if (z < -8) {
    y -= (-z - 8) * 0.4;
  }

  // Shore slope: north end (+Z) rises out of the water
  if (z > 5) {
    const shoreZ = z - 5;

    // Varying slope along X — mix of steep cliffs and gentle beaches
    const slopeRate = 0.5
      + 0.2 * Math.sin(x * 0.15 + 0.7)
      + 0.1 * Math.sin(x * 0.6 + 2.0)
      + 0.08 * Math.sin(x * 1.1 + 3.5);

    let shoreRise = shoreZ * slopeRate;

    // Creek channel at X ≈ 24 — carves through the rising shore
    const creekX = 24;
    const creekHalfWidth = 2.0;
    const dx = x - creekX;
    const creekT = Math.exp(-(dx * dx) / (2 * creekHalfWidth * creekHalfWidth));
    // Creek floor barely rises, keeping a navigable channel below waterline
    shoreRise *= (1 - creekT * 0.93);

    y += shoreRise;
  }

  // Clip at waterline — shore geometry must not rise above the surface
  return Math.min(y, 4.5);
}

export interface SeabedResult {
  seabedMaterial: THREE.MeshStandardMaterial;
  rockMaterial: THREE.MeshStandardMaterial;
  rockPositions: THREE.Vector3[];
}

export function createSeabed(scene: THREE.Scene): SeabedResult {
  // --- Ground plane with gentle undulation + deep zone slope + shore ---
  const groundGeo = new THREE.PlaneGeometry(120, 120, 128, 128);
  groundGeo.rotateX(-Math.PI / 2);

  // Displace vertices for rolling terrain + deep slope + shore rise
  const pos = groundGeo.attributes.position;
  const colors = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = getSeabedHeight(x, z);

    pos.setY(i, y);

    // --- Vertex colors ---
    if (z < -16) {
      // Dead-zone mud
      const mudT = Math.min((-z - 16) / 6, 1);
      colors[i * 3]     = 0.54 * (1 - mudT) + 0.1 * mudT;
      colors[i * 3 + 1] = 0.48 * (1 - mudT) + 0.08 * mudT;
      colors[i * 3 + 2] = 0.35 * (1 - mudT) + 0.06 * mudT;
    } else if (z > 5) {
      // Shore zone — blend from sand to earthy tones as it rises
      const shoreT = Math.min((z - 5) / 8, 1);

      // Creek channel gets muddier coloring
      const creekX = 24;
      const dx = x - creekX;
      const creekT = Math.exp(-(dx * dx) / (2 * 3.0 * 3.0));

      // Base shore color: earthy brown-green
      const baseR = 0.54 * (1 - shoreT) + 0.38 * shoreT;
      const baseG = 0.48 * (1 - shoreT) + 0.36 * shoreT;
      const baseB = 0.35 * (1 - shoreT) + 0.22 * shoreT;

      // Creek tint: dark muddy
      colors[i * 3]     = baseR * (1 - creekT * 0.4) + 0.18 * creekT * 0.4;
      colors[i * 3 + 1] = baseG * (1 - creekT * 0.4) + 0.15 * creekT * 0.4;
      colors[i * 3 + 2] = baseB * (1 - creekT * 0.4) + 0.10 * creekT * 0.4;
    } else {
      // Normal sandy seabed
      colors[i * 3]     = 0.54;
      colors[i * 3 + 1] = 0.48;
      colors[i * 3 + 2] = 0.35;
    }
  }

  groundGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  groundGeo.computeVertexNormals();

  const seabedMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a7a5a,
    roughness: 0.95,
    metalness: 0.0,
    vertexColors: true,
  });

  const ground = new THREE.Mesh(groundGeo, seabedMaterial);
  ground.receiveShadow = true;
  scene.add(ground);

  // --- Rocks (only in the underwater zone) ---
  const rockPositions: THREE.Vector3[] = [];
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a4a3a,
    roughness: 0.85,
  });

  for (let i = 0; i < 12; i++) {
    const radius = 0.2 + Math.random() * 0.4;
    const rockGeo = new THREE.DodecahedronGeometry(radius, 1);

    // Distort for organic shape
    const rPos = rockGeo.attributes.position;
    for (let j = 0; j < rPos.count; j++) {
      rPos.setX(j, rPos.getX(j) * (1 + (Math.random() - 0.5) * 0.3));
      rPos.setY(j, rPos.getY(j) * (0.6 + Math.random() * 0.4));
      rPos.setZ(j, rPos.getZ(j) * (1 + (Math.random() - 0.5) * 0.3));
    }
    rockGeo.computeVertexNormals();

    const rock = new THREE.Mesh(rockGeo, rockMaterial);
    const rx = (Math.random() - 0.5) * 14;
    const rz = (Math.random() - 0.5) * 14;
    const ry = -radius * 0.3;
    rock.position.set(rx, ry, rz);
    rock.rotation.set(Math.random() * 0.5, Math.random() * Math.PI * 2, 0);
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
    rockPositions.push(new THREE.Vector3(rx, 0, rz));
  }

  return { seabedMaterial, rockMaterial, rockPositions };
}
