import * as THREE from 'three';

/**
 * Shared uniforms for depth-based lighting effects.
 * All materials reference the same uniform objects so toggles update everywhere at once.
 */
export const depthUniforms = {
  uDepthDarkenEnabled: { value: 1.0 },
  uFogGradientEnabled: { value: 1.0 },
  uSurfaceY: { value: 4.5 },
  uTime: { value: 0.0 },
};

export function updateDepthTime(elapsed: number): void {
  depthUniforms.uTime.value = elapsed;
}

export function setDepthDarkenEnabled(on: boolean): void {
  depthUniforms.uDepthDarkenEnabled.value = on ? 1.0 : 0.0;
}

export function setFogGradientEnabled(on: boolean): void {
  depthUniforms.uFogGradientEnabled.value = on ? 1.0 : 0.0;
}

// GLSL declarations to inject into vertex shaders
const vertexDeclarations = `
  varying float vWorldY;
`;

const vertexTransform = `
  vec4 depthWorldPos = modelMatrix * vec4(transformed, 1.0);
  vWorldY = depthWorldPos.y;
`;

// GLSL declarations to inject into fragment shaders
const fragmentDeclarations = `
  uniform float uDepthDarkenEnabled;
  uniform float uFogGradientEnabled;
  uniform float uSurfaceY;
  varying float vWorldY;
`;

const fragmentEffect = `
  // --- Per-material depth-based lighting ---
  float depthBelowSurface = clamp((uSurfaceY - vWorldY) / uSurfaceY, 0.0, 1.0);

  // Depth darkening: exponential attenuation with depth
  if (uDepthDarkenEnabled > 0.5) {
    float attenuation = exp(-depthBelowSurface * 2.0);
    attenuation = mix(1.0, attenuation, 0.6);
    gl_FragColor.rgb *= attenuation;
  }

  // Fog gradient: denser and darker at depth
  if (uFogGradientEnabled > 0.5) {
    float fogStrength = depthBelowSurface * depthBelowSurface * 0.35;
    vec3 depthFogColor = mix(vec3(0.10, 0.22, 0.15), vec3(0.05, 0.12, 0.08), depthBelowSurface);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, depthFogColor, fogStrength);
  }
`;

/**
 * Inject depth-based lighting into a MeshStandardMaterial.
 * Can be called before or after other onBeforeCompile modifications —
 * it wraps any existing onBeforeCompile callback.
 */
export function injectDepthLighting(material: THREE.MeshStandardMaterial): void {
  const existingCallback = material.onBeforeCompile;

  material.onBeforeCompile = (shader, renderer) => {
    // Run any previously set onBeforeCompile first
    if (existingCallback) {
      existingCallback.call(material, shader, renderer);
    }

    // Add shared uniforms
    shader.uniforms.uDepthDarkenEnabled = depthUniforms.uDepthDarkenEnabled;
    shader.uniforms.uFogGradientEnabled = depthUniforms.uFogGradientEnabled;
    shader.uniforms.uSurfaceY = depthUniforms.uSurfaceY;

    // Vertex shader: add world Y varying
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
      ${vertexDeclarations}`,
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      ${vertexTransform}`,
    );

    // Fragment shader: add depth effect after final color
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
      ${fragmentDeclarations}`,
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `${fragmentEffect}
      #include <dithering_fragment>`,
    );
  };

  // Force recompilation
  material.needsUpdate = true;
}
