export interface NarrativeUI {
  setText: (text: string) => void;
  show: () => void;
  hide: () => void;
  dispose: () => void;
}

export function createNarrative(): NarrativeUI {
  const container = document.createElement('div');
  container.id = 'narrative-ui';
  container.innerHTML = `
    <div class="narrative-wrapper">
      <button class="narrative-toggle" aria-label="Toggle narrative text">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path class="toggle-chevron" d="M3 9L7 5L11 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="narrative-text"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #narrative-ui {
      position: fixed;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      pointer-events: none;
      user-select: none;
      opacity: 0;
      transition: opacity 0.6s ease;
    }

    #narrative-ui.visible {
      opacity: 1;
    }

    .narrative-wrapper {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      max-width: 520px;
      padding: 10px 16px;
      background: rgba(10, 30, 20, 0.55);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      pointer-events: auto;
    }

    .narrative-toggle {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      margin-top: 1px;
      border: none;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 0;
      outline: none;
    }

    .narrative-toggle:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
    }

    .toggle-chevron {
      transition: transform 0.3s ease;
    }

    #narrative-ui.collapsed .toggle-chevron {
      transform: rotate(180deg);
    }

    .narrative-text {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 13px;
      line-height: 1.55;
      color: rgba(255, 255, 255, 0.85);
      max-height: 200px;
      overflow: hidden;
      transition: max-height 0.4s ease, opacity 0.3s ease;
    }

    #narrative-ui.collapsed .narrative-text {
      max-height: 0;
      opacity: 0;
    }

    #narrative-ui.collapsed .narrative-wrapper {
      padding: 6px 12px;
    }

    @media (max-width: 600px) {
      #narrative-ui { bottom: 80px; }
      .narrative-wrapper { max-width: 90vw; padding: 8px 12px; }
      .narrative-text { font-size: 12px; }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(container);

  const textEl = container.querySelector('.narrative-text') as HTMLDivElement;
  const toggleBtn = container.querySelector('.narrative-toggle') as HTMLButtonElement;

  toggleBtn.addEventListener('click', () => {
    container.classList.toggle('collapsed');
  });

  return {
    setText(text: string) {
      textEl.textContent = text;
      container.classList.remove('collapsed');
    },
    show() {
      container.classList.add('visible');
    },
    hide() {
      container.classList.remove('visible');
    },
    dispose() {
      container.remove();
      style.remove();
    },
  };
}
