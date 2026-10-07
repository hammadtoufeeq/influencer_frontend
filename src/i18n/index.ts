import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ur from './locales/ur.json'
import ar from './locales/ar.json'

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ur', label: 'اردو' },
  { code: 'ar', label: 'العربية' },
] as const

const STORAGE_KEY = 'lang'

function savedLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? 'en'
  } catch {
    return 'en'
  }
}

export function saveLanguage(code: string) {
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    // Private window waghera: sirf is session ke liye
  }
}

// Urdu aur Arabic right-to-left hain; i18n.dir() khud batata hai
i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ur: { translation: ur }, ar: { translation: ar } },
  lng: savedLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
