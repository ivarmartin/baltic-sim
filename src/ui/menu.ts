import { t, getLocale, setLocale, onLocaleChange, locales } from '../i18n';
import type { Locale } from '../i18n';

export interface MenuUI {
  openToRef: (chapterKey: string, stageKey: string) => void;
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

    // Build references HTML from chapters that have a references catalog
    let refsHtml = '';
    for (const [chapterKey, chapter] of Object.entries(tr.chapters)) {
      if (!chapter.references) continue;
      const catalog = chapter.references;
      let sectionsHtml = '';

      // Stage-level refs
      for (const [stageKey, stage] of Object.entries(chapter.stages)) {
        if (!stage.refs?.length) continue;
        let entriesHtml = '';
        for (const ref of stage.refs) {
          const entry = catalog[ref.refId];
          if (!entry) continue;
          entriesHtml += `
            <div class="ref-entry">
              <p class="ref-desc">${ref.description}</p>
              <p class="ref-cite">${entry.citation}</p>
              <a class="ref-link" href="${entry.url}" target="_blank" rel="noopener noreferrer">${entry.linkText}</a>
            </div>`;
        }
        sectionsHtml += `
          <div class="ref-section" data-stage="${stageKey}">
            <h4 class="ref-section-title">${stage.name}</h4>
            ${entriesHtml}
          </div>`;
      }

      // Chapter-level refs (e.g., Pan-Baltic)
      if (chapter.chapterRefs?.refs.length) {
        let entriesHtml = '';
        for (const ref of chapter.chapterRefs.refs) {
          const entry = catalog[ref.refId];
          if (!entry) continue;
          entriesHtml += `
            <div class="ref-entry">
              <p class="ref-desc">${ref.description}</p>
              <p class="ref-cite">${entry.citation}</p>
              <a class="ref-link" href="${entry.url}" target="_blank" rel="noopener noreferrer">${entry.linkText}</a>
            </div>`;
        }
        sectionsHtml += `
          <div class="ref-section">
            <h4 class="ref-section-title">${chapter.chapterRefs.title}</h4>
            ${entriesHtml}
          </div>`;
      }

      if (!sectionsHtml) continue;

      refsHtml += `
        <div class="ref-chapter" data-chapter="${chapterKey}">
          <button class="ref-chapter-header" aria-expanded="false">
            <span>${chapter.title}</span>
            <svg class="ref-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="ref-chapter-body">
            ${sectionsHtml}
          </div>
        </div>`;
    }

    overlay.innerHTML = `
      <button class="menu-btn menu-close" aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="menu-overlay-inner">
        <h2 class="menu-overlay-title">${tr.ui.aboutTitle}</h2>
        <p class="menu-overlay-text">${tr.ui.aboutText}</p>
        <div class="menu-refs">
          <h3 class="menu-refs-title">${tr.ui.referencesTitle}</h3>
          <p class="menu-refs-subtitle">${tr.ui.referencesSubtitle}</p>
          ${refsHtml}
        </div>
      </div>
    `;

    overlay.querySelector('.menu-close')!.addEventListener('click', () => {
      overlay.classList.add('hidden');
    });

    // Close on backdrop click (outside inner content)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.add('hidden');
      }
    });

    // Accordion toggle handlers
    overlay.querySelectorAll('.ref-chapter-header').forEach((btn) => {
      btn.addEventListener('click', () => {
        const expanded = btn.classList.toggle('expanded');
        btn.setAttribute('aria-expanded', String(expanded));
      });
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
      align-items: flex-start;
      justify-content: center;
      background: rgba(5, 15, 10, 0.8);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      transition: opacity 0.4s ease;
      overflow-y: auto;
      padding: 48px 16px;
    }

    #menu-overlay.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .menu-overlay-inner {
      position: relative;
      max-width: 560px;
      width: 100%;
      padding: 32px;
      text-align: left;
    }

    .menu-close {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 301;
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

    /* References section */
    .menu-refs {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .menu-refs-title {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.88);
      margin: 0 0 6px 0;
    }

    .menu-refs-subtitle {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 13px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.45);
      margin: 0 0 20px 0;
    }

    /* Accordion chapter headers */
    .ref-chapter {
      margin-bottom: 8px;
    }

    .ref-chapter-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.85);
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease, border-color 0.2s ease;
      text-align: left;
      outline: none;
    }

    .ref-chapter-header:hover {
      background: rgba(255, 255, 255, 0.07);
      border-color: rgba(255, 255, 255, 0.14);
    }

    .ref-chapter-header.expanded {
      border-radius: 8px 8px 0 0;
      border-bottom-color: transparent;
    }

    .ref-chevron {
      flex-shrink: 0;
      transition: transform 0.3s ease;
    }

    .ref-chapter-header.expanded .ref-chevron {
      transform: rotate(180deg);
    }

    /* Accordion body */
    .ref-chapter-body {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s ease;
      border: 1px solid transparent;
      border-radius: 0 0 8px 8px;
    }

    .ref-chapter-header.expanded + .ref-chapter-body {
      max-height: 3000px;
      border-color: rgba(255, 255, 255, 0.08);
      border-top: none;
    }

    /* Section within accordion */
    .ref-section {
      padding: 14px 14px 6px;
    }

    .ref-section + .ref-section {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .ref-section-title {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.65);
      margin: 0 0 10px 0;
    }

    /* Individual reference entry */
    .ref-entry {
      margin-bottom: 14px;
      padding-left: 12px;
      border-left: 2px solid rgba(255, 255, 255, 0.08);
    }

    .ref-desc {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.6);
      margin: 0 0 4px 0;
    }

    .ref-cite {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.45);
      margin: 0 0 4px 0;
      font-style: italic;
    }

    .ref-link {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 12px;
      color: rgba(120, 180, 220, 0.8);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .ref-link:hover {
      color: rgba(150, 210, 250, 1);
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      #menu-container { top: 16px; right: 16px; }
      .menu-btn { width: 34px; height: 34px; }
      .menu-close { top: 16px; right: 16px; }
      #menu-overlay { padding: 32px 10px; }
      .menu-overlay-inner { padding: 24px 16px; }
      .menu-overlay-title { font-size: 20px; }
      .menu-overlay-text { font-size: 13px; }
      .menu-refs-title { font-size: 16px; }
      .ref-chapter-header { font-size: 13px; padding: 9px 12px; }
      .ref-section { padding: 12px 10px 4px; }
      .ref-desc, .ref-cite, .ref-link { font-size: 11px; }
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
    openToRef(chapterKey: string, stageKey: string) {
      // Collapse all accordions first
      overlay.querySelectorAll('.ref-chapter-header.expanded').forEach((btn) => {
        btn.classList.remove('expanded');
        btn.setAttribute('aria-expanded', 'false');
      });

      // Expand the target chapter accordion
      const chapterEl = overlay.querySelector(`.ref-chapter[data-chapter="${chapterKey}"]`);
      const headerBtn = chapterEl?.querySelector('.ref-chapter-header');
      if (headerBtn) {
        headerBtn.classList.add('expanded');
        headerBtn.setAttribute('aria-expanded', 'true');
      }

      // Show overlay
      overlay.classList.remove('hidden');

      // Scroll to the target stage section after a frame (let accordion expand)
      requestAnimationFrame(() => {
        const stageEl = chapterEl?.querySelector(`.ref-section[data-stage="${stageKey}"]`);
        stageEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    },
    dispose() {
      unsub();
      document.removeEventListener('click', onDocClick);
      container.remove();
      overlay.remove();
      style.remove();
    },
  };
}
