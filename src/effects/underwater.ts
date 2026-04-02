import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/**
 * Post-processing: base color grading, vignette, refraction distortion, god rays.
 * Depth darkening and fog gradient are now handled per-material (see depth-lighting.ts).
 */

const UnderwaterShader = {
  uniforms: {
    tDiffuse: { value: null },
    tOcclusion: { value: null },
    uTime: { value: 0 },
    uVignetteStrength: { value: 1.2 },
    uGodRays: { value: 1.0 },
    uLightScreenPos: { value: new THREE.Vector2(0.5, 0.0) },
    uGodRayIntensity: { value: 0.5 },
    uUnderwaterMix: { value: 1.0 },
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
    uniform sampler2D tOcclusion;
    uniform float uTime;
    uniform float uVignetteStrength;
    uniform float uGodRays;
    uniform vec2 uLightScreenPos;
    uniform float uGodRayIntensity;
    uniform float uUnderwaterMix;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;

      // Subtle water refraction distortion (scaled by underwater mix)
      uv.x += sin(uv.y * 18.0 + uTime * 0.5) * 0.00075 * uUnderwaterMix;
      uv.y += cos(uv.x * 14.0 + uTime * 0.35) * 0.0006 * uUnderwaterMix;

      vec4 color = texture2D(tDiffuse, uv);

      // Base color grading: push toward murky green (scaled by mix)
      color.r *= mix(1.0, 0.78, uUnderwaterMix);
      color.g *= mix(1.0, 0.95, uUnderwaterMix);
      color.b *= mix(1.0, 0.85, uUnderwaterMix);

      // --- God rays ---
      if (uGodRays > 0.5 && uUnderwaterMix > 0.1) {
        vec2 deltaUv = (vUv - uLightScreenPos) * 0.015;
        float illumination = 0.0;
        vec2 sampleUv = vUv;
        float decay = 0.97;
        float weight = 0.3;

        for (int i = 0; i < 40; i++) {
          sampleUv -= deltaUv;
          vec4 sampleColor = texture2D(tOcclusion, clamp(sampleUv, 0.0, 1.0));
          float brightness = dot(sampleColor.rgb, vec3(0.3, 0.5, 0.2));
          illumination += brightness * weight;
          weight *= decay;
        }

        // Fade god rays toward the bottom of screen (deeper = less light)
        float rayFade = smoothstep(0.0, 0.6, vUv.y);
        vec3 rayColor = vec3(0.12, 0.28, 0.18) * illumination * uGodRayIntensity * rayFade * uUnderwaterMix;
        color.rgb += rayColor;
      }

      // --- Vignette (scaled by mix) ---
      float dist = length(vUv - 0.5);
      float vignette = 1.0 - dist * dist * uVignetteStrength * uUnderwaterMix;
      color.rgb *= clamp(vignette, 0.0, 1.0);

      // --- Dithering to reduce color banding ---
      // Triangular-distributed noise in [-0.5/255, 0.5/255] range
      vec3 dither = vec3(
        fract(sin(dot(vUv + fract(uTime), vec2(12.9898, 78.233))) * 43758.5453),
        fract(sin(dot(vUv + fract(uTime), vec2(93.9898, 67.345))) * 24634.6345),
        fract(sin(dot(vUv + fract(uTime), vec2(45.4647, 37.158))) * 57382.3456)
      );
      // Triangular PDF: sum two uniform samples and center around zero
      vec3 dither2 = vec3(
        fract(sin(dot(vUv + fract(uTime) + 0.1, vec2(12.9898, 78.233))) * 43758.5453),
        fract(sin(dot(vUv + fract(uTime) + 0.1, vec2(93.9898, 67.345))) * 24634.6345),
        fract(sin(dot(vUv + fract(uTime) + 0.1, vec2(45.4647, 37.158))) * 57382.3456)
      );
      color.rgb += (dither + dither2 - 1.0) / 128.0;

      gl_FragColor = color;
    }
  `,
};

export interface UnderwaterEffects {
  composer: EffectComposer;
  update: (elapsed: number, camera: THREE.Camera, lightWorldPos: THREE.Vector3) => void;
  renderOcclusion: (scene: THREE.Scene, camera: THREE.Camera) => void;
  setGodRays: (on: boolean) => void;
  setMix: (t: number) => void;
  setSize: (width: number, height: number) => void;
}

export function createUnderwaterEffect(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
): UnderwaterEffects {
  const composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const underwaterPass = new ShaderPass(UnderwaterShader);
  composer.addPass(underwaterPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  const _lightScreenPos = new THREE.Vector3();

  // Occlusion target: environment-only render for god ray sampling
  const occlusionTarget = new THREE.WebGLRenderTarget(
    renderer.domElement.clientWidth * renderer.getPixelRatio(),
    renderer.domElement.clientHeight * renderer.getPixelRatio(),
  );
  underwaterPass.uniforms.tOcclusion.value = occlusionTarget.texture;

  return {
    composer,
    update(elapsed: number, cam: THREE.Camera, lightWorldPos: THREE.Vector3) {
      underwaterPass.uniforms.uTime.value = elapsed;

      // Project light position to screen space for god rays
      _lightScreenPos.copy(lightWorldPos);
      _lightScreenPos.project(cam);
      underwaterPass.uniforms.uLightScreenPos.value.set(
        _lightScreenPos.x * 0.5 + 0.5,
        _lightScreenPos.y * 0.5 + 0.5,
      );
    },
    renderOcclusion(scene: THREE.Scene, cam: THREE.Camera) {
      // Render environment only (layer 0) for god ray sampling
      const savedMask = cam.layers.mask;
      cam.layers.set(0);
      renderer.setRenderTarget(occlusionTarget);
      renderer.render(scene, cam);
      renderer.setRenderTarget(null);
      cam.layers.mask = savedMask;
    },
    setGodRays(on: boolean) {
      underwaterPass.uniforms.uGodRays.value = on ? 1.0 : 0.0;
    },
    setMix(t: number) {
      underwaterPass.uniforms.uUnderwaterMix.value = Math.max(0, Math.min(1, t));
    },
    setSize(width: number, height: number) {
      occlusionTarget.setSize(
        width * renderer.getPixelRatio(),
        height * renderer.getPixelRatio(),
      );
    },
  };
}
