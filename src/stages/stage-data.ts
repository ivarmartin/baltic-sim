import * as THREE from 'three';
import type { CameraView } from '../ui/navigation';

export type EnvironmentPreset = 'above-water' | 'shallow' | 'mid-depth' | 'deep' | 'dead-zone' | 'shipwreck';

export interface StageDefinition {
  name: string;
  cameraView: CameraView;
  transitionDuration: number;
  environment: EnvironmentPreset;
  narrative: string;
}

export const stages: StageDefinition[] = [
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
      position: new THREE.Vector3(3, -2, -14),
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

/** Extract camera views for navigation system. */
export function getCameraViews(): CameraView[] {
  return stages.map((s) => s.cameraView);
}
