import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'ja', 'fr', 'de', 'es', 'pt', 'ko'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  // All locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en',

  // The prefix for the default locale (optional - 'as-needed' means no prefix for default)
  localePrefix: 'as-needed',
});

// Locale display names for the language switcher
export const localeNames: Record<Locale, string> = {
  en: 'English',
  ja: '日本語',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  pt: 'Português',
  ko: '한국어',
};

// Map our locales to PokeAPI language codes
export const pokeApiLanguageMap: Record<Locale, string> = {
  en: 'en',
  ja: 'ja',
  fr: 'fr',
  de: 'de',
  es: 'es',
  pt: 'pt', // Note: PokeAPI uses 'pt' for Portuguese
  ko: 'ko',
};
