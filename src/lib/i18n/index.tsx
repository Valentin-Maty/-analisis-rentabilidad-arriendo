/*
Domain: Internationalization
Responsibility: Sistema de internacionalización para la aplicación
Dependencies: Locales, React Context
*/

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import es from './locales/es'
import en from './locales/en'
import type { Locale } from './locales/types'

// Tipos para el sistema i18n
export type SupportedLocale = 'es' | 'en'
export type TranslationKey = string
export type TranslationParams = Record<string, string | number>

// Configuración de locales
const locales = {
  es,
  en
} as const

const DEFAULT_LOCALE: SupportedLocale = 'es'
const STORAGE_KEY = 'app_locale'

// Utilidad para obtener valor anidado de un objeto usando dot notation
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path
}

// Utilidad para reemplazar parámetros en strings de traducción
function interpolate(template: string, params: TranslationParams = {}): string {
  return Object.entries(params).reduce(
    (str, [key, value]) => str.replace(`{${key}}`, String(value)),
    template
  )
}

// Contexto de i18n
interface I18nContextType {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  t: (key: TranslationKey, params?: TranslationParams) => string
  isRTL: boolean
  getAvailableLocales: () => SupportedLocale[]
  getCurrentLocaleData: () => Locale
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Hook para usar el contexto de i18n
export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider')
  }
  return context
}

// Proveedor de i18n
interface I18nProviderProps {
  children: ReactNode
  defaultLocale?: SupportedLocale
}

export function I18nProvider({ children, defaultLocale = DEFAULT_LOCALE }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(defaultLocale)

  // Cargar locale desde localStorage al montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem(STORAGE_KEY) as SupportedLocale
      if (savedLocale && savedLocale in locales) {
        setLocaleState(savedLocale)
      } else {
        // Detectar idioma del navegador
        const browserLang = navigator.language.split('-')[0] as SupportedLocale
        if (browserLang in locales) {
          setLocaleState(browserLang)
        }
      }
    }
  }, [])

  // Guardar locale en localStorage y actualizar estado
  const setLocale = (newLocale: SupportedLocale) => {
    if (newLocale in locales) {
      setLocaleState(newLocale)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newLocale)
        // Actualizar el atributo lang del documento
        document.documentElement.lang = newLocale
      }
    }
  }

  // Función de traducción
  const t = (key: TranslationKey, params?: TranslationParams): string => {
    const currentLocaleData = locales[locale] || locales[DEFAULT_LOCALE]
    const translation = getNestedValue(currentLocaleData, key)
    return params ? interpolate(translation, params) : translation
  }

  // Verificar si el idioma se lee de derecha a izquierda
  const isRTL = false // Solo idiomas LTR por ahora

  // Obtener locales disponibles
  const getAvailableLocales = (): SupportedLocale[] => {
    return Object.keys(locales) as SupportedLocale[]
  }

  // Obtener datos del locale actual
  const getCurrentLocaleData = (): Locale => {
    return locales[locale] || locales[DEFAULT_LOCALE]
  }

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
    isRTL,
    getAvailableLocales,
    getCurrentLocaleData
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

