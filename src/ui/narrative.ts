export interface RefInfo {
  count: number;
  chapterKey: string;
  stageKey: string;
}

export interface NarrativeUI {
  setText: (name: string, text: string, isSpecies?: boolean, refInfo?: RefInfo) => void;
  onRefClick: ((chapterKey: string, stageKey: string) => void) | null;
  show: () => void;
  hide: () => void;
  dispose: () => void;
}

export function createNarrative(): NarrativeUI {
  const container = document.createElement('div');
  container.id = 'narrative-ui';
  container.innerHTML = `
    <div class="narrative-card">
      <div class="narrative-wrapper">
        <div class="narrative-title"></div>
        <div class="narrative-body"></div>
        <button class="narrative-ref-btn hidden" aria-label="View references">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M2 2h5l1 1v10l-1-1H2V2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
            <path d="M14 2H9L8 3v10l1-1h5V2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
          </svg>
          <span class="narrative-ref-count"></span>
        </button>
      </div>
      <button class="narrative-toggle" aria-label="Toggle narrative text">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path class="toggle-chevron" d="M3 5L7 9L11 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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

    .narrative-card {
      position: relative;
      max-width: 520px;
      padding-bottom: 14px;
      pointer-events: auto;
    }

    .narrative-wrapper {
      position: relative;
      padding: 10px 16px;
      background: rgba(10, 30, 20, 0.55);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
    }

    .narrative-toggle {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 50%;
      background: rgba(10, 30, 20, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 0;
      outline: none;
    }

    .narrative-toggle:hover {
      background: rgba(20, 60, 40, 0.8);
      border-color: rgba(255, 255, 255, 0.3);
      color: #fff;
    }

    .toggle-chevron {
      transition: transform 0.3s ease;
      transform-origin: center;
    }

    #narrative-ui.collapsed .toggle-chevron {
      transform: rotate(180deg);
    }

    .narrative-title {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.4;
      color: rgba(255, 255, 255, 0.95);
      margin-bottom: 4px;
    }

    #narrative-ui.collapsed .narrative-title {
      margin-bottom: 0;
    }

    .narrative-body {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 13px;
      line-height: 1.55;
      color: rgba(255, 255, 255, 0.85);
      max-height: 250px;
      overflow: hidden;
      transition: max-height 0.4s ease, opacity 0.3s ease;
    }

    #narrative-ui.collapsed .narrative-body {
      max-height: 0;
      opacity: 0;
    }

    .narrative-ref-btn {
      position: absolute;
      top: 8px;
      right: 10px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px 3px 6px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.5);
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
      outline: none;
    }

    .narrative-ref-btn:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
      color: rgba(255, 255, 255, 0.85);
    }

    .narrative-ref-btn.hidden {
      display: none;
    }

    .narrative-ref-btn svg {
      flex-shrink: 0;
    }

    .narrative-ref-count {
      font-variant-numeric: tabular-nums;
    }

    #narrative-ui.collapsed .narrative-ref-btn {
      display: none;
    }

    @media (min-width: 768px) {
      #narrative-ui {
        left: 24px;
        transform: none;
      }
    }

    @media (max-width: 600px) {
      #narrative-ui { bottom: 80px; }
      .narrative-card { width: 90vw; max-width: 90vw; }
      .narrative-wrapper { padding: 8px 12px; }
      .narrative-title { font-size: 13px; }
      .narrative-body { font-size: 12px; }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(container);

  const titleEl = container.querySelector('.narrative-title') as HTMLDivElement;
  const bodyEl = container.querySelector('.narrative-body') as HTMLDivElement;
  const toggleBtn = container.querySelector('.narrative-toggle') as HTMLButtonElement;
  const refBtn = container.querySelector('.narrative-ref-btn') as HTMLButtonElement;
  const refCountEl = container.querySelector('.narrative-ref-count') as HTMLSpanElement;

  let currentRefChapter = '';
  let currentRefStage = '';

  toggleBtn.addEventListener('click', () => {
    container.classList.toggle('collapsed');
  });

  refBtn.addEventListener('click', () => {
    if (ui.onRefClick && currentRefChapter && currentRefStage) {
      ui.onRefClick(currentRefChapter, currentRefStage);
    }
  });

  function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const ui: NarrativeUI = {
    onRefClick: null,
    setText(name: string, text: string, isSpecies?: boolean, refInfo?: RefInfo) {
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

      titleEl.innerHTML = titleHtml;
      bodyEl.textContent = bodyText;
      container.classList.remove('collapsed');

      // Update ref button
      if (refInfo && refInfo.count > 0) {
        currentRefChapter = refInfo.chapterKey;
        currentRefStage = refInfo.stageKey;
        refCountEl.textContent = String(refInfo.count);
        refBtn.classList.remove('hidden');
      } else {
        currentRefChapter = '';
        currentRefStage = '';
        refBtn.classList.add('hidden');
      }
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

  return ui;
}
