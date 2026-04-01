import * as THREE from 'three';

/**
 * Injects animated caustic light patterns into the seabed material's fragment shader.
 * Uses layered sine waves in world-space XZ coordinates for a procedural caustic effect.
 */
export function setupCaustics(seabedMaterial: THREE.MeshStandardMaterial): void {
  let shaderRef: { uniforms: Record<string, THREE.IUniform> } | null = null;

  seabedMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uCausticStrength = { value: 0.25 };

    // Add world position varying to vertex shader
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
      varying vec3 vWorldPos;
      `,
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `#include <worldpos_vertex>
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      `,
    );

    // Add caustic calculation to fragment shader
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
      uniform float uTime;
      uniform float uCausticStrength;
      varying vec3 vWorldPos;
      `,
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      // Procedural caustics - layered sine interference
      vec2 cUv = vWorldPos.xz;
      float caustic = 0.0;
      for (int i = 0; i < 3; i++) {
        float fi = float(i);
        vec2 p = cUv * (1.5 + fi * 0.5) + uTime * (0.03 + fi * 0.01);
        caustic += sin(p.x * 6.28 + sin(p.y * 3.14 + uTime * (0.8 + fi * 0.2)))
                 * sin(p.y * 6.28 + sin(p.x * 3.14 + uTime * (1.0 + fi * 0.15)));
      }
      caustic = pow(abs(caustic) / 3.0, 2.5) * uCausticStrength;
      gl_FragColor.rgb += vec3(caustic * 0.7, caustic * 0.85, caustic * 0.5);

      #include <dithering_fragment>
      `,
    );

    shaderRef = shader;
  };

  // Store update function on material's userData for the animation loop
  seabedMaterial.userData.updateCaustics = (elapsed: number) => {
    if (shaderRef) {
      shaderRef.uniforms.uTime.value = elapsed;
    }
  };

  // We need the main loop to call this, so we'll add it via a proxy
  // The main.ts will need to handle this - let's use a different approach
  // and register the update in the material itself
}
