import * as THREE from 'three';
import type { CameraView } from '../ui/navigation';

export type EnvironmentPreset = 'above-water' | 'shallow' | 'mid-depth' | 'deep' | 'dead-zone' | 'shipwreck' | 'dead-bay';

export interface StageDefinition {
  name: string;
  cameraView: CameraView;
  transitionDuration: number;
  environment: EnvironmentPreset;
  narrative: string;
}

export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  type?: 'chapter' | 'appendix';
  stages: StageDefinition[];
  /** Maps stage index → array of visibility group keys to show. */
  stageVisibility: Record<number, string[]>;
  /** Optional per-stage callbacks keyed by stage index. */
  stageCallbacks?: Record<number, string>;
}

// ─────────────────────────────────────────────────────────────
//  Chapter 1 — Intro to the Baltic
// ─────────────────────────────────────────────────────────────

const introStages: StageDefinition[] = [
  {
    name: 'Welcome to the Baltic',
    cameraView: {
      name: 'Welcome to the Baltic',
      position: new THREE.Vector3(2.5, 1.4, 1.5),
      lookAt: new THREE.Vector3(0, 1.2, -2.5),
    },
    transitionDuration: 2.5,
    environment: 'shallow',
    narrative:
      'When was the last time you swam in the Baltic Sea? That water felt different, right \u2014 not quite salty, not quite fresh. You were swimming in the youngest sea on Earth, and one of the most threatened. This is Ask\u00f6, south of Stockholm, where scientists have been watching this sea change for over 60 years. Let\u2019s dive in.',
  },
  {
    name: 'The Underwater Forest',
    cameraView: {
      name: 'The Underwater Forest',
      position: new THREE.Vector3(2.0, 2.0, 2.0),
      lookAt: new THREE.Vector3(0.5, 0.8, -1.0),
    },
    transitionDuration: 2.5,
    environment: 'shallow',
    narrative:
      'This is bladderwrack \u2014 the Baltic\u2019s version of a forest. Tiny crabs, snails, and fish hide in its branches, just like animals in a real forest. But look closer: slimy green threads are choking it. Too many nutrients from farms and cities feed these fast-growing algae, and they\u2019re stealing the light the bladderwrack needs to survive. In some places, these forests have already disappeared.',
  },
  {
    name: 'The Stickleback Swarm',
    cameraView: {
      name: 'The Stickleback Swarm',
      position: new THREE.Vector3(-8, 1.5, -4),
      lookAt: new THREE.Vector3(-10, 1.0, -7),
    },
    transitionDuration: 2.0,
    environment: 'shallow',
    narrative:
      'Meet the three-spined stickleback \u2014 barely the length of your finger, but there are billions of them. Their numbers have exploded fifty times over since your parents were kids. Why? Because the big fish that used to eat them \u2014 like cod \u2014 are mostly gone. Now these tiny fish swarm into the bays every spring and devour the eggs of pike and perch, making the problem even worse.',
  },
  {
    name: 'The Shrinking Cod',
    cameraView: {
      name: 'The Shrinking Cod',
      position: new THREE.Vector3(3.6, -1.4, -12.2),
      lookAt: new THREE.Vector3(2, -3, -17),
    },
    transitionDuration: 2.5,
    environment: 'deep',
    narrative:
      'This is the Atlantic cod \u2014 or what\u2019s left of it. Thirty years ago, a Baltic cod could grow as long as your arm and weigh more than your backpack. Today, most never get bigger than a school ruler. Scientists have banned all cod fishing in the Baltic, but the population still isn\u2019t recovering. The water they need to lay their eggs in \u2014 salty enough and with enough oxygen \u2014 has shrunk to just one deep spot near Bornholm.',
  },
  {
    name: 'The Dead Zone',
    cameraView: {
      name: 'The Dead Zone',
      position: new THREE.Vector3(3, -6, -20),
      lookAt: new THREE.Vector3(2, -8, -24),
    },
    transitionDuration: 3.0,
    environment: 'dead-zone',
    narrative:
      'Below us is a dead zone \u2014 an area bigger than Denmark where nothing can live. Fertilizers from farms wash into rivers, then into the sea, feeding huge algae blooms. When the algae die and sink, bacteria consume all the oxygen down here. Right now, one-third of the Baltic seafloor doesn\u2019t have enough oxygen for any animal to survive. And in 2024, scientists measured the worst oxygen levels ever recorded here.',
  },
  {
    name: 'The Shipwreck',
    cameraView: {
      name: 'The Shipwreck',
      position: new THREE.Vector3(6.5, 0.8, -5),
      lookAt: new THREE.Vector3(5, 0.2, -6),
    },
    transitionDuration: 2.0,
    environment: 'shipwreck',
    narrative:
      'The Baltic holds around 100,000 shipwrecks \u2014 Viking longships, warships, medieval traders \u2014 preserved for centuries because the cold, low-salt water kept wood-eating shipworms away. But as the sea warms, shipworms are spreading further north. They\u2019re not actually worms \u2014 they\u2019re clams that tunnel into wood and eat it from the inside. A whole underwater museum is slowly being eaten alive.',
  },
  {
    name: 'What You Can Do',
    cameraView: {
      name: 'What You Can Do',
      position: new THREE.Vector3(1.5, 2.0, 0.5),
      lookAt: new THREE.Vector3(0, 4.5, -2.6),
    },
    transitionDuration: 3.0,
    environment: 'shallow',
    narrative:
      'The Baltic Sea isn\u2019t a lost cause \u2014 when people act, it actually recovers. Scientists are replanting underwater meadows by hand. Sweden moved its trawling border to protect coastal fish. Over 600,000 Swedish kids pick up litter from beaches every year. You can help too: skip single-use plastic, ask where your fish comes from, and if you see trash near water \u2014 pick it up. This sea is yours. It\u2019s the one you swim in.',
  },
];

