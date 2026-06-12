import es from "./locales/es.json";
import en from "./locales/en.json";
import de from "./locales/de.json";

export type Locale = "es" | "en" | "de";

type TranslationMap = Record<string, string>;

const locales: Record<Locale, TranslationMap> = { es, en, de };

const FALLBACK_LOCALE: Locale = "es";

let current: Locale = FALLBACK_LOCALE;

export function t(key: string): string {
  return locales[current]?.[key] ?? locales[FALLBACK_LOCALE]?.[key] ?? key;
}

export function getCurrentLocale(): Locale {
  return current;
}

export function setLocale(locale: Locale): void {
  current = locale;
  document.documentElement.lang = locale;
  translateDOM();
  translateMeta();
  window.dispatchEvent(new CustomEvent("localechange", { detail: { locale } }));
}

function translateDOM(): void {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      el.textContent = t(key);
    }
  });
}

function translateMeta(): void {
  document.querySelectorAll("[data-i18n-content]").forEach((el) => {
    const key = el.getAttribute("data-i18n-content");
    if (key) {
      el.setAttribute("content", t(key));
    }
  });
}
