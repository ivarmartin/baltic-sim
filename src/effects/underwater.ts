import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const UnderwaterShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uVignetteStrength: { value: 1.2 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVignetteStrength;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;

      // Subtle water refraction distortion
      uv.x += sin(uv.y * 18.0 + uTime * 0.5) * 0.0015;
      uv.y += cos(uv.x * 14.0 + uTime * 0.35) * 0.0012;

      vec4 color = texture2D(tDiffuse, uv);

      // Push toward murky green
      color.r *= 0.78;
      color.g *= 0.95;
      color.b *= 0.85;

      // Vignette - darken edges
      float dist = length(vUv - 0.5);
      float vignette = 1.0 - dist * dist * uVignetteStrength;
      color.rgb *= clamp(vignette, 0.0, 1.0);

      gl_FragColor = color;
    }
  `,
};

let underwaterPass: ShaderPass | null = null;

export function createUnderwaterEffect(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
): EffectComposer {
  const composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  underwaterPass = new ShaderPass(UnderwaterShader);
  composer.addPass(underwaterPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  return composer;
}

/**
 * Call this each frame to update time-based uniforms.
 */
export function updateUnderwaterEffect(elapsed: number): void {
  if (underwaterPass) {
    underwaterPass.uniforms.uTime.value = elapsed;
  }
}
