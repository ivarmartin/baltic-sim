import * as THREE from 'three';
import { setupEnvironment } from './scene/environment';
import { createSeabed } from './scene/seabed';
import { createJetty } from './scene/jetty';
import { createShipwreck } from './scene/shipwreck';
import { createWaterSurface } from './scene/surface';
import { createParticles } from './effects/particles';
import { createBladderwrack } from './vegetation/bladderwrack';
import { createSticklebacks } from './creatures/stickleback';
import { createPerch } from './creatures/perch';
import { setupCaustics } from './effects/caustics';
import { createUnderwaterEffect, UnderwaterEffects } from './effects/underwater';
import { injectDepthLighting, setDepthDarkenEnabled, setFogGradientEnabled, updateDepthTime } from './effects/depth-lighting';
import { createControls } from './ui/controls';
import { createNavigation } from './ui/navigation';
import { createNarrative } from './ui/narrative';
import { createStageManager } from './stages/stage-manager';
import { stages } from './stages/stage-data';
import { createSkyDome } from './scene/sky-environment';
import { createReeds } from './scene/reeds';
import { createHalocline } from './scene/halocline';
import { createDeadZone } from './scene/dead-zone';
import { createMussels } from './scene/mussels';
import { createShipworm } from './scene/shipworm';
import { createCod } from './creatures/cod';
import { createPike } from './creatures/pike';
import { createSticklebackSwarm } from './creatures/stickleback-swarm';
import { createFilamentousAlgae } from './vegetation/filamentous-algae';

async function init() {
  // --- Renderer ---
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.7;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // --- Scene & Camera ---
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);

  // Camera rig for future WebXR support
  const cameraRig = new THREE.Group();
  cameraRig.position.set(0, 1.5, 5);
  cameraRig.add(camera);
  scene.add(cameraRig);

  // --- Update system ---
  type UpdateFn = (elapsed: number, dt: number) => void;
  const updates: UpdateFn[] = [];

  // --- Setup scene modules ---
  const environment = setupEnvironment(scene);
  const seabedResult = createSeabed(scene);
  const jettyResult = createJetty(scene);
  const shipwreckResult = createShipwreck(scene);
  const surface = createWaterSurface(scene);

  const particles = createParticles(scene);
  updates.push(particles.update);

  const bladderwrackResult = createBladderwrack(scene, seabedResult.rockPositions);
  updates.push(bladderwrackResult.update);

  const sticklebackResult = createSticklebacks(scene);
  updates.push(sticklebackResult.update);

  const perchResult = await createPerch(scene);
  updates.push(perchResult.update);

  // --- New scene objects for stages ---
  const skyDome = createSkyDome(scene);
  const reedsResult = createReeds(scene, new THREE.Vector3(-9, 0, -6));
  const halocline = createHalocline(scene);
  const deadZone = createDeadZone(scene);
  const mussels = createMussels(scene, shipwreckResult.group.position);
  const shipworm = createShipworm(scene, shipwreckResult.group.position);
  const algaeResult = createFilamentousAlgae(scene, seabedResult.rockPositions);

  // --- New creatures ---
  const codResult = createCod(scene);
  updates.push(codResult.update);

  const pikeResult = createPike(scene, new THREE.Vector3(-11, 0.8, -8));
  updates.push(pikeResult.update);

  const swarmResult = createSticklebackSwarm(scene, new THREE.Vector3(-10, 1.0, -7));
  updates.push(swarmResult.update);

  // --- Caustics (must be set up before depth injection on seabed) ---
  setupCaustics(seabedResult.seabedMaterial);

  // --- Inject depth-based lighting into all materials ---
  injectDepthLighting(seabedResult.seabedMaterial);
  injectDepthLighting(seabedResult.rockMaterial);
  injectDepthLighting(jettyResult.woodMaterial);
  injectDepthLighting(shipwreckResult.material);
  injectDepthLighting(sticklebackResult.material);
  injectDepthLighting(perchResult.material);
  injectDepthLighting(bladderwrackResult.material);
  injectDepthLighting(codResult.material);
  injectDepthLighting(pikeResult.material);

  // --- Post-processing (god rays + base color grading only) ---
  let underwater: UnderwaterEffects | null = null;
  try {
    underwater = createUnderwaterEffect(renderer, scene, camera);
  } catch (e) {
    console.warn('Post-processing unavailable, falling back to direct render', e);
  }

  // --- Narrative UI ---
  const narrative = createNarrative();

  // --- Stage Manager ---
  const stageManager = createStageManager({
    scene,
    camera,
    cameraRig,
    renderer,
    environment,
    narrative,
    groups: {
      sky: skyDome,
      filamentousAlgae: algaeResult.group,
      sticklebackSwarm: swarmResult.mesh,
      pike: pikeResult.group,
      reeds: reedsResult.group,
      cod: codResult.group,
      halocline: halocline.mesh,
      deadZone,
      mussels,
      shipworm,
    },
    setParticleDensity: (f) => particles.setDensity(f),
    setSticklebackHold: (h) => sticklebackResult.setHold(h),
    setPerchHold: (h) => perchResult.setHold(h),
  });

  // --- Camera navigation ---
  // Use a wrapper so we can reference `navigation` after it's assigned
  let navRef: { setTransitionDuration: (s: number) => void } | null = null;
  const navigation = createNavigation(
    camera,
    cameraRig,
    (index) => {
      // Set transition duration from stage data
      const stage = stages[index];
      navRef?.setTransitionDuration(stage.transitionDuration);
      stageManager.onViewChange(index);
    },
    (_index) => {
      // Transition complete callback (if needed)
    },
  );
  navRef = navigation;

  // --- UI Controls ---
  const lightPos = environment.sunLight.position.clone();

  createControls({
    onDepthDarkening(on) { setDepthDarkenEnabled(on); },
    onWaterSurface(on) { surface.setVisible(on); },
    onGodRays(on) { underwater?.setGodRays(on); },
    onFogGradient(on) { setFogGradientEnabled(on); },
  });

  // --- Resize ---
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (underwater) underwater.composer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  // --- Render loop (setAnimationLoop for WebXR compat) ---
  const clock = new THREE.Clock();

  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    for (const fn of updates) {
      fn(elapsed, dt);
    }

    // Update surface animation
    surface.update(elapsed);

    // Update caustics time uniform
    const causticUpdate = seabedResult.seabedMaterial.userData.updateCaustics;
    if (causticUpdate) causticUpdate(elapsed);

    // Update depth lighting time uniform
    updateDepthTime(elapsed);

    // Update halocline shimmer
    halocline.update(elapsed);

    // Update filamentous algae sway
    algaeResult.update(elapsed);

    // Update reeds sway
    reedsResult.update(elapsed);

    // Update stage manager (environment crossfades, water crossing detection)
    stageManager.update(elapsed, dt);

    // Update post-processing
    if (underwater) {
      underwater.update(elapsed, camera, lightPos);
    }

    // Update camera transition
    navigation.update(dt);

    if (underwater) {
      underwater.composer.render();
    } else {
      renderer.render(scene, camera);
    }
  });
}

init();
