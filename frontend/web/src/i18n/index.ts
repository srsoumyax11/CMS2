import en from './en.json';

type NestedKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeys<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

export type TranslationKey = NestedKeys<typeof en> | (string & {});

function getNestedValue(obj: unknown, path: string): string | undefined {
  const parts = path.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr && typeof curr === 'object' && part in (curr as Record<string, unknown>)) {
      curr = (curr as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof curr === 'string' ? curr : undefined;
}

export function t(key: string, params?: Record<string, string | number>): string {
  let text = getNestedValue(en, key) || key;
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
    });
  }
  return text;
}
