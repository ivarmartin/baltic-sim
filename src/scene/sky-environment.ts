import * as THREE from 'three';

/**
 * Above-water sky dome: a large inverted sphere with a gradient shader.
 * Pale Scandinavian grey-blue sky.
 */
export function createSkyDome(scene: THREE.Scene): THREE.Mesh {
  const geo = new THREE.SphereGeometry(40, 16, 12);

  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {},
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vWorldPos;
      void main() {
        float y = normalize(vWorldPos).y;
        // Gradient from horizon haze to pale blue overhead
        vec3 horizon = vec3(0.78, 0.82, 0.85);  // pale grey
        vec3 zenith = vec3(0.55, 0.65, 0.78);   // soft blue
        vec3 color = mix(horizon, zenith, max(y, 0.0));
        // Slight warm tint near horizon
        float horizonGlow = exp(-abs(y) * 6.0);
        color += vec3(0.06, 0.04, 0.02) * horizonGlow;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });

  const mesh = new THREE.Mesh(geo, material);
  mesh.visible = false;
  mesh.renderOrder = -1;
  scene.add(mesh);
  return mesh;
}
