import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files directly (bundled with Vite)
import en from "./locales/en/translation.json";
import mr from "./locales/mr/translation.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            mr: { translation: mr },
        },
        fallbackLng: "en",
        interpolation: {
            escapeValue: false, // React already escapes
        },
        detection: {
            order: ["localStorage", "navigator"],
            lookupLocalStorage: "i18nextLng",
            caches: ["localStorage"],
        },
    });

export default i18n;
