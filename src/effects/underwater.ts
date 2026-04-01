import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/**
 * Underwater post-processing with toggleable effects:
 * - Base color grading + vignette (always on)
 * - Depth-based darkening (screen-space vertical gradient)
 * - Vertical fog gradient (denser toward bottom of screen)
 * - God rays (screen-space radial blur from light source)
 */

const UnderwaterShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uVignetteStrength: { value: 1.2 },
    // Toggles (1.0 = on, 0.0 = off)
    uDepthDarken: { value: 1.0 },
    uFogGradient: { value: 1.0 },
    uGodRays: { value: 1.0 },
    // God ray params
    uLightScreenPos: { value: new THREE.Vector2(0.5, 0.0) },
    uGodRayIntensity: { value: 0.5 },
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
    uniform float uDepthDarken;
    uniform float uFogGradient;
    uniform float uGodRays;
    uniform vec2 uLightScreenPos;
    uniform float uGodRayIntensity;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;

      // Subtle water refraction distortion
      uv.x += sin(uv.y * 18.0 + uTime * 0.5) * 0.0015;
      uv.y += cos(uv.x * 14.0 + uTime * 0.35) * 0.0012;

      vec4 color = texture2D(tDiffuse, uv);

      // Base color grading: push toward murky green
      color.r *= 0.78;
      color.g *= 0.95;
      color.b *= 0.85;

      // Screen-space depth proxy: bottom of screen = deeper, top = shallower
      // vUv.y: 0 = bottom (deeper), 1 = top (surface)
      float depthFactor = 1.0 - vUv.y; // 0 at top, 1 at bottom

      // --- Depth-based darkening ---
      if (uDepthDarken > 0.5) {
        // Upper part of screen (near surface) stays brighter
        // Lower part gets progressively darker
        float attenuation = 1.0 - depthFactor * 0.55;
        color.rgb *= attenuation;
      }

      // --- Vertical fog gradient ---
      if (uFogGradient > 0.5) {
        // Thicker fog toward the bottom
        float fogStrength = depthFactor * depthFactor * 0.4;
        vec3 fogColor = mix(vec3(0.10, 0.22, 0.15), vec3(0.06, 0.14, 0.09), depthFactor);
        color.rgb = mix(color.rgb, fogColor, fogStrength);
      }

      // --- God rays ---
      if (uGodRays > 0.5) {
        // Screen-space radial blur from projected light position
        vec2 deltaUv = (vUv - uLightScreenPos) * 0.015;
        float illumination = 0.0;
        vec2 sampleUv = vUv;
        float decay = 0.97;
        float weight = 0.3;

        for (int i = 0; i < 40; i++) {
          sampleUv -= deltaUv;
          vec4 sampleColor = texture2D(tDiffuse, clamp(sampleUv, 0.0, 1.0));
          float brightness = dot(sampleColor.rgb, vec3(0.3, 0.5, 0.2));
          illumination += brightness * weight;
          weight *= decay;
        }

        // Tint god rays warm aqua-green, stronger toward the top of screen
        float rayFade = smoothstep(0.8, 0.0, depthFactor); // fade out toward bottom
        vec3 rayColor = vec3(0.12, 0.28, 0.18) * illumination * uGodRayIntensity * rayFade;
        color.rgb += rayColor;
      }

      // --- Vignette (always on) ---
      float dist = length(vUv - 0.5);
      float vignette = 1.0 - dist * dist * uVignetteStrength;
      color.rgb *= clamp(vignette, 0.0, 1.0);

      gl_FragColor = color;
    }
  `,
};

export interface UnderwaterEffects {
  composer: EffectComposer;
  update: (elapsed: number, camera: THREE.Camera, lightWorldPos: THREE.Vector3) => void;
  setDepthDarken: (on: boolean) => void;
  setFogGradient: (on: boolean) => void;
  setGodRays: (on: boolean) => void;
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

  // Temp vector for screen-space projection
  const _lightScreenPos = new THREE.Vector3();

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
    setDepthDarken(on: boolean) {
      underwaterPass.uniforms.uDepthDarken.value = on ? 1.0 : 0.0;
    },
    setFogGradient(on: boolean) {
      underwaterPass.uniforms.uFogGradient.value = on ? 1.0 : 0.0;
    },
    setGodRays(on: boolean) {
      underwaterPass.uniforms.uGodRays.value = on ? 1.0 : 0.0;
    },
  };
}
