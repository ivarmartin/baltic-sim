import { t, getLocale, setLocale, onLocaleChange, locales } from '../i18n';
import type { Locale } from '../i18n';

export interface MenuUI {
  dispose: () => void;
}

// Minimal inline SVG flags
const flags: Record<Locale, string> = {
  en: `<svg width="22" height="16" viewBox="0 0 22 16" fill="none">
    <rect width="22" height="16" rx="2" fill="#012169"/>
    <path d="M0 0L22 16M22 0L0 16" stroke="#fff" stroke-width="2.6"/>
    <path d="M0 0L22 16M22 0L0 16" stroke="#C8102E" stroke-width="1.4"/>
    <path d="M11 0V16M0 8H22" stroke="#fff" stroke-width="4.4"/>
    <path d="M11 0V16M0 8H22" stroke="#C8102E" stroke-width="2.6"/>
  </svg>`,
  sv: `<svg width="22" height="16" viewBox="0 0 22 16" fill="none">
    <rect width="22" height="16" rx="2" fill="#006AA7"/>
    <path d="M7 0V16M0 8H22" stroke="#FECC02" stroke-width="3"/>
  </svg>`,
};

export function createMenu(): MenuUI {
  // --- Container for hamburger + language selector (top-right) ---
  const container = document.createElement('div');
  container.id = 'menu-container';

  container.innerHTML = `
    <button class="menu-btn menu-hamburger" aria-label="Menu">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 5H15M3 9H15M3 13H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
    <div class="lang-selector">
      <button class="menu-btn lang-current" aria-label="Change language">
        ${flags[getLocale()]}
      </button>
      <div class="lang-dropdown hidden"></div>
    </div>
  `;

  // --- About overlay ---
  const overlay = document.createElement('div');
  overlay.id = 'menu-overlay';
  overlay.classList.add('hidden');

  function renderOverlay() {
    const tr = t();
    overlay.innerHTML = `
      <div class="menu-overlay-inner">
        <button class="menu-btn menu-close" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
        <h2 class="menu-overlay-title">${tr.ui.aboutTitle}</h2>
        <p class="menu-overlay-text">${tr.ui.aboutText}</p>
      </div>
    `;
    overlay.querySelector('.menu-close')!.addEventListener('click', () => {
      overlay.classList.add('hidden');
    });
  }
  renderOverlay();

  // --- Build language dropdown ---
  const dropdown = container.querySelector('.lang-dropdown') as HTMLDivElement;
  const langBtn = container.querySelector('.lang-current') as HTMLButtonElement;

  function buildDropdown() {
    dropdown.innerHTML = '';
    for (const loc of locales) {
      const btn = document.createElement('button');
      btn.className = 'lang-option';
      btn.dataset.lang = loc.code;
      btn.innerHTML = `${flags[loc.code]} <span>${loc.label}</span>`;
      if (loc.code === getLocale()) btn.classList.add('active');
      btn.addEventListener('click', () => {
        setLocale(loc.code);
        dropdown.classList.add('hidden');
      });
      dropdown.appendChild(btn);
    }
  }
  buildDropdown();

  // --- Styles ---
  const style = document.createElement('style');
  style.textContent = `
    #menu-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 250;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      pointer-events: auto;
    }

    .menu-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
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

    .menu-btn:hover {
      background: rgba(20, 60, 40, 0.7);
      border-color: rgba(255, 255, 255, 0.3);
      color: #fff;
      transform: scale(1.08);
    }

    .menu-btn:active {
      transform: scale(0.95);
    }

    /* Language selector */
    .lang-selector {
      position: relative;
    }

    .lang-current {
      overflow: hidden;
    }

    .lang-current svg {
      display: block;
    }

    .lang-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      min-width: 140px;
      background: rgba(10, 30, 20, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      transition: opacity 0.2s ease, transform 0.2s ease;
      transform-origin: top right;
    }

    .lang-dropdown.hidden {
      opacity: 0;
      pointer-events: none;
      transform: scale(0.95);
    }

    .lang-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border: none;
      border-radius: 7px;
      background: transparent;
      color: rgba(255, 255, 255, 0.8);
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.15s ease;
      text-align: left;
      outline: none;
    }

    .lang-option:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .lang-option.active {
      color: rgba(255, 255, 255, 1);
      background: rgba(255, 255, 255, 0.08);
    }

    .lang-option svg {
      flex-shrink: 0;
    }

    /* About overlay */
    #menu-overlay {
      position: fixed;
      inset: 0;
      z-index: 300;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(5, 15, 10, 0.8);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      transition: opacity 0.4s ease;
    }

    #menu-overlay.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .menu-overlay-inner {
      position: relative;
      max-width: 440px;
      padding: 32px;
      text-align: center;
    }

    .menu-close {
      position: absolute;
      top: -8px;
      right: -8px;
    }

    .menu-overlay-title {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.92);
      margin: 0 0 16px 0;
    }

    .menu-overlay-text {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }

    @media (max-width: 480px) {
      #menu-container { top: 16px; right: 16px; }
      .menu-btn { width: 34px; height: 34px; }
      .menu-overlay-inner { padding: 24px 20px; }
      .menu-overlay-title { font-size: 20px; }
      .menu-overlay-text { font-size: 13px; }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(container);
  document.body.appendChild(overlay);

  // --- Event handlers ---
  const hamburgerBtn = container.querySelector('.menu-hamburger') as HTMLButtonElement;
  hamburgerBtn.addEventListener('click', () => {
    overlay.classList.remove('hidden');
  });

  langBtn.addEventListener('click', () => {
    dropdown.classList.toggle('hidden');
  });

  // Close dropdown when clicking outside
  function onDocClick(e: MouseEvent) {
    if (!container.querySelector('.lang-selector')!.contains(e.target as Node)) {
      dropdown.classList.add('hidden');
    }
  }
  document.addEventListener('click', onDocClick);

  // Update flag button + dropdown active state on locale change
  const unsub = onLocaleChange((locale) => {
    langBtn.innerHTML = flags[locale];
    dropdown.querySelectorAll('.lang-option').forEach((el) => {
      el.classList.toggle('active', (el as HTMLElement).dataset.lang === locale);
    });
    renderOverlay();
  });

  return {
    dispose() {
      unsub();
      document.removeEventListener('click', onDocClick);
      container.remove();
      overlay.remove();
      style.remove();
    },
  };
}
