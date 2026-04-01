import * as THREE from 'three';

export interface CameraView {
  name: string;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

export const cameraViews: CameraView[] = [
  {
    name: 'Jetty',
    position: new THREE.Vector3(2.5, 1.4, 1.5),
    lookAt: new THREE.Vector3(0, 1.2, -2.5),
  },
  {
    name: 'Perch',
    position: new THREE.Vector3(2.0, 0.9, 1.0),
    lookAt: new THREE.Vector3(1.5, 0.85, 1.0),
  },
  {
    name: 'Stickleback',
    position: new THREE.Vector3(0.3, 0.5, -0.2),
    lookAt: new THREE.Vector3(0.1, 0.45, -0.3),
  },
];

interface NavigationState {
  currentIndex: number;
  isTransitioning: boolean;
}

const TRANSITION_DURATION = 1.8; // seconds

export function createNavigation(
  camera: THREE.PerspectiveCamera,
  cameraRig: THREE.Group,
  onViewChange?: (index: number, view: CameraView) => void,
): {
  update: (dt: number) => void;
  dispose: () => void;
} {
  const state: NavigationState = {
    currentIndex: 0,
    isTransitioning: false,
  };

  // Transition state
  let transitionTime = 0;
  const startPos = new THREE.Vector3();
  const endPos = new THREE.Vector3();
  const startLookAt = new THREE.Vector3();
  const endLookAt = new THREE.Vector3();
  const currentLookAt = new THREE.Vector3();

  // --- Build UI ---
  const container = document.createElement('div');
  container.id = 'nav-ui';
  container.innerHTML = `
    <div class="nav-wrapper">
      <button class="nav-btn nav-prev" aria-label="Previous view">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 4L6 10L12 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="nav-label">
        <span class="nav-counter">1 / 3</span>
        <span class="nav-name">Jetty</span>
      </div>
      <button class="nav-btn nav-next" aria-label="Next view">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M8 4L14 10L8 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #nav-ui {
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      pointer-events: none;
      user-select: none;
    }

    .nav-wrapper {
      display: flex;
      align-items: center;
      gap: 16px;
      pointer-events: auto;
    }

    .nav-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 50%;
      background: rgba(10, 30, 20, 0.55);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: rgba(255, 255, 255, 0.85);
      cursor: pointer;
      transition: all 0.25s ease;
      padding: 0;
      outline: none;
    }

    .nav-btn:hover {
      background: rgba(20, 60, 40, 0.7);
      border-color: rgba(255, 255, 255, 0.3);
      color: #fff;
      transform: scale(1.08);
    }

    .nav-btn:active {
      transform: scale(0.95);
    }

    .nav-btn:disabled {
      opacity: 0.3;
      cursor: default;
      pointer-events: none;
    }

    .nav-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;
      padding: 8px 20px;
      background: rgba(10, 30, 20, 0.55);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 22px;
    }

    .nav-counter {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.06em;
      color: rgba(255, 255, 255, 0.45);
      text-transform: uppercase;
    }

    .nav-name {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 15px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 1px;
    }

    @media (max-width: 480px) {
      #nav-ui { bottom: 20px; }
      .nav-btn { width: 40px; height: 40px; }
      .nav-wrapper { gap: 10px; }
      .nav-label { padding: 6px 14px; min-width: 70px; }
      .nav-name { font-size: 13px; }
      .nav-counter { font-size: 10px; }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(container);

  const prevBtn = container.querySelector('.nav-prev') as HTMLButtonElement;
  const nextBtn = container.querySelector('.nav-next') as HTMLButtonElement;
  const counterEl = container.querySelector('.nav-counter') as HTMLSpanElement;
  const nameEl = container.querySelector('.nav-name') as HTMLSpanElement;

  // --- Easing ---
  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // --- Apply a view instantly ---
  function applyView(index: number) {
    const view = cameraViews[index];
    cameraRig.position.copy(view.position);
    camera.lookAt(view.lookAt);
    currentLookAt.copy(view.lookAt);
    updateUI();
    onViewChange?.(index, view);
  }

  // --- Start transition ---
  function transitionTo(index: number) {
    if (state.isTransitioning || index === state.currentIndex) return;
    if (index < 0 || index >= cameraViews.length) return;

    startPos.copy(cameraRig.position);
    startLookAt.copy(currentLookAt);
    endPos.copy(cameraViews[index].position);
    endLookAt.copy(cameraViews[index].lookAt);

    state.currentIndex = index;
    state.isTransitioning = true;
    transitionTime = 0;

    updateUI();
    onViewChange?.(index, cameraViews[index]);
  }

  function updateUI() {
    const idx = state.currentIndex;
    counterEl.textContent = `${idx + 1} / ${cameraViews.length}`;
    nameEl.textContent = cameraViews[idx].name;
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === cameraViews.length - 1;
  }

  // --- Event listeners ---
  prevBtn.addEventListener('click', () => transitionTo(state.currentIndex - 1));
  nextBtn.addEventListener('click', () => transitionTo(state.currentIndex + 1));

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      transitionTo(state.currentIndex - 1);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      transitionTo(state.currentIndex + 1);
    }
  }
  window.addEventListener('keydown', onKeyDown);

  // --- Set initial view ---
  applyView(0);

  // --- Update (called each frame) ---
  function update(dt: number) {
    if (!state.isTransitioning) return;

    transitionTime += dt;
    const t = Math.min(transitionTime / TRANSITION_DURATION, 1.0);
    const eased = easeInOutCubic(t);

    // Interpolate position
    cameraRig.position.lerpVectors(startPos, endPos, eased);

    // Interpolate lookAt target
    currentLookAt.lerpVectors(startLookAt, endLookAt, eased);
    camera.lookAt(currentLookAt);

    if (t >= 1.0) {
      state.isTransitioning = false;
    }
  }

  function dispose() {
    window.removeEventListener('keydown', onKeyDown);
    container.remove();
    style.remove();
  }

  return { update, dispose };
}