const introVisibility: Record<number, string[]> = {
  0: [],
  1: ['filamentousAlgae'],
  2: ['sticklebackSwarm', 'pike', 'reeds'],
  3: ['cod'],
  4: ['halocline', 'deadZone'],
  5: ['mussels', 'shipworm'],
  6: [],
};

// ─────────────────────────────────────────────────────────────
//  Chapter 2 — The Pike
// ─────────────────────────────────────────────────────────────

const pikeStages: StageDefinition[] = [
  {
    name: 'Meet the Pike',
    cameraView: {
      name: 'Meet the Pike',
      position: new THREE.Vector3(-10.5, 0.9, -7),
      lookAt: new THREE.Vector3(-11, 0.8, -8),
    },
    transitionDuration: 2.5,
    environment: 'shallow',
    narrative:
      'This is the pike \u2014 the biggest hunter in the shallow bays of the Baltic Sea. It can grow as long as a metre and live for twenty years. See how it hides? That spotted pattern makes it almost invisible in the reeds. It waits perfectly still, then \u2014 snap! It\u2019s one of the fastest hunters in the water.',
  },
  {
    name: 'Why the Pike Matters',
    cameraView: {
      name: 'Why the Pike Matters',
      position: new THREE.Vector3(-7, 1.8, -3),
      lookAt: new THREE.Vector3(-10, 0.8, -7),
    },
    transitionDuration: 2.5,
    environment: 'shallow',
    narrative:
      'When pike are around, the whole bay stays healthy. They keep smaller fish in check, which protects the plants and algae on the seafloor. Think of the pike like a guard \u2014 without it, everything gets out of balance. Scientists call it a \u2018keystone species.\u2019 That means it holds the whole ecosystem together, like the top stone in an arch.',
  },
  {
    name: 'The Lost Nurseries',
    cameraView: {
      name: 'The Lost Nurseries',
      position: new THREE.Vector3(14, 1.5, 4),
      lookAt: new THREE.Vector3(16, 0.4, 2),
    },
    transitionDuration: 2.5,
    environment: 'shallow',
    narrative:
      'Every spring, pike swim up into small streams and flooded wetlands to lay their eggs. The babies need warm, shallow water with lots of plants to hide in. But over the years, many of these wetlands have been drained to make farmland, and streams have been straightened into ditches. The pike come back to where they were born \u2014 but the nursery isn\u2019t there anymore.',
  },
  {
    name: 'The Stickleback Invasion',
    cameraView: {
      name: 'The Stickleback Invasion',
      position: new THREE.Vector3(-8, 1.2, -5),
      lookAt: new THREE.Vector3(-10, 0.6, -7.5),
    },
    transitionDuration: 2.0,
    environment: 'shallow',
    narrative:
      'Remember these? The three-spined stickleback \u2014 barely as long as your little finger. There used to be a normal number of them, but now there are billions. Without enough pike to eat them, their numbers exploded. And here\u2019s the cruel part: sticklebacks love to eat pike eggs. So the fewer pike there are, the more sticklebacks hatch, and the more pike eggs get eaten. It\u2019s a vicious circle.',
  },
  {
    name: 'The Seal in the Bay',
    cameraView: {
      name: 'The Seal in the Bay',
      position: new THREE.Vector3(-7, 1.5, -5),
      lookAt: new THREE.Vector3(-10, 1.0, -8),
    },
    transitionDuration: 2.5,
    environment: 'shallow',
    narrative:
      'Grey seals are amazing animals \u2014 they were nearly wiped out in the 1970s but have made a strong comeback, from around 3,600 to over 55,000 in the Baltic today. That\u2019s great news for seals. But as they\u2019ve moved into the inner bays where pike live, they\u2019ve become one of the pike\u2019s biggest threats. In the Stockholm archipelago, seals and cormorants together now eat many times more pike than fishermen catch. It\u2019s nature \u2014 but it\u2019s tipping the balance.',
  },
  {
    name: 'The Chain Reaction',
    cameraView: {
      name: 'The Chain Reaction',
      position: new THREE.Vector3(-8, 1.0, -4),
      lookAt: new THREE.Vector3(-10, 0.5, -7),
    },
    transitionDuration: 2.5,
    environment: 'dead-bay',
    narrative:
      'This is what a bay looks like when the pike disappear. Without pike, sticklebacks take over. They eat the tiny creatures that keep algae under control. So the algae grows wild, the water turns green, and the plants on the bottom die from lack of light. Scientists call this a \u2018regime shift\u2019 \u2014 the bay flips from healthy to sick, and it\u2019s very hard to flip it back.',
  },
  {
    name: 'Bringing the Pike Back',
    cameraView: {
      name: 'Bringing the Pike Back',
      position: new THREE.Vector3(18, 1.5, -4),
      lookAt: new THREE.Vector3(20, 0.8, -6),
    },
    transitionDuration: 3.0,
    environment: 'shallow',
    narrative:
      'The good news? When people help, it works. Along the Swedish coast, over a hundred wetlands have been restored as \u2018pike nurseries\u2019 \u2014 and where they have, pike fry numbers went from 3,000 to over 300,000 in just a few years. You can help too: if you fish, always release pike carefully. Choose food that doesn\u2019t come from overfished seas. And tell people about the pike \u2014 because a fish this important shouldn\u2019t disappear without anyone noticing.',
  },
];

