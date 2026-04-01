import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { setupEnvironment } from './scene/environment';
import { createSeabed } from './scene/seabed';
import { createJetty } from './scene/jetty';
import { createWaterSurface } from './scene/surface';
import { createParticles } from './effects/particles';
import { createBladderwrack } from './vegetation/bladderwrack';
import { createSticklebacks } from './creatures/stickleback';
import { createPerch } from './creatures/perch';
import { setupCaustics } from './effects/caustics';
import { createUnderwaterEffect, UnderwaterEffects } from './effects/underwater';
import { createControls } from './ui/controls';

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

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.minPolarAngle = 0.3;
controls.maxPolarAngle = Math.PI * 0.7;
controls.minDistance = 0.5;
controls.maxDistance = 10;
controls.target.set(0, 1.0, 0);

// --- Update system ---
type UpdateFn = (elapsed: number, dt: number) => void;
const updates: UpdateFn[] = [];

// --- Setup scene modules ---
const { sunLight } = setupEnvironment(scene);
const seabedResult = createSeabed(scene);
createJetty(scene);

const surface = createWaterSurface(scene);

const particleUpdate = createParticles(scene);
updates.push(particleUpdate);

const bladderwrackUpdate = createBladderwrack(scene, seabedResult.rockPositions);
updates.push(bladderwrackUpdate);

const fishUpdate = createSticklebacks(scene);
updates.push(fishUpdate);

const perchUpdate = createPerch(scene);
updates.push(perchUpdate);

setupCaustics(seabedResult.seabedMaterial);

// --- Post-processing ---
let underwater: UnderwaterEffects | null = null;
try {
  underwater = createUnderwaterEffect(renderer, scene, camera);
} catch (e) {
  console.warn('Post-processing unavailable, falling back to direct render', e);
}

// --- UI Controls ---
const lightPos = sunLight.position.clone();

createControls({
  onDepthDarkening(on) { underwater?.setDepthDarken(on); },
  onWaterSurface(on) { surface.setVisible(on); },
  onGodRays(on) { underwater?.setGodRays(on); },
  onFogGradient(on) { underwater?.setFogGradient(on); },
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

  // Update post-processing
  if (underwater) {
    underwater.update(elapsed, camera, lightPos);
  }

  controls.update();

  if (underwater) {
    underwater.composer.render();
  } else {
    renderer.render(scene, camera);
  }
});
