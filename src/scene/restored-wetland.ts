import * as THREE from 'three';

/**
 * Restored wetland blockout - hopeful scene with shallow water,
 * grassy vegetation stems, and a simple fish passage.
 */

export interface RestoredWetlandResult {
  group: THREE.Group;
  update: (elapsed: number) => void;
}

export function createRestoredWetland(scene: THREE.Scene, center: THREE.Vector3): RestoredWetlandResult {
  const group = new THREE.Group();

  // Shallow water plane - warm blue-green tint
  const waterGeo = new THREE.PlaneGeometry(10, 8);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x3a7a6a,
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0.4,
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = 0.1;
  group.add(water);

  // Muddy bottom
  const bottomGeo = new THREE.PlaneGeometry(10, 8, 8, 6);
  bottomGeo.rotateX(-Math.PI / 2);
  const bAttr = bottomGeo.attributes.position;
  for (let i = 0; i < bAttr.count; i++) {
    bAttr.setY(i, bAttr.getY(i) + (Math.random() - 0.5) * 0.05);
  }
  bAttr.needsUpdate = true;
  bottomGeo.computeVertexNormals();

  const bottomMat = new THREE.MeshStandardMaterial({
    color: 0x4a5a35,
    roughness: 1.0,
  });
  const bottom = new THREE.Mesh(bottomGeo, bottomMat);
  bottom.receiveShadow = true;
  group.add(bottom);

  // Grass/sedge stems - tall green cylinders (like reeds but more grass-like)
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x5a8a3a,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });

  let shaderRef: { uniforms: Record<string, THREE.IUniform> } | null = null;
  stemMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
      uniform float uTime;`,
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      float yN = max(transformed.y, 0.0) / 1.0;
      transformed.x += sin(uTime * 1.5 + modelMatrix[3][0] * 2.5 + transformed.y * 2.0) * yN * 0.04;
      transformed.z += cos(uTime * 1.1 + modelMatrix[3][2] * 2.0) * yN * 0.02;`,
    );
    shaderRef = shader;
  };

  for (let i = 0; i < 40; i++) {
    const height = 0.4 + Math.random() * 0.6;
    const geo = new THREE.CylinderGeometry(0.003, 0.006, height, 3);
    geo.translate(0, height / 2, 0);
    const stem = new THREE.Mesh(geo, stemMat);
    stem.position.set(
      (Math.random() - 0.5) * 7,
      0,
      (Math.random() - 0.5) * 5,
    );
    stem.rotation.z = (Math.random() - 0.5) * 0.1;
    group.add(stem);
  }

  // Fish passage - simple ramp/channel leading into the wetland
  const passageMat = new THREE.MeshStandardMaterial({
    color: 0x6a6a5a,
    roughness: 0.9,
  });

  // Ramp floor
  const rampGeo = new THREE.BoxGeometry(0.8, 0.05, 3);
  const ramp = new THREE.Mesh(rampGeo, passageMat);
  ramp.position.set(0, -0.05, -4);
  ramp.rotation.x = 0.08; // slight upward slope
  group.add(ramp);

  // Ramp side walls
  const rampWallGeo = new THREE.BoxGeometry(0.06, 0.2, 3);
  const rampLeft = new THREE.Mesh(rampWallGeo, passageMat);
  rampLeft.position.set(-0.4, 0.03, -4);
  group.add(rampLeft);
  const rampRight = new THREE.Mesh(rampWallGeo.clone(), passageMat);
  rampRight.position.set(0.4, 0.03, -4);
  group.add(rampRight);

  group.position.copy(center);
  group.visible = false;
  scene.add(group);

  function update(elapsed: number) {
    if (shaderRef) shaderRef.uniforms.uTime.value = elapsed;
  }

  return { group, update };
}