const pikeVisibility: Record<number, string[]> = {
  0: ['pike', 'reeds', 'smallFish'],
  1: ['pike', 'reeds', 'smallFish'],
  2: ['wetland'],
  3: ['sticklebackSwarm', 'reeds', 'pikeEggs'],
  4: ['pike', 'reeds', 'seal'],
  5: ['sticklebackSwarm', 'filamentousAlgae', 'cormorant'],
  6: ['restoredWetland', 'pikeFry', 'pike'],
};

// Callback identifiers for chapter-specific logic
const pikeCallbacks: Record<number, string> = {
  0: 'pike-hold',
  3: 'stickleback-hold',
};

// ─────────────────────────────────────────────────────────────
//  Appendix — Baltic Fish Species
// ─────────────────────────────────────────────────────────────

const fishSpeciesStages: StageDefinition[] = [
  {
    name: 'Perch',
    cameraView: {
      name: 'Perch',
      position: new THREE.Vector3(2.2, 0.9, 1.5),
      lookAt: new THREE.Vector3(1.5, 0.85, 1.0),
    },
    transitionDuration: 2.0,
    environment: 'shallow',
    narrative:
      'European perch (Perca fluviatilis). Length: 15\u201345 cm. A striped predator of shallow coastal waters. Perch are visual hunters \u2014 they use their large eyes to spot prey in the murky Baltic. They eat smaller fish, crustaceans, and insect larvae. Once one of the most common fish along the Swedish coast, perch populations have declined as their nursery habitats have been degraded.',
  },
  {
    name: 'Pike',
    cameraView: {
      name: 'Pike',
      position: new THREE.Vector3(-10.2, 0.9, -7.3),
      lookAt: new THREE.Vector3(-11, 0.8, -8),
    },
    transitionDuration: 2.0,
    environment: 'shallow',
    narrative:
      'Northern pike (Esox lucius). Length: 40\u2013100 cm. The top predator of the Baltic\u2019s shallow bays. Pike are ambush hunters \u2014 they lie motionless among reeds until prey comes close, then strike in milliseconds. A single pike can eat hundreds of sticklebacks in a season. They are a keystone species: when pike disappear, the whole bay ecosystem can collapse.',
  },
  {
    name: 'Three-spined Stickleback',
    cameraView: {
      name: 'Three-spined Stickleback',
      position: new THREE.Vector3(0.7, 0.5, 0.2),
      lookAt: new THREE.Vector3(0.1, 0.45, -0.3),
    },
    transitionDuration: 2.0,
    environment: 'shallow',
    narrative:
      'Three-spined stickleback (Gasterosteus aculeatus). Length: 4\u20138 cm. Tiny but hugely influential. Males build nests from plant fibres and guard the eggs fiercely. Their populations have exploded fifty-fold since the 1990s due to the decline of predators like cod and pike. In vast swarms, they devour the eggs of larger fish species, accelerating the ecological imbalance in coastal waters.',
  },
  {
    name: 'Atlantic Cod',
    cameraView: {
      name: 'Atlantic Cod',
      position: new THREE.Vector3(4.3, -2.2, -13.6),
      lookAt: new THREE.Vector3(3, -2.8, -15.5),
    },
    transitionDuration: 2.5,
    environment: 'mid-depth',
    narrative:
      'Atlantic cod (Gadus morhua). Length: 20\u201330 cm today (historically up to 100 cm). Once the king of the Baltic, cod could grow as long as a child\u2019s arm. Decades of overfishing and shrinking oxygen zones have left only stunted, thin individuals. The ghostly outline beside this cod shows its former size. All Baltic cod fishing has been banned, but recovery remains uncertain.',
  },
];

