import * as THREE from 'three';

export interface SeabedResult {
  seabedMaterial: THREE.MeshStandardMaterial;
  rockMaterial: THREE.MeshStandardMaterial;
  rockPositions: THREE.Vector3[];
}

export function createSeabed(scene: THREE.Scene): SeabedResult {
  // --- Ground plane with gentle undulation + deep zone slope ---
  const groundGeo = new THREE.PlaneGeometry(120, 120, 128, 128);
  groundGeo.rotateX(-Math.PI / 2);

  // Displace vertices for rolling terrain + deep slope for stages 4-5
  const pos = groundGeo.attributes.position;
  const colors = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    let y = Math.sin(x * 0.5) * Math.cos(z * 0.3) * 0.15
           + Math.sin(x * 1.2 + z * 0.8) * 0.05;

    // Deep zone slope: for Z < -8, seabed descends
    if (z < -8) {
      y -= (-z - 8) * 0.4;
    }

    pos.setY(i, y);

    // Vertex colors: sandy brown normally, darker mud in dead zone (Z < -16)
    if (z < -16) {
      const mudT = Math.min((-z - 16) / 6, 1);
      colors[i * 3]     = 0.54 * (1 - mudT) + 0.1 * mudT;  // R
      colors[i * 3 + 1] = 0.48 * (1 - mudT) + 0.08 * mudT; // G
      colors[i * 3 + 2] = 0.35 * (1 - mudT) + 0.06 * mudT; // B
    } else {
      colors[i * 3]     = 0.54;  // R (matches 0x8a7a5a approx)
      colors[i * 3 + 1] = 0.48;  // G
      colors[i * 3 + 2] = 0.35;  // B
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

  // --- Rocks ---
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
