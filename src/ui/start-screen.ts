import type { Chapter } from '../stages/chapter-data';
import { t, onLocaleChange } from '../i18n';
import { getMode, setMode, onModeChange } from '../mode';

export interface StartScreen {
  show: () => void;
  hide: () => void;
  dispose: () => void;
}

export function createStartScreen(
  chapters: Chapter[],
  onSelect: (chapter: Chapter) => void,
): StartScreen {
  const overlay = document.createElement('div');
  overlay.id = 'start-screen';

  const chapterEntries = chapters.filter((ch) => ch.type !== 'appendix');
  const appendixEntries = chapters.filter((ch) => ch.type === 'appendix');

  function getChapterText(ch: Chapter) {
    const tr = t().chapters[ch.id];
    return {
      title: tr?.title || ch.id,
      subtitle: tr?.subtitle || '',
    };
  }

  function buildCards(items: Chapter[]): string {
    return items
      .map((ch) => {
        const text = getChapterText(ch);
        return `
      <button class="chapter-card" data-chapter-id="${ch.id}" data-type="${ch.type || 'chapter'}">
        <span class="chapter-title">${text.title}</span>
        <span class="chapter-subtitle">${text.subtitle}</span>
      </button>`;
      })
      .join('');
  }

  const tr = t();
  const appendixSection = appendixEntries.length > 0
    ? `<div class="appendix-divider"><span>${tr.ui.speciesGuides}</span></div>${buildCards(appendixEntries)}`
    : '';

  const currentMode = getMode();
  overlay.innerHTML = `
    <div class="start-inner">
      <h1 class="start-heading">${tr.ui.siteTitle}</h1>
      <p class="start-subheading">${tr.ui.chooseChapter}</p>
      <div class="mode-toggle">
        <button class="mode-option${currentMode === 'linear' ? ' active' : ''}" data-mode="linear">${tr.ui.modeLinear}</button>
        <button class="mode-option${currentMode === 'ai-guided' ? ' active' : ''}" data-mode="ai-guided">${tr.ui.modeAiGuided}</button>
      </div>
      <div class="chapter-list">
        ${buildCards(chapterEntries)}
        ${appendixSection}
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #start-screen {
      position: fixed;
      inset: 0;
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(5, 15, 10, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      transition: opacity 0.5s ease;
    }

    #start-screen.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .start-inner {
      text-align: center;
      max-width: 520px;
      padding: 0 24px;
    }

    .start-heading {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 38px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.92);
      margin: 0 0 6px 0;
      letter-spacing: -0.02em;
    }

    .start-subheading {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 15px;
      color: rgba(255, 255, 255, 0.45);
      margin: 0 0 36px 0;
    }

    .chapter-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .chapter-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 18px 22px;
      background: rgba(10, 30, 20, 0.55);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.25s ease;
      outline: none;
      text-align: left;
    }

    .chapter-card:hover {
      background: rgba(20, 60, 40, 0.7);
      border-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    .chapter-card:active {
      transform: translateY(0);
    }

    .chapter-title {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 17px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
    }

    .chapter-subtitle {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 4px;
      line-height: 1.4;
    }

    /* Appendix divider */
    .appendix-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 10px 0 2px 0;
    }

    .appendix-divider::before,
    .appendix-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
    }

    .appendix-divider span {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.3);
      white-space: nowrap;
    }

    /* Appendix card - subtler, smaller */
    .chapter-card[data-type="appendix"] {
      padding: 14px 18px;
      background: rgba(10, 20, 30, 0.4);
      border-color: rgba(255, 255, 255, 0.08);
      border-style: dashed;
    }

    .chapter-card[data-type="appendix"] .chapter-title {
      font-size: 14px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.7);
    }

    .chapter-card[data-type="appendix"] .chapter-subtitle {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.35);
    }

    .chapter-card[data-type="appendix"]:hover {
      background: rgba(15, 30, 45, 0.6);
      border-color: rgba(255, 255, 255, 0.2);
    }

    /* Mode toggle */
    .mode-toggle {
      display: flex;
      justify-content: center;
      gap: 0;
      margin: 0 auto 28px auto;
      background: rgba(10, 30, 20, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 4px;
      max-width: 320px;
    }

    .mode-option {
      flex: 1;
      padding: 10px 20px;
      border: none;
      border-radius: 9px;
      background: transparent;
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.45);
      cursor: pointer;
      transition: all 0.25s ease;
      outline: none;
    }

    .mode-option:hover {
      color: rgba(255, 255, 255, 0.7);
    }

    .mode-option.active {
      background: rgba(40, 100, 70, 0.55);
      color: rgba(255, 255, 255, 0.95);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 480px) {
      .start-heading { font-size: 28px; }
      .start-subheading { font-size: 13px; margin-bottom: 24px; }
      .chapter-card { padding: 14px 16px; }
      .chapter-title { font-size: 15px; }
      .chapter-subtitle { font-size: 12px; }
      .chapter-card[data-type="appendix"] { padding: 12px 14px; }
      .chapter-card[data-type="appendix"] .chapter-title { font-size: 13px; }
      .mode-toggle { max-width: 280px; }
      .mode-option { font-size: 13px; padding: 8px 14px; }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  // Wire up chapter card clicks
  const cards = overlay.querySelectorAll('.chapter-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const id = (card as HTMLElement).dataset.chapterId;
      const chapter = chapters.find((c) => c.id === id);
      if (chapter) onSelect(chapter);
    });
  });

  // Wire up mode toggle
  const modeButtons = overlay.querySelectorAll('.mode-option');
  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = (btn as HTMLElement).dataset.mode as 'linear' | 'ai-guided';
      setMode(mode);
    });
  });

  function updateModeUI() {
    const mode = getMode();
    modeButtons.forEach((btn) => {
      const isActive = (btn as HTMLElement).dataset.mode === mode;
      btn.classList.toggle('active', isActive);
    });
  }

  const unsubMode = onModeChange(() => updateModeUI());

  // Grab references for reactive text updates
  const headingEl = overlay.querySelector('.start-heading') as HTMLElement;
  const subheadingEl = overlay.querySelector('.start-subheading') as HTMLElement;
  const dividerEl = overlay.querySelector('.appendix-divider span') as HTMLElement | null;

  function updateText() {
    const tr = t();
    headingEl.textContent = tr.ui.siteTitle;
    subheadingEl.textContent = tr.ui.chooseChapter;
    if (dividerEl) dividerEl.textContent = tr.ui.speciesGuides;

    // Update mode toggle labels
    modeButtons.forEach((btn) => {
      const mode = (btn as HTMLElement).dataset.mode;
      if (mode === 'linear') btn.textContent = tr.ui.modeLinear;
      else if (mode === 'ai-guided') btn.textContent = tr.ui.modeAiGuided;
    });

    cards.forEach((card) => {
      const id = (card as HTMLElement).dataset.chapterId;
      const chapter = chapters.find((c) => c.id === id);
      if (!chapter) return;
      const text = getChapterText(chapter);
      const titleEl = card.querySelector('.chapter-title') as HTMLElement;
      const subtitleEl = card.querySelector('.chapter-subtitle') as HTMLElement;
      titleEl.textContent = text.title;
      subtitleEl.textContent = text.subtitle;
    });
  }

  const unsubLocale = onLocaleChange(() => updateText());

  return {
    show() {
      overlay.classList.remove('hidden');
    },
    hide() {
      overlay.classList.add('hidden');
    },
    dispose() {
      unsubLocale();
      unsubMode();
      overlay.remove();
      style.remove();
    },
  };
}
