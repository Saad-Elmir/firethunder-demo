import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import fr from "./fr.json";

const STORAGE_KEY = "lang";

const saved = localStorage.getItem(STORAGE_KEY);
const lng: "en" | "fr" = saved === "fr" || saved === "en" ? saved : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export const setLang = (next: "en" | "fr") => {
  localStorage.setItem(STORAGE_KEY, next);
  i18n.changeLanguage(next);
  return next;
};

export const getLang = (): "en" | "fr" => {
  const v = i18n.language;
  return v === "fr" ? "fr" : "en";
};

export const toggleLang = (): "en" | "fr" => {
  const next: "en" | "fr" = getLang() === "en" ? "fr" : "en";
  return setLang(next);
};

export default i18n;

