'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeNames, Locale } from '@/i18n/routing';
import { ChevronDown, Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
}

export default function LanguageSwitcher({ 
  variant = 'default',
  className = '' 
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  // Get flag emoji for locale
  const getFlag = (loc: Locale): string => {
    const flags: Record<Locale, string> = {
      en: '🇺🇸',
      ja: '🇯🇵',
      fr: '🇫🇷',
      de: '🇩🇪',
      es: '🇪🇸',
      pt: '🇧🇷',
      ko: '🇰🇷',
    };
    return flags[loc];
  };

  if (variant === 'minimal') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-black/60 hover:text-black transition-colors"
          aria-label="Change language"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <Globe size={20} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 bg-white border-2 border-black min-w-[160px] z-50 slasher shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <ul role="listbox" aria-label="Select language">
              {locales.map((loc) => (
                <li key={loc}>
                  <button
                    role="option"
                    aria-selected={loc === locale}
                    onClick={() => handleLocaleChange(loc)}
                    className={`w-full px-4 py-2 text-left font-mono text-sm flex items-center gap-3 transition-colors ${
                      loc === locale
                        ? 'bg-marigold text-black font-bold'
                        : 'hover:bg-cream text-black'
                    }`}
                  >
                    <span className="text-base">{getFlag(loc)}</span>
                    <span>{localeNames[loc]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cream border-2 border-black font-mono text-xs hover:bg-charcoal hover:text-cream transition-colors"
          aria-label="Change language"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span>{getFlag(locale)}</span>
          <span className="uppercase">{locale}</span>
          <ChevronDown 
            size={12} 
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 bg-white border-2 border-black min-w-[140px] z-50 slasher">
            <ul role="listbox" aria-label="Select language">
              {locales.map((loc) => (
                <li key={loc}>
                  <button
                    role="option"
                    aria-selected={loc === locale}
                    onClick={() => handleLocaleChange(loc)}
                    className={`w-full px-3 py-2 text-left font-mono text-xs flex items-center gap-2 transition-colors ${
                      loc === locale
                        ? 'bg-marigold text-black font-bold'
                        : 'hover:bg-cream text-black'
                    }`}
                  >
                    <span>{getFlag(loc)}</span>
                    <span className="uppercase">{loc}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 px-4 bg-cream hover:bg-charcoal hover:text-cream border-2 border-black font-mono text-sm text-black flex items-center gap-2 transition-colors"
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe size={16} />
        <span className="font-semibold">{getFlag(locale)}</span>
        <span>{localeNames[locale]}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 bg-white border-2 border-black min-w-[200px] max-h-[300px] overflow-y-auto z-50 slasher shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <ul role="listbox" aria-label="Select language">
            {locales.map((loc) => (
              <li key={loc}>
                <button
                  role="option"
                  aria-selected={loc === locale}
                  onClick={() => handleLocaleChange(loc)}
                  className={`w-full px-4 py-3 text-left font-mono text-sm flex items-center gap-3 transition-colors border-b border-black/10 last:border-b-0 ${
                    loc === locale
                      ? 'bg-marigold text-black font-bold'
                      : 'hover:bg-cream text-black'
                  }`}
                >
                  <span className="text-lg">{getFlag(loc)}</span>
                  <div className="flex flex-col">
                    <span>{localeNames[loc]}</span>
                    <span className="text-xs text-charcoal uppercase">{loc}</span>
                  </div>
                  {loc === locale && (
                    <span className="ml-auto text-xs bg-black text-white px-2 py-0.5">
                      ✓
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
