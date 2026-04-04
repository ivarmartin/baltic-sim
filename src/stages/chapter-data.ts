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
      position: new THREE.Vector3(3.239, 1.381, 0.372),
      lookAt: new THREE.Vector3(-1.244, 0.284, -1.551),
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
      position: new THREE.Vector3(7.058, -0.450, -13.146),
      lookAt: new THREE.Vector3(2.964, -1.843, -15.656),
    },
    transitionDuration: 2.5,
    environment: 'deep',
  },
  {
    id: 'intro-dead-zone',
    cameraView: {
      position: new THREE.Vector3(3.068, -1.403, -20.197),
      lookAt: new THREE.Vector3(-1.029, -3.462, -22.190),
    },
    transitionDuration: 3.0,
    environment: 'dead-zone',
  },
  {
    id: 'intro-shipwreck',
    cameraView: {
      position: new THREE.Vector3(6.995, 1.055, -4.263),
      lookAt: new THREE.Vector3(3.392, -0.666, -7.273),
    },
    transitionDuration: 2.0,
    environment: 'shipwreck',
  },
  {
    id: 'intro-what-you-can-do',
    cameraView: {
      position: new THREE.Vector3(0.122, 2.479, -6.713),
      lookAt: new THREE.Vector3(0.009, 4.146, -2.001),
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
      position: new THREE.Vector3(-21.873, 2.526, 5.981),
      lookAt: new THREE.Vector3(-17.273, 1.518, 7.661),
    },
    transitionDuration: 2.5,
    environment: 'shallow',
  },
  {
    id: 'pike-why-it-matters',
    cameraView: {
      position: new THREE.Vector3(-11.778, 1.725, -2.277),
      lookAt: new THREE.Vector3(-9.768, 0.379, -6.653),
    },
    transitionDuration: 5,
    environment: 'shallow',
  },
  {
    id: 'pike-lost-nurseries',
    cameraView: {
      position: new THREE.Vector3(21.859, 3.316, 7.849),
      lookAt: new THREE.Vector3(24.377, 3.267, 12.168),
    },
    transitionDuration: 2.5,
    environment: 'shallow',
  },
  {
    id: 'pike-stickleback-invasion',
    cameraView: {
      position: new THREE.Vector3(-9.445, 0.206, -7.678),
      lookAt: new THREE.Vector3(-5.843, 0.853, -4.271),
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
  'pike-lost-nurseries': ['culvert', 'culvertFlow'],
  'pike-stickleback-invasion': ['sticklebackSwarm', 'reeds', 'pikeEggs'],
  'pike-seal-in-bay': ['pike', 'reeds', 'seal'],
  'pike-chain-reaction': ['sticklebackSwarm', 'filamentousAlgae'],
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
      position: new THREE.Vector3(2.535, 0.457, -4.357),
      lookAt: new THREE.Vector3(-2.293, 0.076, -5.597),
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
