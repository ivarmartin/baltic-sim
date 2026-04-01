import * as THREE from 'three';
import { stages, type EnvironmentPreset } from './stage-data';
import type { NarrativeUI } from '../ui/narrative';
import type { EnvironmentResult } from '../scene/environment';


/** Environment presets: [fogColor, fogDensity, bgColor, sunIntensity, ambientIntensity, hemiIntensity, exposure] */
const presets: Record<EnvironmentPreset, { fogColor: THREE.Color; fogDensity: number; bgColor: THREE.Color; sunIntensity: number; ambientIntensity: number; hemiIntensity: number; exposure: number }> = {
  'above-water': { fogColor: new THREE.Color(0xc8d8e8), fogDensity: 0.01, bgColor: new THREE.Color(0x87ceeb), sunIntensity: 3.0, ambientIntensity: 1.0, hemiIntensity: 0.6, exposure: 1.2 },
  'shallow':     { fogColor: new THREE.Color(0x1a3a2a), fogDensity: 0.18, bgColor: new THREE.Color(0x0d2818), sunIntensity: 1.8, ambientIntensity: 0.5, hemiIntensity: 0.3, exposure: 0.7 },
  'mid-depth':   { fogColor: new THREE.Color(0x152e22), fogDensity: 0.22, bgColor: new THREE.Color(0x0a2015), sunIntensity: 1.2, ambientIntensity: 0.35, hemiIntensity: 0.2, exposure: 0.55 },
  'deep':        { fogColor: new THREE.Color(0x0a1a10), fogDensity: 0.28, bgColor: new THREE.Color(0x060f0a), sunIntensity: 0.6, ambientIntensity: 0.2, hemiIntensity: 0.1, exposure: 0.4 },
  'dead-zone':   { fogColor: new THREE.Color(0x050a05), fogDensity: 0.38, bgColor: new THREE.Color(0x020504), sunIntensity: 0.15, ambientIntensity: 0.05, hemiIntensity: 0.03, exposure: 0.2 },
  'shipwreck':   { fogColor: new THREE.Color(0x1a3a2a), fogDensity: 0.20, bgColor: new THREE.Color(0x0d2818), sunIntensity: 1.5, ambientIntensity: 0.45, hemiIntensity: 0.25, exposure: 0.65 },
};

export interface StageVisibilityGroups {
  island?: THREE.Object3D;
  sky?: THREE.Object3D;
  filamentousAlgae?: THREE.Object3D;
  sticklebackSwarm?: THREE.Object3D;
  pike?: THREE.Object3D;
  reeds?: THREE.Object3D;
  cod?: THREE.Object3D;
  halocline?: THREE.Object3D;
  deadZone?: THREE.Object3D;
  mussels?: THREE.Object3D;
  shipworm?: THREE.Object3D;
}

export interface StageManagerDeps {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  cameraRig: THREE.Group;
  renderer: THREE.WebGLRenderer;
  environment: EnvironmentResult;
  narrative: NarrativeUI;
  groups: StageVisibilityGroups;
  setParticleDensity?: (factor: number) => void;
  setSticklebackHold?: (hold: boolean) => void;
  setPerchHold?: (hold: boolean) => void;
}

/** Which visibility groups each stage shows. */
const stageVisibility: Record<number, (keyof StageVisibilityGroups)[]> = {
  0: [],                                         // Stage 1: Welcome
  1: ['filamentousAlgae'],                      // Stage 2: Forest
  2: ['sticklebackSwarm', 'pike', 'reeds'],     // Stage 3: Swarm
  3: ['cod'],                                   // Stage 4: Cod
  4: ['halocline', 'deadZone'],                 // Stage 5: Dead Zone
  5: ['mussels', 'shipworm'],                   // Stage 6: Shipwreck
  6: [],                                        // Stage 7: Ascent (looking up at jetty)
};

export interface StageManager {
  update: (elapsed: number, dt: number) => void;
  onViewChange: (index: number) => void;
  dispose: () => void;
}

