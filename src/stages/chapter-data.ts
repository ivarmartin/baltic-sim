import * as THREE from 'three';
import type { CameraView } from '../ui/navigation';

export type EnvironmentPreset = 'above-water' | 'shallow' | 'mid-depth' | 'deep' | 'dead-zone' | 'shipwreck' | 'dead-bay';

export interface StageDefinition {
  id: string;
  cameraView: CameraView;
  transitionDuration: number;
  environment: EnvironmentPreset;
}

export interface Chapter {
  id: string;
  type?: 'chapter' | 'appendix';
  stages: StageDefinition[];
  /** Maps stage ID → array of visibility group keys to show. */
  stageVisibility: Record<string, string[]>;
  /** Optional per-stage callbacks keyed by stage ID. */
  stageCallbacks?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────
//  Chapter 1 - Intro to the Baltic
// ─────────────────────────────────────────────────────────────

const introStages: StageDefinition[] = [
  {
    id: 'intro-welcome',
    cameraView: {
      position: new THREE.Vector3(5, 2.5, 1.0),
      lookAt: new THREE.Vector3(0, 0.5, -2.5),
    },
    transitionDuration: 2.5,
    environment: 'shallow',
  },
  {
    id: 'intro-underwater-forest',
    cameraView: {
      position: new THREE.Vector3(1.5, 0.5, 1.0),
      lookAt: new THREE.Vector3(0.5, 0.3, -1.0),
    },
    transitionDuration: 2.5,
    environment: 'shallow',
  },
  {
    id: 'intro-stickleback-swarm',
    cameraView: {
      position: new THREE.Vector3(-8, 1.5, -4),
      lookAt: new THREE.Vector3(-10, 1.0, -7),
    },
    transitionDuration: 2.0,
    environment: 'shallow',
  },
  {
    id: 'intro-shrinking-cod',
    cameraView: {
      position: new THREE.Vector3(3.6, -1.4, -12.2),
      lookAt: new THREE.Vector3(2, -3, -17),
    },
    transitionDuration: 2.5,
    environment: 'deep',
  },
  {
    id: 'intro-dead-zone',
    cameraView: {
      position: new THREE.Vector3(3, -6, -20),
      lookAt: new THREE.Vector3(2, -8, -24),
    },
    transitionDuration: 3.0,
    environment: 'dead-zone',
  },
  {
    id: 'intro-shipwreck',
    cameraView: {
      position: new THREE.Vector3(6.5, 0.8, -5),
      lookAt: new THREE.Vector3(5, 0.2, -6),
    },
    transitionDuration: 2.0,
    environment: 'shipwreck',
  },
  {
    id: 'intro-what-you-can-do',
    cameraView: {
      position: new THREE.Vector3(1.5, 2.0, 0.5),
      lookAt: new THREE.Vector3(0, 4.5, -2.6),
    },
    transitionDuration: 3.0,
    environment: 'shallow',
  },
];

const introVisibility: Record<string, string[]> = {
  'intro-welcome': [],
  'intro-underwater-forest': ['filamentousAlgae'],
  'intro-stickleback-swarm': ['sticklebackSwarm', 'pike', 'reeds'],
  'intro-shrinking-cod': ['cod'],
  'intro-dead-zone': ['halocline', 'deadZone'],
  'intro-shipwreck': ['mussels', 'shipworm'],
  'intro-what-you-can-do': [],
};

// ─────────────────────────────────────────────────────────────
//  Chapter 2 - The Pike
// ─────────────────────────────────────────────────────────────

const pikeStages: StageDefinition[] = [
  {
    id: 'pike-meet',
    cameraView: {
      position: new THREE.Vector3(-18, 2.5, 9),
      lookAt: new THREE.Vector3(-20, 2.3, 10.5),
    },
    transitionDuration: 2.5,
    environment: 'shallow',
  },
  {
    id: 'pike-why-it-matters',
    cameraView: {
      position: new THREE.Vector3(-7, 1.8, -3),
      lookAt: new THREE.Vector3(-10, 0.8, -7),
    },
    transitionDuration: 2.5,
    environment: 'shallow',
  },
  {
    id: 'pike-lost-nurseries',
    cameraView: {
      position: new THREE.Vector3(20, 1.2, 5),
      lookAt: new THREE.Vector3(24, 2.5, 10),
    },
    transitionDuration: 2.5,
    environment: 'shallow',
  },
  {
    id: 'pike-stickleback-invasion',
    cameraView: {
      position: new THREE.Vector3(-8, 1.2, -5),
      lookAt: new THREE.Vector3(-10, 0.6, -7.5),
    },
    transitionDuration: 2.0,
    environment: 'shallow',
  },
  {
    id: 'pike-seal-in-bay',
    cameraView: {
      position: new THREE.Vector3(-7, 1.5, -5),
      lookAt: new THREE.Vector3(-10, 1.0, -8),
    },
    transitionDuration: 2.5,
    environment: 'shallow',
  },
  {
    id: 'pike-chain-reaction',
    cameraView: {
      position: new THREE.Vector3(-8, 1.0, -4),
      lookAt: new THREE.Vector3(-10, 0.5, -7),
    },
    transitionDuration: 2.5,
    environment: 'dead-bay',
  },
  {
    id: 'pike-bringing-back',
    cameraView: {
      position: new THREE.Vector3(18, 1.5, -4),
      lookAt: new THREE.Vector3(20, 0.8, -6),
    },
    transitionDuration: 3.0,
    environment: 'shallow',
  },
];

const pikeVisibility: Record<string, string[]> = {
  'pike-meet': ['shorePike', 'reeds'],
  'pike-why-it-matters': ['pike', 'reeds', 'smallFish'],
  'pike-lost-nurseries': [],
  'pike-stickleback-invasion': ['sticklebackSwarm', 'reeds', 'pikeEggs'],
  'pike-seal-in-bay': ['pike', 'reeds', 'seal'],
  'pike-chain-reaction': ['sticklebackSwarm', 'filamentousAlgae', 'cormorant'],
  'pike-bringing-back': ['restoredWetland', 'pikeFry', 'pike'],
};

const pikeCallbacks: Record<string, string> = {
  'pike-meet': 'shore-pike-hold',
  'pike-stickleback-invasion': 'stickleback-hold',
};

// ─────────────────────────────────────────────────────────────
//  Appendix - Baltic Fish Species
// ─────────────────────────────────────────────────────────────

const fishSpeciesStages: StageDefinition[] = [
  {
    id: 'fish-species-perch',
    cameraView: {
      position: new THREE.Vector3(2.2, 0.9, 1.5),
      lookAt: new THREE.Vector3(1.5, 0.85, 1.0),
    },
    transitionDuration: 2.0,
    environment: 'shallow',
  },
  {
    id: 'fish-species-pike',
    cameraView: {
      position: new THREE.Vector3(-10.2, 0.9, -7.3),
      lookAt: new THREE.Vector3(-11, 0.8, -8),
    },
    transitionDuration: 2.0,
    environment: 'shallow',
  },
  {
    id: 'fish-species-stickleback',
    cameraView: {
      position: new THREE.Vector3(0.35, 0.46, -0.05),
      lookAt: new THREE.Vector3(0.1, 0.45, -0.3),
    },
    transitionDuration: 2.0,
    environment: 'shallow',
  },
  {
    id: 'fish-species-cod',
    cameraView: {
      position: new THREE.Vector3(4.3, -2.2, -13.6),
      lookAt: new THREE.Vector3(3, -2.8, -15.5),
    },
    transitionDuration: 2.5,
    environment: 'mid-depth',
  },
];

const fishSpeciesVisibility: Record<string, string[]> = {
  'fish-species-perch': ['pike', 'reeds'],
  'fish-species-pike': ['pike', 'reeds'],
  'fish-species-stickleback': ['cod'],
  'fish-species-cod': ['cod'],
};

const fishSpeciesCallbacks: Record<string, string> = {
  'fish-species-perch': 'perch-hold',
  'fish-species-pike': 'pike-hold',
  'fish-species-stickleback': 'stickleback-hold',
  'fish-species-cod': 'cod-hold',
};

// ─────────────────────────────────────────────────────────────
//  Export
// ─────────────────────────────────────────────────────────────

export const chapters: Chapter[] = [
  {
    id: 'intro',
    stages: introStages,
    stageVisibility: introVisibility,
    stageCallbacks: {
      'intro-underwater-forest': 'perch-hold',
      'intro-stickleback-swarm': 'stickleback-hold',
    },
  },
  {
    id: 'pike',
    stages: pikeStages,
    stageVisibility: pikeVisibility,
    stageCallbacks: pikeCallbacks,
  },
  {
    id: 'fish-species',
    type: 'appendix',
    stages: fishSpeciesStages,
    stageVisibility: fishSpeciesVisibility,
    stageCallbacks: fishSpeciesCallbacks,
  },
];

/** Extract camera views for a chapter's navigation. */
export function getChapterCameraViews(chapter: Chapter): CameraView[] {
  return chapter.stages.map((s) => s.cameraView);
}
