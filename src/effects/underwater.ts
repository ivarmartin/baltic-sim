import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/**
 * Underwater post-processing with toggleable effects:
 * - Base color grading + vignette (always on)
 * - Depth-based darkening (light attenuates with depth)
 * - Vertical fog gradient (denser at depth)
 * - God rays (screen-space radial blur from light source)
 */

const UnderwaterShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    uTime: { value: 0 },
    uVignetteStrength: { value: 1.2 },
    uCameraNear: { value: 0.1 },
    uCameraFar: { value: 50.0 },
    uCameraPosition: { value: new THREE.Vector3() },
    uInverseProjectionMatrix: { value: new THREE.Matrix4() },
    uInverseViewMatrix: { value: new THREE.Matrix4() },
    // Toggles
    uDepthDarken: { value: 1.0 },
    uFogGradient: { value: 1.0 },
    uGodRays: { value: 1.0 },
    // God ray params
    uLightScreenPos: { value: new THREE.Vector2(0.5, 0.0) },
    uGodRayIntensity: { value: 0.6 },
    // Surface height for depth calculation
    uSurfaceY: { value: 4.5 },
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
    uniform sampler2D tDepth;
    uniform float uTime;
    uniform float uVignetteStrength;
    uniform float uCameraNear;
    uniform float uCameraFar;
    uniform vec3 uCameraPosition;
    uniform mat4 uInverseProjectionMatrix;
    uniform mat4 uInverseViewMatrix;
    uniform float uDepthDarken;
    uniform float uFogGradient;
    uniform float uGodRays;
    uniform vec2 uLightScreenPos;
    uniform float uGodRayIntensity;
    uniform float uSurfaceY;
    varying vec2 vUv;

    float getLinearDepth(vec2 uv) {
      float fragDepth = texture2D(tDepth, uv).r;
      float ndc = fragDepth * 2.0 - 1.0;
      float linearDepth = (2.0 * uCameraNear * uCameraFar) / (uCameraFar + uCameraNear - ndc * (uCameraFar - uCameraNear));
      return linearDepth;
    }

    vec3 getWorldPos(vec2 uv) {
      float depth = texture2D(tDepth, uv).r;
      vec4 clipPos = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
      vec4 viewPos = uInverseProjectionMatrix * clipPos;
      viewPos /= viewPos.w;
      vec4 worldPos = uInverseViewMatrix * viewPos;
      return worldPos.xyz;
    }

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

      // --- Reconstruct world position for depth effects ---
      vec3 worldPos = getWorldPos(vUv);
      float worldY = worldPos.y;
      float depthBelowSurface = clamp((uSurfaceY - worldY) / uSurfaceY, 0.0, 1.0);

      // --- Depth-based darkening ---
      if (uDepthDarken > 0.5) {
        // Exponential light attenuation with depth
        float attenuation = exp(-depthBelowSurface * 2.5);
        attenuation = mix(1.0, attenuation, 0.7); // don't go fully black
        color.rgb *= attenuation;
      }

      // --- Vertical fog gradient ---
      if (uFogGradient > 0.5) {
        // Denser fog at depth, thinner near surface
        float linearDepth = getLinearDepth(vUv);
        float fogDensity = 0.12 + depthBelowSurface * 0.15; // more fog deeper
        float fogFactor = 1.0 - exp(-fogDensity * linearDepth);
        // Fog color: darker green at depth, lighter green near surface
        vec3 fogColor = mix(vec3(0.08, 0.18, 0.12), vec3(0.12, 0.25, 0.18), 1.0 - depthBelowSurface);
        color.rgb = mix(color.rgb, fogColor, fogFactor * 0.5);
      }

      // --- God rays ---
      if (uGodRays > 0.5) {
        // Screen-space radial blur from light position
        vec2 deltaUv = (vUv - uLightScreenPos) * 0.02;
        float illumination = 0.0;
        vec2 sampleUv = vUv;
        float decay = 0.96;
        float weight = 0.4;

        for (int i = 0; i < 30; i++) {
          sampleUv -= deltaUv;
          vec4 sampleColor = texture2D(tDiffuse, clamp(sampleUv, 0.0, 1.0));
          float brightness = dot(sampleColor.rgb, vec3(0.3, 0.5, 0.2));
          illumination += brightness * weight;
          weight *= decay;
        }

        // Tint god rays with warm aqua-green
        vec3 rayColor = vec3(0.15, 0.35, 0.25) * illumination * uGodRayIntensity;
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
  // Create render target with depth texture
  const size = renderer.getSize(new THREE.Vector2());
  const renderTarget = new THREE.WebGLRenderTarget(size.x, size.y, {
    depthTexture: new THREE.DepthTexture(size.x, size.y),
    depthBuffer: true,
  });
  renderTarget.depthTexture!.format = THREE.DepthFormat;
  renderTarget.depthTexture!.type = THREE.UnsignedIntType;

  const composer = new EffectComposer(renderer, renderTarget);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const underwaterPass = new ShaderPass(UnderwaterShader);
  underwaterPass.uniforms.tDepth.value = renderTarget.depthTexture;
  underwaterPass.uniforms.uCameraNear.value = camera.near;
  underwaterPass.uniforms.uCameraFar.value = camera.far;
  composer.addPass(underwaterPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  // Temp vectors for projection
  const _lightScreenPos = new THREE.Vector3();

  return {
    composer,
    update(elapsed: number, cam: THREE.Camera, lightWorldPos: THREE.Vector3) {
      underwaterPass.uniforms.uTime.value = elapsed;
      underwaterPass.uniforms.uCameraPosition.value.copy(cam.position);
      underwaterPass.uniforms.uInverseProjectionMatrix.value.copy(
        (cam as THREE.PerspectiveCamera).projectionMatrixInverse,
      );
      underwaterPass.uniforms.uInverseViewMatrix.value.copy(cam.matrixWorld);

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
