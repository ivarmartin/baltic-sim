import * as THREE from 'three';
import { getSeabedHeight } from './seabed';

/**
 * Dense reed bed near the shore — reeds grow from the seabed
 * and break the water surface, adapting to local terrain height.
 */

export interface ReedsResult {
  group: THREE.Group;
  update: (elapsed: number) => void;
  setPikePos: (pos: THREE.Vector3) => void;
}

export function createReeds(scene: THREE.Scene, center: THREE.Vector3): ReedsResult {
  const group = new THREE.Group();

  const reedMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a6a2a,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });

  // Shader for reed sway + pike avoidance
  let shaderRef: { uniforms: Record<string, THREE.IUniform> } | null = null;
  reedMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uPikePos = { value: new THREE.Vector3(0, -100, 0) };
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
      uniform float uTime;
      uniform vec3 uPikePos;`,
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      // Recover actual reed height from instance matrix Y-axis scale
      float reedHeight = length(vec3(modelMatrix[0][1], modelMatrix[1][1], modelMatrix[2][1]));
      float yNorm = max(transformed.y * reedHeight, 0.0) / 5.0;
      float sway = sin(uTime * 1.2 + modelMatrix[3][0] * 2.0 + transformed.y * reedHeight * 2.0) * yNorm * 0.12;
      transformed.x += sway;
      transformed.z += cos(uTime * 0.9 + modelMatrix[3][2] * 1.5) * yNorm * 0.07;
      // Pike avoidance – push reed tips aside
      vec3 wPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
      vec2 away = wPos.xz - uPikePos.xz;
      float pikeDist = length(away);
      float pushStr = (1.0 - smoothstep(0.0, 1.0, pikeDist)) * yNorm * 0.4;
      vec2 pDir = pikeDist > 0.001 ? normalize(away) : vec2(0.0);
      transformed.x += pDir.x * pushStr;
      transformed.z += pDir.y * pushStr;`,
    );
    shaderRef = shader;
  };

  const waterSurface = 4.5;
  const reedCount = 500;

  // Unit-height cylinder shared by all instances (pivot at base)
  const geo = new THREE.CylinderGeometry(0.0075, 0.0115, 1, 4);
  geo.translate(0, 0.5, 0);

  // Collect valid reed transforms
  const transforms: THREE.Matrix4[] = [];
  const dummy = new THREE.Object3D();

  for (let i = 0; i < reedCount; i++) {
    const rx = center.x + (Math.random() - 0.5) * 7;
    const rz = center.z + (Math.random() - 0.5) * 7;
    const groundY = getSeabedHeight(rx, rz);
    const waterDepth = waterSurface - groundY;

    // Skip if above water or too deep for reeds
    if (waterDepth < 0.2 || waterDepth > 4.5) continue;

    // Reeds break the surface by 0.5–2m
    const height = waterDepth + 0.5 + Math.random() * 1.5;

    dummy.position.set(rx, groundY, rz);
    dummy.scale.set(1, height, 1);
    dummy.rotation.set(0, 0, (Math.random() - 0.5) * 0.1);
    dummy.updateMatrix();
    transforms.push(dummy.matrix.clone());
  }

  const reedMesh = new THREE.InstancedMesh(geo, reedMaterial, transforms.length);
  for (let i = 0; i < transforms.length; i++) {
    reedMesh.setMatrixAt(i, transforms[i]);
  }
  reedMesh.instanceMatrix.needsUpdate = true;
  group.add(reedMesh);

  // Stickleback nest: small cluster of plant fiber on the bottom
  const nestMaterial = new THREE.MeshStandardMaterial({
    color: 0x6a5a30,
    roughness: 1.0,
  });

  const nestGroup = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const length = 0.03 + Math.random() * 0.04;
    const fiberGeo = new THREE.CylinderGeometry(0.002, 0.002, length, 3);
    const fiber = new THREE.Mesh(fiberGeo, nestMaterial);
    fiber.position.set(
      (Math.random() - 0.5) * 0.05,
      0.01 + Math.random() * 0.02,
      (Math.random() - 0.5) * 0.05,
    );
    fiber.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI,
    );
    nestGroup.add(fiber);
  }
  const nestGroundY = getSeabedHeight(center.x - 1, center.z - 1);
  nestGroup.position.set(center.x - 1, nestGroundY, center.z - 1);
  group.add(nestGroup);

  group.visible = false;
  scene.add(group);

  function update(elapsed: number) {
    if (shaderRef) shaderRef.uniforms.uTime.value = elapsed;
  }

  function setPikePos(pos: THREE.Vector3) {
    if (shaderRef) shaderRef.uniforms.uPikePos.value.copy(pos);
  }

  return { group, update, setPikePos };
}
