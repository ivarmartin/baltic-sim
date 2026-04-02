import type { Chapter } from '../stages/chapter-data';

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

  const cardsHtml = chapters
    .map(
      (ch) => `
    <button class="chapter-card" data-chapter-id="${ch.id}">
      <span class="chapter-title">${ch.title}</span>
      <span class="chapter-subtitle">${ch.subtitle}</span>
    </button>`,
    )
    .join('');

  overlay.innerHTML = `
    <div class="start-inner">
      <h1 class="start-heading">Baltic Sea</h1>
      <p class="start-subheading">Choose a chapter</p>
      <div class="chapter-list">${cardsHtml}</div>
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

    @media (max-width: 480px) {
      .start-heading { font-size: 28px; }
      .start-subheading { font-size: 13px; margin-bottom: 24px; }
      .chapter-card { padding: 14px 16px; }
      .chapter-title { font-size: 15px; }
      .chapter-subtitle { font-size: 12px; }
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

  return {
    show() {
      overlay.classList.remove('hidden');
    },
    hide() {
      overlay.classList.add('hidden');
    },
    dispose() {
      overlay.remove();
      style.remove();
    },
  };
}
