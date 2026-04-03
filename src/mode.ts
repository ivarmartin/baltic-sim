export type ExperienceMode = 'linear' | 'ai-guided';

let current: ExperienceMode =
  (localStorage.getItem('baltic-mode') as ExperienceMode) || 'linear';
if (current !== 'linear' && current !== 'ai-guided') current = 'linear';

const listeners: Array<(mode: ExperienceMode) => void> = [];

export function getMode(): ExperienceMode {
  return current;
}

export function setMode(mode: ExperienceMode) {
  if (mode === current) return;
  current = mode;
  localStorage.setItem('baltic-mode', mode);
  for (const fn of listeners) fn(mode);
}

export function onModeChange(fn: (mode: ExperienceMode) => void): () => void {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}
