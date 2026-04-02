import * as THREE from 'three';

/**
 * Animated, glowing water surface plane visible when looking up.
 * Uses custom shader for animated distortion and brightness.
 */
export function createWaterSurface(scene: THREE.Scene): {
  mesh: THREE.Mesh;
  update: (elapsed: number) => void;
  setVisible: (v: boolean) => void;
} {
  const geometry = new THREE.PlaneGeometry(120, 120, 64, 64);
  geometry.rotateX(Math.PI / 2); // face downward

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0.18 },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying float vWave;

      void main() {
        vUv = uv;
        vec3 pos = position;
        // Gentle wave displacement
        float wave = sin(pos.x * 1.5 + uTime * 0.8) * cos(pos.z * 1.2 + uTime * 0.6) * 0.08;
        wave += sin(pos.x * 3.0 + pos.z * 2.0 + uTime * 1.2) * 0.03;
        pos.y += wave;
        vWave = wave;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uOpacity;
      varying vec2 vUv;
      varying float vWave;

      void main() {
        // Bright shifting light pattern
        float pattern = sin(vUv.x * 20.0 + uTime * 0.5) * sin(vUv.y * 15.0 + uTime * 0.3);
        pattern = pattern * 0.5 + 0.5;

        // Shimmer based on wave height
        float shimmer = vWave * 5.0 + 0.5;

        // Bright aqua-green surface color
        vec3 color = mix(
          vec3(0.15, 0.45, 0.35),
          vec3(0.4, 0.7, 0.55),
          pattern * shimmer
        );

        // Gentle falloff only at far edges
        float dist = length(vUv - 0.5) * 2.0;
        float falloff = 1.0 - smoothstep(0.85, 1.0, dist);

        gl_FragColor = vec4(color, uOpacity * falloff * (0.6 + pattern * 0.4));
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 4.5; // water surface height

  scene.add(mesh);

  return {
    mesh,
    update(elapsed: number) {
      material.uniforms.uTime.value = elapsed;
    },
    setVisible(v: boolean) {
      mesh.visible = v;
    },
  };
}
