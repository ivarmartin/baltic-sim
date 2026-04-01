import * as THREE from 'three';
import { setupEnvironment } from './scene/environment';
import { createSeabed } from './scene/seabed';
import { createJetty } from './scene/jetty';
import { createWaterSurface } from './scene/surface';
import { createParticles } from './effects/particles';
import { createBladderwrack } from './vegetation/bladderwrack';
import { createSticklebacks } from './creatures/stickleback';
import { createPerch } from './creatures/perch';
import { createShipwreck } from './scene/shipwreck';
import { setupCaustics } from './effects/caustics';
import { createUnderwaterEffect, UnderwaterEffects } from './effects/underwater';
import { injectDepthLighting, setDepthDarkenEnabled, setFogGradientEnabled, updateDepthTime } from './effects/depth-lighting';
import { createControls } from './ui/controls';
import { createNavigation } from './ui/navigation';

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
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 50);

// Camera rig for future WebXR support
const cameraRig = new THREE.Group();
cameraRig.position.set(0, 1.5, 5);
cameraRig.add(camera);
scene.add(cameraRig);

// --- Camera navigation (replaces OrbitControls) ---
const handlers = { onViewChange: null as ((index: number) => void) | null };
const navigation = createNavigation(camera, cameraRig, (index) => {
  handlers.onViewChange?.(index);
});

// --- Update system ---
type UpdateFn = (elapsed: number, dt: number) => void;
const updates: UpdateFn[] = [];

// --- Setup scene modules ---
const { sunLight } = setupEnvironment(scene);
const seabedResult = createSeabed(scene);
const jettyResult = createJetty(scene);
const surface = createWaterSurface(scene);

const particleUpdate = createParticles(scene);
updates.push(particleUpdate);

const bladderwrackResult = createBladderwrack(scene, seabedResult.rockPositions);
updates.push(bladderwrackResult.update);

const sticklebackResult = createSticklebacks(scene);
updates.push(sticklebackResult.update);

const perchResult = createPerch(scene);
updates.push(perchResult.update);

const shipwreckResult = createShipwreck(scene);

// Wire camera views to fish hold system (view 1 = Perch, view 2 = Stickleback)
handlers.onViewChange = (index) => {
  perchResult.setHold(index === 1);
  sticklebackResult.setHold(index === 2);
};

// --- Caustics (must be set up before depth injection on seabed) ---
setupCaustics(seabedResult.seabedMaterial);

// --- Inject depth-based lighting into all materials ---
// This wraps any existing onBeforeCompile (caustics, sway) so must come after
injectDepthLighting(seabedResult.seabedMaterial);
injectDepthLighting(seabedResult.rockMaterial);
injectDepthLighting(jettyResult.woodMaterial);
injectDepthLighting(sticklebackResult.material);
injectDepthLighting(perchResult.material);
injectDepthLighting(bladderwrackResult.material);
injectDepthLighting(shipwreckResult.material);

// --- Post-processing (god rays + base color grading only) ---
let underwater: UnderwaterEffects | null = null;
try {
  underwater = createUnderwaterEffect(renderer, scene, camera);
} catch (e) {
  console.warn('Post-processing unavailable, falling back to direct render', e);
}

// --- UI Controls ---
const lightPos = sunLight.position.clone();

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
