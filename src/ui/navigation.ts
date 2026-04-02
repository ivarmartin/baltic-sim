import * as THREE from 'three';

export interface CameraView {
  name: string;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

interface NavigationState {
  currentIndex: number;
  isTransitioning: boolean;
}

let transitionDuration = 1.8;

export function createNavigation(
  camera: THREE.PerspectiveCamera,
  cameraRig: THREE.Group,
  onViewChange?: (index: number, view: CameraView) => void,
  onTransitionComplete?: (index: number) => void,
  onHome?: () => void,
): {
  update: (dt: number) => void;
  setTransitionDuration: (seconds: number) => void;
  loadViews: (views: CameraView[]) => void;
  setCurrentName: (name: string) => void;
  show: () => void;
  hide: () => void;
  dispose: () => void;
  isDevMode: () => boolean;
  onDevModeChange: (cb: (active: boolean) => void) => void;
} {
  let cameraViews: CameraView[] = [];

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
        <span class="nav-counter">1 / 1</span>
        <span class="nav-name"></span>
      </div>
      <button class="nav-btn nav-next" aria-label="Next view">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M8 4L14 10L8 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  `;

  // Home button lives in its own fixed container (outside #nav-ui's transform)
  const homeContainer = document.createElement('div');
  homeContainer.id = 'nav-home-container';
  homeContainer.innerHTML = `
    <button class="nav-btn nav-home" aria-label="Back to chapters">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 9L9 3L15 9M5 7.5V14.5H8V11H10V14.5H13V7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <button class="nav-btn nav-dev" aria-label="Toggle developer camera">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="7" r="3.5" stroke="currentColor" stroke-width="1.5"/>
        <path d="M3 14.5C3 14.5 4.5 7 9 7C13.5 7 15 14.5 15 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M1 7H5M13 7H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
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
      transition: opacity 0.4s ease;
    }

    #nav-ui.hidden {
      opacity: 0;
      pointer-events: none !important;
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

    #nav-home-container {
      position: fixed;
      top: 24px;
      left: 24px;
      z-index: 100;
      pointer-events: auto;
      transition: opacity 0.4s ease;
    }

    #nav-home-container.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .nav-home {
      width: 38px;
      height: 38px;
    }

    #nav-home-container {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .nav-dev {
      width: 38px;
      height: 38px;
    }

    .nav-dev.active {
      background: rgba(80, 180, 120, 0.5);
      border-color: rgba(80, 180, 120, 0.7);
      color: #fff;
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
      font-size: 14px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 1px;
      white-space: nowrap;
    }

    @media (max-width: 480px) {
      #nav-ui { bottom: 20px; }
      .nav-btn { width: 40px; height: 40px; }
      #nav-home-container { top: 16px; left: 16px; }
      .nav-home { width: 34px; height: 34px; }
      .nav-dev { width: 34px; height: 34px; }
      .nav-wrapper { gap: 10px; }
      .nav-label { padding: 6px 14px; min-width: 70px; }
      .nav-name { font-size: 12px; }
      .nav-counter { font-size: 10px; }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(container);
  document.body.appendChild(homeContainer);

  const homeBtn = homeContainer.querySelector('.nav-home') as HTMLButtonElement;
  const devBtn = homeContainer.querySelector('.nav-dev') as HTMLButtonElement;
  const prevBtn = container.querySelector('.nav-prev') as HTMLButtonElement;
  const nextBtn = container.querySelector('.nav-next') as HTMLButtonElement;
  const counterEl = container.querySelector('.nav-counter') as HTMLSpanElement;
  const nameEl = container.querySelector('.nav-name') as HTMLSpanElement;

  // Developer mode state
  let devMode = false;
  let devModeCallback: ((active: boolean) => void) | null = null;

  function setDevMode(active: boolean) {
    devMode = active;
    devBtn.classList.toggle('active', active);
    devModeCallback?.(active);
  }

  // --- Easing ---
  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // --- Apply a view instantly ---
  function applyView(index: number) {
    if (cameraViews.length === 0) return;
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
    if (cameraViews.length === 0) return;
    const idx = state.currentIndex;
    counterEl.textContent = `${idx + 1} / ${cameraViews.length}`;
    nameEl.textContent = cameraViews[idx].name;
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === cameraViews.length - 1;
  }

  // --- Event listeners ---
  homeBtn.addEventListener('click', () => {
    if (devMode) setDevMode(false);
    state.isTransitioning = false;
    onHome?.();
  });
  devBtn.addEventListener('click', () => {
    setDevMode(!devMode);
  });
  prevBtn.addEventListener('click', () => {
    if (devMode) setDevMode(false);
    transitionTo(state.currentIndex - 1);
  });
  nextBtn.addEventListener('click', () => {
    if (devMode) setDevMode(false);
    transitionTo(state.currentIndex + 1);
  });

  function onKeyDown(e: KeyboardEvent) {
    if (container.classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (devMode) setDevMode(false);
      transitionTo(state.currentIndex - 1);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (devMode) setDevMode(false);
      transitionTo(state.currentIndex + 1);
    }
  }
  window.addEventListener('keydown', onKeyDown);

  // Start hidden until a chapter is loaded
  container.classList.add('hidden');
  homeContainer.classList.add('hidden');

  // --- Update (called each frame) ---
  function update(dt: number) {
    if (!state.isTransitioning) return;

    transitionTime += dt;
    const t = Math.min(transitionTime / transitionDuration, 1.0);
    const eased = easeInOutCubic(t);

    cameraRig.position.lerpVectors(startPos, endPos, eased);
    currentLookAt.lerpVectors(startLookAt, endLookAt, eased);
    camera.lookAt(currentLookAt);

    if (t >= 1.0) {
      state.isTransitioning = false;
      onTransitionComplete?.(state.currentIndex);
    }
  }

  function setTransitionDurationFn(seconds: number) {
    transitionDuration = seconds;
  }

  function loadViews(views: CameraView[]) {
    cameraViews = views;
    state.currentIndex = 0;
    state.isTransitioning = false;
    if (views.length > 0) {
      applyView(0);
    }
  }

  function show() {
    container.classList.remove('hidden');
    homeContainer.classList.remove('hidden');
  }

  function hide() {
    container.classList.add('hidden');
    homeContainer.classList.add('hidden');
  }

  function dispose() {
    window.removeEventListener('keydown', onKeyDown);
    container.remove();
    homeContainer.remove();
    style.remove();
  }

  function setCurrentName(name: string) {
    nameEl.textContent = name;
  }

  return {
    update,
    setTransitionDuration: setTransitionDurationFn,
    loadViews,
    setCurrentName,
    show,
    hide,
    dispose,
    isDevMode: () => devMode,
    onDevModeChange: (cb: (active: boolean) => void) => { devModeCallback = cb; },
  };
}
