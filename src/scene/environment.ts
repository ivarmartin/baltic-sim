import * as THREE from 'three';

export interface EnvironmentResult {
  sunLight: THREE.DirectionalLight;
}

export function setupEnvironment(scene: THREE.Scene): EnvironmentResult {
  // Murky green Baltic fog - exponential for natural falloff
  scene.fog = new THREE.FogExp2(0x1a3a2a, 0.18);
  scene.background = new THREE.Color(0x0d2818);

  // Low ambient fill - scattered underwater light
  const ambient = new THREE.AmbientLight(0x2a5a3a, 0.5);
  scene.add(ambient);

  // Sun filtering through water surface
  const sun = new THREE.DirectionalLight(0x8fbfaa, 1.8);
  sun.position.set(3, 15, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -10;
  sun.shadow.camera.right = 10;
  sun.shadow.camera.top = 10;
  sun.shadow.camera.bottom = -10;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 30;
  sun.shadow.bias = -0.001;
  scene.add(sun);

  // Hemisphere fill for subtle color variation
  const hemi = new THREE.HemisphereLight(0x3a6a4a, 0x0a1a0a, 0.3);
  scene.add(hemi);

  return { sunLight: sun };
}
