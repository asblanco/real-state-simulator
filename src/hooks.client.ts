import { setLocale } from "$lib/i18n";

const lang = navigator.language?.slice(0, 2);
if (lang === "en" || lang === "de") {
  setLocale(lang);
}
