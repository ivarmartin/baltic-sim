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
import { chapters, getChapterCameraViews } from './stages/chapter-data';
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
import { createStartScreen } from './ui/start-screen';
import { createMenu } from './ui/menu';
import { createSeal } from './creatures/seal';
import { createCormorant } from './creatures/cormorant';
import { createPikeFry } from './creatures/pike-fry';
import { createSmallFish } from './creatures/small-fish';
import { createWetland } from './scene/wetland';
import { createRestoredWetland } from './scene/restored-wetland';
import { createPikeEggs } from './scene/pike-eggs';

async function init() {
  // --- Renderer ---
  const supportsP3 = window.matchMedia('(color-gamut: p3)').matches;
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    ...(supportsP3 && { colorSpace: THREE.DisplayP3ColorSpace }),
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = supportsP3 ? THREE.DisplayP3ColorSpace : THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
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

  // --- Setup scene modules (shared across all chapters) ---
  const environment = setupEnvironment(scene);
  const seabedResult = createSeabed(scene);
  const jettyResult = createJetty(scene);
  const shipwreckResult = createShipwreck(scene);
  const surface = createWaterSurface(scene);

  const particles = createParticles(scene);
  updates.push(particles.update);

  const bladderwrackResult = createBladderwrack(scene, seabedResult.rockPositions);
  updates.push(bladderwrackResult.update);

  const sticklebackResult = await createSticklebacks(scene);
  updates.push(sticklebackResult.update);

  const perchResult = await createPerch(scene);
  updates.push(perchResult.update);

  // --- Shared scene objects ---
  const skyDome = createSkyDome(scene);
  const reedsResult = createReeds(scene, new THREE.Vector3(-9, 0, -6));
  const halocline = createHalocline(scene);
  const deadZone = createDeadZone(scene);
  const mussels = createMussels(scene, shipwreckResult.group.position);
  const shipworm = createShipworm(scene, shipwreckResult.group.position);
  const algaeResult = createFilamentousAlgae(scene, seabedResult.rockPositions);

  // --- Shared creatures ---
  const codResult = createCod(scene);
  updates.push(codResult.update);

  const pikeResult = await createPike(scene, new THREE.Vector3(-11, 0.8, -8));
  updates.push(pikeResult.update);

  const swarmResult = await createSticklebackSwarm(scene, new THREE.Vector3(-10, 1.0, -7));
  updates.push(swarmResult.update);

  // --- Pike chapter assets ---
  const sealResult = createSeal(scene, new THREE.Vector3(-10, 0.5, -7));
  updates.push(sealResult.update);

  const cormorantResult = createCormorant(scene, new THREE.Vector3(-10, 1.0, -7));
  updates.push(cormorantResult.update);

  const pikeFryResult = createPikeFry(scene, new THREE.Vector3(20, 0.2, -6));
  updates.push(pikeFryResult.update);

  const smallFishResult = createSmallFish(scene, new THREE.Vector3(-10, 0.6, -7));
  updates.push(smallFishResult.update);

  const wetlandResult = createWetland(scene, new THREE.Vector3(16, 0, 2));
  const restoredWetlandResult = createRestoredWetland(scene, new THREE.Vector3(20, 0, -6));
  updates.push(restoredWetlandResult.update);

  const pikeEggsResult = createPikeEggs(scene, new THREE.Vector3(-10, 0, -7.5));

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
  injectDepthLighting(sealResult.material);
  injectDepthLighting(cormorantResult.material);
  injectDepthLighting(smallFishResult.material);

  // --- Post-processing (god rays + base color grading only) ---
  let underwater: UnderwaterEffects | null = null;
  try {
    underwater = createUnderwaterEffect(renderer, scene, camera);
  } catch (e) {
    console.warn('Post-processing unavailable, falling back to direct render', e);
  }

  // --- Narrative UI ---
  const narrative = createNarrative();

  // --- All visibility groups (superset for all chapters) ---
  const visibilityGroups = {
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
    // Pike chapter groups
    seal: sealResult.group,
    cormorant: cormorantResult.group,
    pikeFry: pikeFryResult.group,
    smallFish: smallFishResult.group,
    wetland: wetlandResult.group,
    restoredWetland: restoredWetlandResult.group,
    pikeEggs: pikeEggsResult.group,
  };

  // --- Stage Manager ---
  const stageManager = createStageManager({
    scene,
    camera,
    cameraRig,
    renderer,
    environment,
    narrative,
    groups: visibilityGroups,
    setParticleDensity: (f) => particles.setDensity(f),
    setSticklebackHold: (h) => sticklebackResult.setHold(h),
    setPikeHold: (h) => pikeResult.setHold(h),
    setCodHold: (h) => codResult.setHold(h),
    setPerchHold: (h) => perchResult.setHold(h),
    setNavName: (name) => navigation.setCurrentName(name),
  });

  // --- Camera navigation ---
  let navRef: { setTransitionDuration: (s: number) => void } | null = null;

  function showStartScreen() {
    navigation.hide();
    narrative.hide();
    startScreen.show();
  }

  const navigation = createNavigation(
    camera,
    cameraRig,
    (index) => {
      // Get current chapter stages for transition duration
      if (currentChapter) {
        const stage = currentChapter.stages[index];
        navRef?.setTransitionDuration(stage.transitionDuration);
      }
      stageManager.onViewChange(index);
    },
    (_index) => {
      // Transition complete callback
    },
    () => {
      // Home button pressed
      showStartScreen();
    },
  );
  navRef = navigation;

  // --- Chapter selection ---
  let currentChapter: typeof chapters[0] | null = null;

  const startScreen = createStartScreen(chapters, (chapter) => {
    currentChapter = chapter;
    const views = getChapterCameraViews(chapter);
    navigation.loadViews(views);
    stageManager.loadChapter(chapter);
    startScreen.hide();
    navigation.show();
    narrative.show();
  });

  // --- Menu (hamburger + language selector) ---
  createMenu();

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
