import { writable, derived } from "svelte/store";
import es from "./locales/es.json";
import en from "./locales/en.json";
import de from "./locales/de.json";
import type { Locale } from "./types";

const all: Record<Locale, Record<string, string>> = { es, en, de };

export const locale = writable<Locale>("es");

export const t = derived(locale, ($locale) => {
  const map = all[$locale] ?? all.es;
  return (key: string): string => map[key] ?? all.es?.[key] ?? key;
});

export function setLocale(l: Locale): void {
  locale.set(l);
  document.documentElement.lang = l;
}

export function getCurrentLocale(): Locale {
  let val: Locale = "es";
  locale.subscribe((l) => { val = l; })();
  return val;
}
