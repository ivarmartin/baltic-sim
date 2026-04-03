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

    // Add caustic functions and uniforms to fragment shader declarations
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
      uniform float uTime;
      uniform float uCausticStrength;
      varying vec3 vWorldPos;

      vec2 causticHash(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }

      float causticNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(dot(causticHash(i), f),
              dot(causticHash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
          mix(dot(causticHash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
              dot(causticHash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
          u.y
        );
      }
      `,
    );

    // Add caustic calculation inside main()
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      // Procedural caustics - noise-warped sine interference
      vec2 cUv = vWorldPos.xz;

      // Domain warp: distort UVs with noise to break repetition
      vec2 warp = vec2(
        causticNoise(cUv * 0.4 + uTime * 0.02),
        causticNoise(cUv * 0.4 + vec2(5.2, 1.3) + uTime * 0.025)
      );
      cUv += warp * 1.8;

      // Use irrational-ratio frequencies to avoid visible tiling
      float caustic = 0.0;
      caustic += sin(cUv.x * 5.13 + sin(cUv.y * 2.67 + uTime * 0.78))
               * sin(cUv.y * 4.71 + sin(cUv.x * 3.09 + uTime * 0.93));

      caustic += sin(cUv.x * 7.91 + sin(cUv.y * 4.43 + uTime * 0.65))
               * sin(cUv.y * 8.37 + sin(cUv.x * 5.17 + uTime * 0.82))
               * 0.7;

      caustic += sin(cUv.x * 12.53 + sin(cUv.y * 7.19 + uTime * 1.1))
               * sin(cUv.y * 11.07 + sin(cUv.x * 8.83 + uTime * 0.71))
               * 0.4;

      // Small high-freq detail layer for extra breakup
      caustic += causticNoise(cUv * 3.7 + uTime * 0.15) * 0.35;

      caustic = pow(abs(caustic) / 3.0, 2.5) * uCausticStrength;

      // Fade caustics near the surface — they need water depth to form
      float causticDepth = uSurfaceY - vWorldPos.y;
      caustic *= smoothstep(0.0, 4.0, causticDepth);

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
