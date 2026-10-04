import en from './locales/en.json';
import hi from './locales/hi.json';
import or from './locales/or.json';

export const resources = {
  en: { translation: en },
  hi: { translation: hi },
  or: { translation: or },
} as const;

export type TranslationKeys = typeof en;
export { en, hi, or };

export function translate(key: string, fallback?: string): string {
  const parts = key.split('.');
  let current: any = en;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return fallback || key;
    }
  }
  return typeof current === 'string' ? current : fallback || key;
}

export function useTranslation() {
  return {
    t: (key: string, fallback?: string) => translate(key, fallback),
  };
}
