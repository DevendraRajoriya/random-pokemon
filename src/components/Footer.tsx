"use client";

import { Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

/**
 * Footer Component
 * 
 * Note: This component uses next-intl for localized navigation.
 */
export default function Footer() {
  const t = useTranslations('common');
  return (
    <footer className="border-t-4 border-black bg-cream mt-12" suppressHydrationWarning>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12">
          
          {/* Column 1: Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h3 className="font-sans font-bold text-2xl md:text-3xl text-black uppercase leading-tight">
              RANDOM POKEMON<br />GENERATOR
            </h3>
            <p className="font-mono text-sm text-charcoal">
              Advanced Team Building Protocol v1.0
            </p>
            <div className="inline-flex items-center gap-2 bg-black px-3 py-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="font-mono text-xs text-white uppercase tracking-wider">System Online</span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-4">
            <h4 className="font-sans font-bold text-sm text-black uppercase tracking-wider border-b-2 border-black pb-2">
              NAVIGATION
            </h4>
            <nav className="space-y-1">
              <Link 
                href="/" 
                className="block font-mono text-sm text-charcoal px-2 py-1.5 -mx-2 hover:bg-marigold hover:text-black transition-colors"
              >
                Generator
              </Link>
              <Link 
                href="/pokedex" 
                className="block font-mono text-sm text-charcoal px-2 py-1.5 -mx-2 hover:bg-marigold hover:text-black transition-colors"
              >
                Pokedex Database
              </Link>
            </nav>
            
            {/* Language Switcher */}
            <div className="pt-4 border-t border-black/20">
              <div className="font-mono text-xs text-charcoal uppercase mb-2">{t('language')}</div>
              <LanguageSwitcher variant="compact" />
            </div>
          </div>

          {/* Column 3: Communication */}
          <div className="space-y-4">
            <h4 className="font-sans font-bold text-sm text-black uppercase tracking-wider border-b-2 border-black pb-2">
              COMMUNICATION
            </h4>

            {/* Socials */}
            <div className="space-y-3">
              <div className="font-mono text-xs text-charcoal uppercase">Connect</div>
              <div className="flex gap-2">
                <a
                  href="mailto:shadowrajoriya@gmail.com"
                  className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center hover:bg-marigold transition-colors"
                  aria-label="Email"
                >
                  <Mail size={20} className="text-[#EA4335]" />
                </a>
                <a
                  href="https://x.com/MisterLezend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center hover:bg-marigold transition-colors"
                  aria-label="X (Twitter)"
                >
                  <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://github.com/DevendraRajoriya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center hover:bg-marigold transition-colors"
                  aria-label="GitHub"
                >
                  <svg className="w-5 h-5 text-[#181717]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Warning Box */}
      <div className="px-4 md:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Nintendo Notice */}
          <div className="bg-white border-2 border-black text-black p-6 slasher">
            <div className="flex items-start gap-3">
              <div className="bg-red-600 text-white font-mono text-xs font-bold px-2 py-1 slasher shrink-0">
                NOTICE
              </div>
              <p className="font-mono text-sm leading-relaxed">
                Pokémon is © 1995-2025 Nintendo / Creatures Inc. / GAME FREAK inc. TM, ® and character names are trademarks of Nintendo. This tool is not affiliated with, endorsed, or sponsored by Nintendo, The Pokémon Company, or any related entities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Footer */}
      <div className="border-t-2 border-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <p className="font-mono text-xs text-charcoal text-center">
            Designed by <span className="font-bold text-black">Shadow Rajoriya</span> · Not affiliated with Nintendo
          </p>
        </div>
      </div>
    </footer>
  );
}
