import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../../assets/locales/en.json";
import zh from "../../assets/locales/zh.json";
i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources: {
    en: {
      translation: en,
    },
    zh: {
      translation: zh,
    },
  },
  fallbackLng: "en",
});

export default i18n;

export const getLanguageKMB = () => {
  return i18n.language === "en" ? "en" : "tc";
};
