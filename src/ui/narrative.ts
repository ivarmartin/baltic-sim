export interface NarrativeUI {
  setText: (name: string, text: string, isSpecies?: boolean) => void;
  show: () => void;
  hide: () => void;
  dispose: () => void;
}

export function createNarrative(): NarrativeUI {
  const container = document.createElement('div');
  container.id = 'narrative-ui';
  container.innerHTML = `
    <div class="narrative-wrapper">
      <div class="narrative-text"></div>
      <button class="narrative-toggle" aria-label="Toggle narrative text">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path class="toggle-chevron" d="M3 9L7 5L11 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
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
      flex-direction: column;
      align-items: stretch;
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
      align-self: center;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      margin-top: 6px;
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

    #narrative-ui.collapsed .narrative-toggle {
      margin-top: 0;
    }

    .narrative-title {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.4;
      color: rgba(255, 255, 255, 0.95);
      margin-bottom: 4px;
    }

    .narrative-body {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 13px;
      line-height: 1.55;
      color: rgba(255, 255, 255, 0.85);
    }

    .narrative-text {
      max-height: 250px;
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
      .narrative-title { font-size: 13px; }
      .narrative-body { font-size: 12px; }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(container);

  const textEl = container.querySelector('.narrative-text') as HTMLDivElement;
  const toggleBtn = container.querySelector('.narrative-toggle') as HTMLButtonElement;

  toggleBtn.addEventListener('click', () => {
    container.classList.toggle('collapsed');
  });

  function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return {
    setText(name: string, text: string, isSpecies?: boolean) {
      let titleHtml: string;
      let bodyText = text;

      if (isSpecies) {
        // Extract "Common name (Latin name). " prefix from narrative
        const match = text.match(/^([^(]+)\(([^)]+)\)\.\s*/);
        if (match) {
          const commonName = match[1].trim();
          const latinName = match[2].trim();
          titleHtml = `<strong>${escapeHtml(commonName)}</strong> <em>(${escapeHtml(latinName)})</em>`;
          bodyText = text.slice(match[0].length);
        } else {
          titleHtml = `<strong>${escapeHtml(name)}</strong>`;
        }
      } else {
        titleHtml = `<strong>${escapeHtml(name)}</strong>`;
      }

      textEl.innerHTML =
        `<div class="narrative-title">${titleHtml}</div>` +
        `<div class="narrative-body">${escapeHtml(bodyText)}</div>`;
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
