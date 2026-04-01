import * as THREE from 'three';

/**
 * Semi-transparent halocline shimmer plane for Stage 5.
 * Represents the salinity/density boundary layer.
 */
export function createHalocline(scene: THREE.Scene): { mesh: THREE.Mesh; update: (elapsed: number) => void } {
  const geo = new THREE.PlaneGeometry(40, 40, 32, 32);
  geo.rotateX(-Math.PI / 2);

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying float vDistort;
      void main() {
        vUv = uv;
        vec3 pos = position;
        // Subtle wave displacement
        float wave = sin(pos.x * 2.0 + uTime * 0.5) * cos(pos.z * 1.5 + uTime * 0.3) * 0.1;
        pos.y += wave;
        vDistort = wave;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying float vDistort;
      void main() {
        // Shimmer based on distortion + time
        float shimmer = sin(vUv.x * 20.0 + uTime * 1.5) * sin(vUv.y * 15.0 + uTime * 0.8);
        float alpha = 0.08 + shimmer * 0.04 + abs(vDistort) * 0.3;
        // Fade at edges
        float edge = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x)
                   * smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
        alpha *= edge;
        vec3 color = vec3(0.3, 0.45, 0.4);
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });

  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(0, -4, -18);
  mesh.visible = false;
  scene.add(mesh);

  function update(elapsed: number) {
    material.uniforms.uTime.value = elapsed;
  }

  return { mesh, update };
}
