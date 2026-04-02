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
import { createAmbientSeal } from './creatures/ambient-seal';
import { createCormorant } from './creatures/cormorant';
import { createPikeFry } from './creatures/pike-fry';
import { createSmallFish } from './creatures/small-fish';
import { createWetland } from './scene/wetland';
import { createRestoredWetland } from './scene/restored-wetland';
import { createPikeEggs } from './scene/pike-eggs';

async function init() {
  // --- Renderer ---
  const supportsP3 = window.matchMedia('(color-gamut: p3)').matches;
  const DisplayP3 = 'display-p3' as THREE.ColorSpace;
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    ...(supportsP3 && { colorSpace: DisplayP3 }),
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = supportsP3 ? DisplayP3 : THREE.SRGBColorSpace;
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

  const ambientSealResult = await createAmbientSeal(scene);
  updates.push(ambientSealResult.update);

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
  const sealResult = await createSeal(scene, new THREE.Vector3(-10, 0.5, -7));
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
  injectDepthLighting(ambientSealResult.material);
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
    setAmbientSealHold: (h) => ambientSealResult.setHold(h),
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

  // --- Developer fly-cam controls ---
  const moveKeys = { w: false, a: false, s: false, d: false, q: false, e: false };
  const moveSpeed = 5;
  const lookSensitivity = 0.003;
  let flyYaw = 0;
  let flyPitch = 0;
  let isDragging = false;

  function onDevKeyDown(ev: KeyboardEvent) {
    const k = ev.key.toLowerCase();
    if (k in moveKeys) (moveKeys as Record<string, boolean>)[k] = true;
  }
  function onDevKeyUp(ev: KeyboardEvent) {
    const k = ev.key.toLowerCase();
    if (k in moveKeys) (moveKeys as Record<string, boolean>)[k] = false;
  }
  function onMouseDown(ev: MouseEvent) {
    if (ev.button === 0) isDragging = true;
  }
  function onMouseUp() {
    isDragging = false;
  }
  function onMouseMove(ev: MouseEvent) {
    if (!isDragging) return;
    flyYaw -= ev.movementX * lookSensitivity;
    flyPitch -= ev.movementY * lookSensitivity;
    flyPitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, flyPitch));
  }
  function onTouchStart(ev: TouchEvent) {
    if (ev.touches.length === 1) isDragging = true;
  }
  function onTouchEnd() {
    isDragging = false;
  }
  let lastTouchX = 0, lastTouchY = 0;
  function onTouchMoveHandler(ev: TouchEvent) {
    if (!isDragging || ev.touches.length !== 1) return;
    const touch = ev.touches[0];
    if (lastTouchX !== 0 || lastTouchY !== 0) {
      const dx = touch.clientX - lastTouchX;
      const dy = touch.clientY - lastTouchY;
      flyYaw -= dx * lookSensitivity;
      flyPitch -= dy * lookSensitivity;
      flyPitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, flyPitch));
    }
    lastTouchX = touch.clientX;
    lastTouchY = touch.clientY;
  }
  function onTouchEndReset() {
    lastTouchX = 0;
    lastTouchY = 0;
  }

  function enableDevMode() {
    // Derive yaw/pitch from current camera world direction
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    flyYaw = Math.atan2(-dir.x, -dir.z);
    flyPitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
    window.addEventListener('keydown', onDevKeyDown);
    window.addEventListener('keyup', onDevKeyUp);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchmove', onTouchMoveHandler);
    window.addEventListener('touchend', onTouchEndReset);
  }

  function disableDevMode() {
    for (const k of Object.keys(moveKeys)) (moveKeys as Record<string, boolean>)[k] = false;
    isDragging = false;
    lastTouchX = 0;
    lastTouchY = 0;
    window.removeEventListener('keydown', onDevKeyDown);
    window.removeEventListener('keyup', onDevKeyUp);
    renderer.domElement.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('mousemove', onMouseMove);
    renderer.domElement.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchmove', onTouchMoveHandler);
    window.removeEventListener('touchend', onTouchEndReset);
  }

  navigation.onDevModeChange((active) => {
    if (active) enableDevMode();
    else disableDevMode();
  });

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
    if (navigation.isDevMode()) {
      // Apply yaw/pitch look direction
      const euler = new THREE.Euler(flyPitch, flyYaw, 0, 'YXZ');
      camera.quaternion.setFromEuler(euler);

      // WASD movement relative to look direction
      const forward = new THREE.Vector3(0, 0, -1).applyEuler(euler);
      const right = new THREE.Vector3(1, 0, 0).applyEuler(euler);
      const move = new THREE.Vector3();
      if (moveKeys.w) move.add(forward);
      if (moveKeys.s) move.sub(forward);
      if (moveKeys.d) move.add(right);
      if (moveKeys.a) move.sub(right);
      if (moveKeys.e) move.y += 1;
      if (moveKeys.q) move.y -= 1;
      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(moveSpeed * dt);
        cameraRig.position.add(move);
      }
    } else {
      navigation.update(dt);
    }

    if (underwater) {
      underwater.composer.render();
    } else {
      renderer.render(scene, camera);
    }
  });
}

init();