const fishSpeciesVisibility: Record<number, string[]> = {
  0: ['pike', 'reeds'],  // Pike patrolling in background so it's already swimming when we cut to it
  1: ['pike', 'reeds'],
  2: ['cod'],             // Cod patrolling in background before its stage
  3: ['cod'],
};

const fishSpeciesCallbacks: Record<number, string> = {
  0: 'perch-hold',
  1: 'pike-hold',
  2: 'stickleback-hold',
  3: 'cod-hold',
};

// ─────────────────────────────────────────────────────────────
//  Export
// ─────────────────────────────────────────────────────────────

export const chapters: Chapter[] = [
  {
    id: 'intro',
    title: 'Intro to the Baltic',
    subtitle: 'Dive into one of the most threatened seas on Earth.',
    stages: introStages,
    stageVisibility: introVisibility,
    stageCallbacks: {
      1: 'perch-hold',
      2: 'stickleback-hold',
    },
  },
  {
    id: 'pike',
    title: 'The Pike',
    subtitle: 'Follow the fate of the Baltic\'s biggest shallow-water hunter.',
    stages: pikeStages,
    stageVisibility: pikeVisibility,
    stageCallbacks: pikeCallbacks,
  },
  {
    id: 'fish-species',
    type: 'appendix',
    title: 'Baltic Fish Species',
    subtitle: 'A close-up guide to the fish of the Baltic Sea.',
    stages: fishSpeciesStages,
    stageVisibility: fishSpeciesVisibility,
    stageCallbacks: fishSpeciesCallbacks,
  },
];

/** Extract camera views for a chapter's navigation. */
export function getChapterCameraViews(chapter: Chapter): CameraView[] {
  return chapter.stages.map((s) => s.cameraView);
}
