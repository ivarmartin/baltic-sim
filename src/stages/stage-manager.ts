import * as THREE from 'three';
import type { Chapter, EnvironmentPreset } from './chapter-data';
import type { NarrativeUI } from '../ui/narrative';
import type { EnvironmentResult } from '../scene/environment';

/** Environment presets: fogColor, fogDensity, bgColor, sunIntensity, ambientIntensity, hemiIntensity, exposure */
const presets: Record<EnvironmentPreset, { fogColor: THREE.Color; fogDensity: number; bgColor: THREE.Color; sunIntensity: number; ambientIntensity: number; hemiIntensity: number; exposure: number }> = {
  'above-water': { fogColor: new THREE.Color(0xc8d8e8), fogDensity: 0.01, bgColor: new THREE.Color(0x87ceeb), sunIntensity: 3.0, ambientIntensity: 1.0, hemiIntensity: 0.6, exposure: 2.03 },
  'shallow':     { fogColor: new THREE.Color(0x1a3a2a), fogDensity: 0.18, bgColor: new THREE.Color(0x0d2818), sunIntensity: 1.8, ambientIntensity: 0.5, hemiIntensity: 0.3, exposure: 1.18 },
  'mid-depth':   { fogColor: new THREE.Color(0x152e22), fogDensity: 0.22, bgColor: new THREE.Color(0x0a2015), sunIntensity: 1.2, ambientIntensity: 0.35, hemiIntensity: 0.2, exposure: 0.94 },
  'deep':        { fogColor: new THREE.Color(0x0a1a10), fogDensity: 0.28, bgColor: new THREE.Color(0x060f0a), sunIntensity: 0.6, ambientIntensity: 0.2, hemiIntensity: 0.1, exposure: 0.68 },
  'dead-zone':   { fogColor: new THREE.Color(0x050a05), fogDensity: 0.38, bgColor: new THREE.Color(0x020504), sunIntensity: 0.15, ambientIntensity: 0.05, hemiIntensity: 0.03, exposure: 0.34 },
  'shipwreck':   { fogColor: new THREE.Color(0x1a3a2a), fogDensity: 0.20, bgColor: new THREE.Color(0x0d2818), sunIntensity: 1.5, ambientIntensity: 0.45, hemiIntensity: 0.25, exposure: 1.11 },
  'dead-bay':    { fogColor: new THREE.Color(0x1a3a1a), fogDensity: 0.28, bgColor: new THREE.Color(0x0a200a), sunIntensity: 0.8, ambientIntensity: 0.25, hemiIntensity: 0.15, exposure: 0.77 },
};

export interface StageVisibilityGroups {
  [key: string]: THREE.Object3D | undefined;
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
  setPikeHold?: (hold: boolean) => void;
  setCodHold?: (hold: boolean) => void;
}

export interface StageManager {
  update: (elapsed: number, dt: number) => void;
  onViewChange: (index: number) => void;
  loadChapter: (chapter: Chapter) => void;
  dispose: () => void;
}

export function createStageManager(deps: StageManagerDeps): StageManager {
  const { scene, renderer, environment, narrative, groups } = deps;

  let currentChapter: Chapter | null = null;
  let currentStage = 0;
  let prevEnvironment: EnvironmentPreset = 'shallow';
  let targetEnvironment: EnvironmentPreset = 'shallow';
  let envTransitionT = 1.0;
  const envTransitionSpeed = 1.5;

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

  function hideAllGroups() {
    for (const key of Object.keys(groups)) {
      const obj = groups[key];
      if (obj) obj.visible = false;
    }
  }

  function showGroupsForStage(chapter: Chapter, index: number) {
    const keys = chapter.stageVisibility[index] || [];
    for (const key of keys) {
      const obj = groups[key];
      if (obj) obj.visible = true;
    }
  }

  function hideGroupsForStage(chapter: Chapter, index: number) {
    const keys = chapter.stageVisibility[index] || [];
    for (const key of keys) {
      const obj = groups[key];
      if (obj) obj.visible = false;
    }
  }

  function applyCallbacks(chapter: Chapter, index: number) {
    const callbackId = chapter.stageCallbacks?.[index];

    // Reset all holds by default
    deps.setSticklebackHold?.(false);
    deps.setPerchHold?.(false);
    deps.setPikeHold?.(false);
    deps.setCodHold?.(false);
    deps.setParticleDensity?.(1.0);

    if (callbackId === 'stickleback-hold') {
      deps.setSticklebackHold?.(true);
    } else if (callbackId === 'perch-hold') {
      deps.setPerchHold?.(true);
    } else if (callbackId === 'pike-hold') {
      deps.setPikeHold?.(true);
    } else if (callbackId === 'cod-hold') {
      deps.setCodHold?.(true);
    }

    // Dead zone particle density
    if (chapter.stages[index]?.environment === 'dead-zone') {
      deps.setParticleDensity?.(0.15);
    }
  }

  function loadChapter(chapter: Chapter) {
    currentChapter = chapter;
    currentStage = 0;

    hideAllGroups();

    const stage = chapter.stages[0];
    applyEnvironmentInstant(stage.environment);
    prevEnvironment = stage.environment;
    targetEnvironment = stage.environment;
    envTransitionT = 1.0;

    narrative.setText(stage.narrative);
    narrative.show();

    showGroupsForStage(chapter, 0);
    applyCallbacks(chapter, 0);
  }

  function onViewChange(index: number) {
    if (!currentChapter) return;

    hideGroupsForStage(currentChapter, currentStage);
    currentStage = index;
    showGroupsForStage(currentChapter, index);

    const stage = currentChapter.stages[index];
    narrative.setText(stage.narrative);

    prevEnvironment = targetEnvironment;
    targetEnvironment = stage.environment;
    envTransitionT = 0;

    applyCallbacks(currentChapter, index);
  }

  function update(_elapsed: number, dt: number) {
    if (envTransitionT < 1.0) {
      envTransitionT = Math.min(envTransitionT + dt * envTransitionSpeed, 1.0);
      lerpEnvironment(prevEnvironment, targetEnvironment, envTransitionT);
    }
  }

  function dispose() {
    // Nothing to clean up currently
  }

  return { update, onViewChange, loadChapter, dispose };
}
