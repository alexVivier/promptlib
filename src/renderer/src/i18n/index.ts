import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './locales/fr'
import en from './locales/en'
import es from './locales/es'
import pt from './locales/pt'
import de from './locales/de'

export const SUPPORTED_LANGUAGES = ['fr', 'en', 'es', 'pt', 'de'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  pt: 'Português',
  de: 'Deutsch'
}

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    es: { translation: es },
    pt: { translation: pt },
    de: { translation: de }
  },
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
