import * as THREE from 'three';

/**
 * Dev-mode HUD that displays live camera position, rotation, and lookAt,
 * with a copy button for easy pasting.
 */
export function createDevHud(
  camera: THREE.PerspectiveCamera,
  cameraRig: THREE.Group,
) {
  const style = document.createElement('style');
  style.textContent = `
    .dev-hud {
      position: fixed;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 300;
      font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 12px;
      color: #c8ffc8;
      background: rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(80, 180, 120, 0.4);
      border-radius: 8px;
      padding: 10px 14px;
      pointer-events: auto;
      user-select: text;
      backdrop-filter: blur(6px);
      display: none;
      white-space: pre;
      line-height: 1.5;
    }
    .dev-hud.visible { display: flex; gap: 12px; align-items: flex-start; }
    .dev-hud-text { flex: 1; }
    .dev-hud-copy {
      flex-shrink: 0;
      background: rgba(80, 180, 120, 0.25);
      border: 1px solid rgba(80, 180, 120, 0.5);
      color: #c8ffc8;
      border-radius: 5px;
      padding: 4px 10px;
      cursor: pointer;
      font-family: inherit;
      font-size: 11px;
      transition: background 0.15s;
    }
    .dev-hud-copy:hover { background: rgba(80, 180, 120, 0.45); }
    .dev-hud-copy:active { background: rgba(80, 180, 120, 0.6); }
  `;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.className = 'dev-hud';

  const textEl = document.createElement('div');
  textEl.className = 'dev-hud-text';

  const copyBtn = document.createElement('button');
  copyBtn.className = 'dev-hud-copy';
  copyBtn.textContent = 'Copy';

  container.appendChild(textEl);
  container.appendChild(copyBtn);
  document.body.appendChild(container);

  const dir = new THREE.Vector3();
  const lookAt = new THREE.Vector3();

  function fmt(n: number): string {
    return n.toFixed(3);
  }

  function buildText(): string {
    const p = cameraRig.position;
    camera.getWorldDirection(dir);
    lookAt.copy(p).add(dir.multiplyScalar(5));

    return [
      `pos:    ${fmt(p.x)}, ${fmt(p.y)}, ${fmt(p.z)}`,
      `lookAt: ${fmt(lookAt.x)}, ${fmt(lookAt.y)}, ${fmt(lookAt.z)}`,
    ].join('\n');
  }

  function buildCopyText(): string {
    const p = cameraRig.position;
    camera.getWorldDirection(dir);
    lookAt.copy(p).add(dir.multiplyScalar(5));

    return `position: new THREE.Vector3(${fmt(p.x)}, ${fmt(p.y)}, ${fmt(p.z)}),\nlookAt: new THREE.Vector3(${fmt(lookAt.x)}, ${fmt(lookAt.y)}, ${fmt(lookAt.z)}),`;
  }

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(buildCopyText()).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1200);
    });
  });

  function update() {
    textEl.textContent = buildText();
  }

  function show() {
    container.classList.add('visible');
  }

  function hide() {
    container.classList.remove('visible');
  }

  function dispose() {
    container.remove();
    style.remove();
  }

  return { update, show, hide, dispose };
}