export function createStageManager(deps: StageManagerDeps): StageManager {
  const { scene, renderer, environment, narrative, groups } = deps;

  let currentStage = 0;
  let prevEnvironment: EnvironmentPreset = stages[0].environment;
  let targetEnvironment: EnvironmentPreset = stages[0].environment;
  let envTransitionT = 1.0; // start fully applied
  const envTransitionSpeed = 1.5; // how fast environment crossfades (per second)

  // Apply initial environment
  applyEnvironmentInstant(stages[0].environment);

  // Show initial narrative
  narrative.setText(stages[0].narrative);
  narrative.show();

  // Hide all stage-specific groups initially
  for (const key of Object.keys(groups) as (keyof StageVisibilityGroups)[]) {
    const obj = groups[key];
    if (obj) obj.visible = false;
  }
  // Show stage 0 groups
  showGroupsForStage(0);

  function showGroupsForStage(index: number) {
    const keys = stageVisibility[index] || [];
    for (const key of keys) {
      const obj = groups[key];
      if (obj) obj.visible = true;
    }
  }

  function hideGroupsForStage(index: number) {
    const keys = stageVisibility[index] || [];
    for (const key of keys) {
      const obj = groups[key];
      if (obj) obj.visible = false;
    }
  }

  function applyEnvironmentInstant(preset: EnvironmentPreset) {
    const p = presets[preset];
    const fog = scene.fog as THREE.FogExp2;
    fog.color.copy(p.fogColor);
    fog.density = p.fogDensity;
    (scene.background as THREE.Color).copy(p.bgColor);
    environment.sunLight.intensity = p.sunIntensity;
    environment.ambient.intensity = p.ambientIntensity;
    environment.hemi.intensity = p.hemiIntensity;
    renderer.toneMappingExposure = p.exposure;
  }

  function lerpEnvironment(from: EnvironmentPreset, to: EnvironmentPreset, t: number) {
    const a = presets[from];
    const b = presets[to];
    const fog = scene.fog as THREE.FogExp2;
    fog.color.copy(a.fogColor).lerp(b.fogColor, t);
    fog.density = a.fogDensity + (b.fogDensity - a.fogDensity) * t;
    (scene.background as THREE.Color).copy(a.bgColor).lerp(b.bgColor, t);
    environment.sunLight.intensity = a.sunIntensity + (b.sunIntensity - a.sunIntensity) * t;
    environment.ambient.intensity = a.ambientIntensity + (b.ambientIntensity - a.ambientIntensity) * t;
    environment.hemi.intensity = a.hemiIntensity + (b.hemiIntensity - a.hemiIntensity) * t;
    renderer.toneMappingExposure = a.exposure + (b.exposure - a.exposure) * t;
  }

  function onViewChange(index: number) {
    // Exit old stage
    hideGroupsForStage(currentStage);

    // Enter new stage
    currentStage = index;
    showGroupsForStage(index);

    // Update narrative text
    const stage = stages[index];
    narrative.setText(stage.narrative);

    // Start environment crossfade
    prevEnvironment = targetEnvironment;
    targetEnvironment = stage.environment;
    envTransitionT = 0;

    // Update fish hold states
    deps.setSticklebackHold?.(index === 2);
    deps.setPerchHold?.(index === 1);

    // Update particle density for dead zone
    if (index === 4) {
      deps.setParticleDensity?.(0.15);
    } else {
      deps.setParticleDensity?.(1.0);
    }
  }

  function update(_elapsed: number, dt: number) {
    // Environment crossfade
    if (envTransitionT < 1.0) {
      envTransitionT = Math.min(envTransitionT + dt * envTransitionSpeed, 1.0);
      lerpEnvironment(prevEnvironment, targetEnvironment, envTransitionT);
    }
  }

  function dispose() {
    // Nothing to clean up currently
  }

  return { update, onViewChange, dispose };
}