// Hook para formateo de números según locale
export function useNumberFormat() {
  const { locale } = useTranslation()

  const formatCurrency = (
    amount: number, 
    currency: 'CLP' | 'UF' | 'USD' = 'CLP'
  ): string => {
    const localeMap = {
      es: 'es-CL',
      en: 'en-US'
    }

    const currencyMap = {
      CLP: 'CLP',
      UF: undefined, // UF no es una moneda ISO, manejo especial
      USD: 'USD'
    }

    if (currency === 'UF') {
      // Formato especial para UF
      return `${amount.toLocaleString(localeMap[locale], {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })} UF`
    }

    return new Intl.NumberFormat(localeMap[locale], {
      style: 'currency',
      currency: currencyMap[currency],
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (
    number: number, 
    options?: Intl.NumberFormatOptions
  ): string => {
    const localeMap = {
      es: 'es-CL',
      en: 'en-US'
    }

    return new Intl.NumberFormat(localeMap[locale], options).format(number)
  }

  const formatPercentage = (
    number: number, 
    decimals: number = 1
  ): string => {
    const localeMap = {
      es: 'es-CL',
      en: 'en-US'
    }

    return new Intl.NumberFormat(localeMap[locale], {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number / 100)
  }

  return {
    formatCurrency,
    formatNumber,
    formatPercentage
  }
}

// Hook para formateo de fechas según locale
export function useDateFormat() {
  const { locale } = useTranslation()

  const formatDate = (
    date: Date | string,
    format: 'short' | 'long' | 'dateTime' = 'short'
  ): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    const localeMap = {
      es: 'es-CL',
      en: 'en-US'
    }

    const formatMap = {
      short: { 
        year: 'numeric' as const, 
        month: '2-digit' as const, 
        day: '2-digit' as const 
      },
      long: { 
        year: 'numeric' as const, 
        month: 'long' as const, 
        day: 'numeric' as const 
      },
      dateTime: { 
        year: 'numeric' as const, 
        month: '2-digit' as const, 
        day: '2-digit' as const,
        hour: '2-digit' as const,
        minute: '2-digit' as const
      }
    }

    return new Intl.DateTimeFormat(localeMap[locale], formatMap[format]).format(dateObj)
  }

  const getRelativeTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffMs = dateObj.getTime() - now.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    const { t } = useTranslation()

    if (diffDays === 0) return t('dates.today')
    if (diffDays === -1) return t('dates.yesterday')
    if (diffDays === 1) return t('dates.tomorrow')
    if (diffDays > 1 && diffDays <= 7) return t('dates.thisWeek')
    if (diffDays < -1 && diffDays >= -7) return t('dates.lastWeek')

    return formatDate(dateObj, 'short')
  }

  return {
    formatDate,
    getRelativeTime
  }
}

// Componente de selector de idioma
interface LanguageSelectorProps {
  className?: string
  showLabels?: boolean
}

export function LanguageSelector({ className = '', showLabels = true }: LanguageSelectorProps) {
  const { locale, setLocale, getAvailableLocales } = useTranslation()

  const localeNames = {
    es: { name: 'Español', flag: '🇪🇸' },
    en: { name: 'English', flag: '🇺🇸' }
  }

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as SupportedLocale)}
      className={`border rounded px-2 py-1 ${className}`}
      aria-label="Seleccionar idioma"
    >
      {getAvailableLocales().map((loc) => (
        <option key={loc} value={loc}>
          {localeNames[loc].flag} {showLabels ? localeNames[loc].name : ''}
        </option>
      ))}
    </select>
  )
}

// Utilidades adicionales
export const i18nUtils = {
  // Obtener la traducción directamente sin hook (para uso en funciones)
  getTranslation: (
    key: TranslationKey, 
    locale: SupportedLocale = DEFAULT_LOCALE, 
    params?: TranslationParams
  ): string => {
    const localeData = locales[locale] || locales[DEFAULT_LOCALE]
    const translation = getNestedValue(localeData, key)
    return params ? interpolate(translation, params) : translation
  },

  // Verificar si una clave de traducción existe
  hasTranslation: (key: TranslationKey, locale: SupportedLocale = DEFAULT_LOCALE): boolean => {
    const localeData = locales[locale] || locales[DEFAULT_LOCALE]
    const value = getNestedValue(localeData, key)
    return value !== key
  },

  // Obtener todas las claves de traducción disponibles
  getAllTranslationKeys: (locale: SupportedLocale = DEFAULT_LOCALE): string[] => {
    const localeData = locales[locale] || locales[DEFAULT_LOCALE]
    const keys: string[] = []
    
    const traverse = (obj: any, prefix = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        const currentKey = prefix ? `${prefix}.${key}` : key
        if (typeof value === 'string') {
          keys.push(currentKey)
        } else if (typeof value === 'object' && value !== null) {
          traverse(value, currentKey)
        }
      })
    }
    
    traverse(localeData)
    return keys
  }
}

export default {
  I18nProvider,
  useTranslation,
  useNumberFormat,
  useDateFormat,
  LanguageSelector,
  i18nUtils
}