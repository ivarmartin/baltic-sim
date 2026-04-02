import type { Locale, TranslationStrings } from './types';
import { en } from './en';
import { sv } from './sv';

export type { Locale, TranslationStrings };

const translations: Record<Locale, TranslationStrings> = { en, sv };

let current: Locale = (localStorage.getItem('baltic-lang') as Locale) || 'en';
// Validate stored value
if (!translations[current]) current = 'en';

const listeners: Array<(locale: Locale) => void> = [];

export function getLocale(): Locale {
  return current;
}

export function t(): TranslationStrings {
  return translations[current];
}

export function setLocale(locale: Locale) {
  if (locale === current) return;
  current = locale;
  localStorage.setItem('baltic-lang', locale);
  for (const fn of listeners) fn(locale);
}

export function onLocaleChange(fn: (locale: Locale) => void): () => void {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}

export const locales: { code: Locale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'sv', label: 'Svenska' },
];
