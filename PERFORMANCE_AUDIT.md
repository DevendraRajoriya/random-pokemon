# 🚀 Performance Audit & Optimization Plan
## Random Pokémon Generator - Next.js 16

---

## 1. Audit & Metrics Analysis

### Estimated Lighthouse Issues (Based on Code Review)

#### **LCP (Largest Contentful Paint)** - Target: < 2.5s
- ❌ **Home page (`/`) is fully client-rendered** (`"use client"` at top) - No SSR content for Googlebot
- ❌ **Initial loading spinner** blocks visible content until client hydration
- ❌ **Auto-generate team on mount** causes waterfall of 6 API calls
- ❌ **Heavy JavaScript bundle** - entire filter logic in client bundle
- ⚠️ **Unoptimized images in suggestions dropdown** (uses `unoptimized` prop)

#### **INP (Interaction to Next Paint)** - Target: < 200ms
- ❌ **`generateTeam()` is synchronous and blocks main thread** - Multiple API fetches
- ❌ **`getValidPokemonIds()` loops through 1025 IDs** on every generation
- ⚠️ **Filter dropdowns re-render entire page** on state change
- ⚠️ **No debouncing on search input** - suggestions fetch on every keystroke

#### **CLS (Cumulative Layout Shift)** - Target: < 0.1
- ❌ **Team grid appears after loading** - causes major shift
- ❌ **Image placeholders missing** - Pokemon images pop in
- ⚠️ **Suggestions dropdown** can shift content below
- ⚠️ **Challenge Ideas section** appears after team generation

### Metrics to Track in Production

```typescript
// src/app/[locale]/layout.tsx - Add Web Vitals reporting
export function reportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  label: 'web-vital' | 'custom';
}) {
  // Send to analytics
  if (metric.label === 'web-vital') {
    console.log(`[Core Web Vital] ${metric.name}: ${metric.value}`);
    
    // Send to your analytics (e.g., Google Analytics 4)
    // gtag('event', metric.name, {
    //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //   event_label: metric.id,
    //   non_interaction: true,
    // });
  }
}
```

---

## 2. Rendering Strategy Recommendations

### Route Analysis

| Route | Current | Recommended | Reason |
|-------|---------|-------------|--------|
| `/` (Home) | Client | **Hybrid (Server + Client)** | Hero/SEO content SSG, filters client |
| `/pokedex` | SSG + Client | ✅ Keep as-is | Good pattern |
| `/pokemon/[name]` | SSG | ✅ Keep as-is | Already optimal |

### Architecture Refactor

```
✅ SERVER COMPONENTS (Data fetching, heavy logic)
├── HomePageServer.tsx (Hero, SEO content, initial team)
├── PokedexServer.tsx (Pokemon list, metadata)
└── PokemonDetailServer.tsx (All pokemon data)

✅ CLIENT COMPONENTS (Interactivity only)
├── FilterPanel.tsx (Dropdowns, checkboxes)
├── TeamGrid.tsx (Display, animations)
├── ShareModal.tsx (Modal interactions)
└── SearchAutocomplete.tsx (Suggestions)
```

---

## 3. Image & Asset Optimization

### Current Issues
1. `CardShowcase.tsx` uses plain `<img>` tag
2. `ShareModal.tsx` uses `<img>` for export (acceptable for canvas)
3. Many images use `unoptimized` prop unnecessarily

### Recommended Image Strategy

```tsx
// For Pokémon sprites in listings (small, many)
<Image
  src={sprite}
  alt={pokemonName}
  width={96}
  height={96}
  sizes="96px"
  loading="lazy" // Below fold
/>

// For hero/above-fold Pokemon artwork
<Image
  src={artwork}
  alt={pokemonName}
  width={475}
  height={475}
  sizes="(max-width: 768px) 280px, 475px"
  priority // LCP candidate
  placeholder="blur"
  blurDataURL={shimmerPlaceholder}
/>

// For social share images (OG)
// Use next.config.ts `images.remotePatterns` + dynamic OG generation
```

### Static Asset Caching (Already configured ✅)
```typescript
// next.config.ts - Good!
headers: async () => [
  {
    source: "/:all*(svg|jpg|png|webp|avif|ico)",
    headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
  },
]
```

---

## 4. JavaScript & Bundle Size

### Components to Lazy Load

```tsx
// 1. ShareModal - Heavy (html2canvas dependency)
const ShareModal = dynamic(() => import('@/components/ShareModal'), {
  loading: () => <div className="animate-pulse bg-black/20 h-96 w-80" />,
  ssr: false // Modal doesn't need SSR
});

// 2. CardShowcase - Below fold, decorative
const CardShowcase = dynamic(() => import('@/components/CardShowcase'), {
  loading: () => <div className="h-96 bg-cream animate-pulse" />,
  ssr: true // Keep for SEO
});

// 3. SeoContent - Below fold, text-heavy
const SeoContent = dynamic(() => import('@/components/SeoContent'), {
  ssr: true // Important for SEO
});

// 4. Advanced Filters Panel (when collapsed)
const AdvancedFilters = dynamic(() => import('./AdvancedFilters'), {
  ssr: false
});
```

### Bundle Analysis Setup

```bash
# Install analyzer
npm install @next/bundle-analyzer --save-dev

# Add to next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(withNextIntl(nextConfig));

# Run analysis
ANALYZE=true npm run build
```

### Heavy Dependencies to Review
- `html2canvas` (~200KB) - Only needed in ShareModal, lazy load
- `lucide-react` - Tree-shakeable, but import individually

---

## 5. Core Web Vitals Fixes

### LCP Optimization

**Problem**: Home page is 100% client-rendered

**Solution**: Split into Server + Client components

```tsx
// src/app/[locale]/page.tsx - SERVER COMPONENT
import { Suspense } from 'react';
import HomeHero from './HomeHero'; // Server
import FilterPanel from './FilterPanel'; // Client
import TeamGrid from './TeamGrid'; // Client

export default async function HomePage() {
  // Pre-fetch initial random team on server
  const initialTeam = await getRandomTeam(6);
  
  return (
    <main className="min-h-screen bg-cream p-4 md:p-8">
      {/* LCP: Server-rendered hero - visible immediately */}
      <HomeHero />
      
      {/* Interactive: Client components */}
      <Suspense fallback={<FilterSkeleton />}>
        <FilterPanel />
      </Suspense>
      
      <Suspense fallback={<TeamGridSkeleton />}>
        <TeamGrid initialTeam={initialTeam} />
      </Suspense>
    </main>
  );
}
```

### INP Optimization

**Problem**: `generateTeam()` blocks main thread

**Solution**: Use `startTransition` and Web Workers

```tsx
// Wrap state updates in transition
import { useTransition } from 'react';

const [isPending, startTransition] = useTransition();

const generateTeam = async () => {
  startTransition(async () => {
    setLoading(true);
    // ... fetch logic
    setTeam(pokemonData);
    setLoading(false);
  });
};

// Debounce search input
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback((value: string) => {
  handleSearchInput(value);
}, 150);
```

### CLS Optimization

**Problem**: Layout shifts when team loads

**Solution**: Reserve space with skeletons

```tsx
// Always render grid container with fixed dimensions
<div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 min-h-[600px]">
  {loading ? (
    // Skeleton cards with exact same dimensions
    Array.from({ length: filters.teamSize }).map((_, i) => (
      <div key={i} className="bg-white border-2 border-black h-[320px] md:h-[400px] animate-pulse" />
    ))
  ) : (
    team.map((pokemon) => <PokemonCard key={pokemon.id} pokemon={pokemon} />)
  )}
</div>

// For images - always specify dimensions
<div className="relative w-full h-28 md:h-48 bg-cream">
  <Image fill sizes="..." className="object-contain" />
</div>
```

---

## 6. Concrete Code Changes

### 6.1 Performance-Optimized Layout

```tsx
// src/app/[locale]/layout.tsx
import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import dynamic from 'next/dynamic';

// Fonts with optimal settings
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap", // Prevents FOIT
  preload: true,
  adjustFontFallback: true, // Reduces CLS
});

// Lazy load Footer (below fold)
const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: true,
});

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        {/* Preconnect to API for faster fetches */}
        <link rel="preconnect" href="https://pokeapi.co" />
        <link rel="dns-prefetch" href="https://pokeapi.co" />
        <link rel="preconnect" href="https://raw.githubusercontent.com" />
      </head>
      <body className={`${spaceGrotesk.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 6.2 Server + Client Component Split

```tsx
// src/app/[locale]/HomeServer.tsx - SERVER COMPONENT
import { getTranslations } from 'next-intl/server';

export default async function HomeHero() {
  const t = await getTranslations('home');
  
  return (
    <div className="mb-8 md:mb-12 text-center">
      {/* This renders on server - visible to Googlebot immediately */}
      <h1 className="font-grotesk font-bold text-3xl md:text-7xl text-black mb-4">
        {t('title')}
      </h1>
      <div className="inline-block bg-black px-6 py-3 slasher mb-8">
        <p className="font-mono text-sm font-semibold text-white">
          STATUS: READY
        </p>
      </div>
    </div>
  );
}

// src/app/[locale]/TeamGrid.tsx - CLIENT COMPONENT
'use client';

import { useState, useCallback, useTransition } from 'react';
import Image from 'next/image';

interface Props {
  initialTeam?: Pokemon[];
}

export default function TeamGrid({ initialTeam = [] }: Props) {
  const [team, setTeam] = useState<Pokemon[]>(initialTeam);
  const [isPending, startTransition] = useTransition();

  const regenerate = useCallback(() => {
    startTransition(async () => {
      // Fetch new team
    });
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 min-h-[600px]">
      {team.map((pokemon) => (
        <PokemonCard key={pokemon.id} pokemon={pokemon} />
      ))}
    </div>
  );
}
```

### 6.3 Optimized Image for LCP

```tsx
// src/components/PokemonCard.tsx
import Image from 'next/image';

// Shimmer placeholder for blur effect
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="0%" />
      <stop stop-color="#edeef1" offset="50%" />
      <stop stop-color="#f6f7f8" offset="100%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)" />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str);

interface Props {
  pokemon: Pokemon;
  priority?: boolean; // True for first 2-3 cards
}

export default function PokemonCard({ pokemon, priority = false }: Props) {
  return (
    <div className="bg-white border-4 border-black p-6">
      {/* Fixed dimensions prevent CLS */}
      <div className="relative w-full aspect-square bg-cream">
        <Image
          src={pokemon.sprites.other['official-artwork'].front_default}
          alt={`${pokemon.name} official artwork`}
          fill
          sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 280px"
          priority={priority} // True for above-fold cards
          placeholder="blur"
          blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(280, 280))}`}
          className="object-contain pixelated"
        />
      </div>
      {/* ... rest of card */}
    </div>
  );
}
```

### 6.4 Dynamic Import for ShareModal

```tsx
// src/app/[locale]/page.tsx or TeamGrid.tsx
import dynamic from 'next/dynamic';

// Lazy load ShareModal - it's heavy (html2canvas) and only needed on click
const ShareModal = dynamic(
  () => import('@/components/ShareModal'),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    ),
    ssr: false, // Modal doesn't need server rendering
  }
);

// Usage
export default function TeamGrid() {
  const [sharePokemon, setSharePokemon] = useState<Pokemon | null>(null);

  return (
    <>
      {/* Grid content */}
      
      {/* Modal only loads when sharePokemon is set */}
      {sharePokemon && (
        <ShareModal
          pokemon={sharePokemon}
          onClose={() => setSharePokemon(null)}
        />
      )}
    </>
  );
}
```

---

## 7. Actionable Checklist (Ordered by Impact)

### 🔴 HIGH IMPACT (Do First)

- [ ] **[HIGH] Split home page into Server + Client components**
  - Move hero, title, SEO content to server component
  - Keep filters and team grid as client components
  - Eliminates blank screen on initial load

- [x] **[HIGH] Add `priority` to first images** ✅ DONE
  - Pokedex: `priority={index < 8}` for first 8 images
  - Dramatically improves LCP

- [x] **[HIGH] Implement skeleton loading for team grid** ✅ DONE
  - Reserve space with exact card dimensions
  - Prevents CLS when team loads

- [x] **[HIGH] Dynamic import ShareModal** ✅ DONE
  - `html2canvas` is ~200KB - now loaded dynamically on click
  - ShareModal itself is dynamically imported

- [x] **[HIGH] Add preconnect hints for PokeAPI** ✅ DONE
  - `<link rel="preconnect" href="https://pokeapi.co" />`
  - `<link rel="preconnect" href="https://raw.githubusercontent.com" />`

### 🟡 MEDIUM IMPACT

- [x] **[MEDIUM] Debounce search input** (200ms) ✅ DONE
  - Reduces API calls and re-renders

- [ ] **[MEDIUM] Use `useTransition` for team generation**
  - Keeps UI responsive during heavy operations

- [x] **[MEDIUM] Fix CardShowcase `<img>` → `<Image>`** ✅ DONE
  - Changed from plain `<img>` tag to next/image

- [x] **[MEDIUM] Lazy load SeoContent and CardShowcase** ✅ DONE
  - Both now use next/dynamic

- [ ] **[MEDIUM] Add blur placeholder to all Pokemon images**
  - Shimmer effect while loading

- [ ] **[MEDIUM] Pre-fetch initial team on server**
  - Reduces time to first meaningful content

- [ ] **[MEDIUM] Install and run bundle analyzer**
  - Identify unexpected large dependencies

### 🟢 LOW IMPACT (Polish)

- [ ] **[LOW] Remove unused Pokemon from filter constants**
  - Reduces JS bundle size marginally

- [ ] **[LOW] Memoize filter display value functions**
  - `getFilterDisplayValue` recalculates on every render

- [ ] **[LOW] Add `loading="lazy"` to below-fold images**
  - Already handled by Next.js, but explicit is good

- [ ] **[LOW] Consider service worker for offline support**
  - Cache Pokemon data for repeat visits

- [ ] **[LOW] Implement virtual scrolling for Pokedex**
  - Only render visible cards (react-window)

---

## Quick Wins Checklist (5 minutes each)

```bash
# 1. Add preconnect (layout.tsx <head>)
<link rel="preconnect" href="https://pokeapi.co" crossOrigin="anonymous" />
<link rel="dns-prefetch" href="https://raw.githubusercontent.com" />

# 2. Add priority to first card in team grid
priority={index < 2}

# 3. Install debounce hook
npm install use-debounce

# 4. Add skeleton heights to grid container
className="min-h-[600px]"
```

---

## Estimated Improvements

| Metric | Current (Est.) | After Optimization |
|--------|----------------|-------------------|
| LCP | ~4.5s | < 2.0s |
| INP | ~400ms | < 150ms |
| CLS | ~0.3 | < 0.05 |
| TTI | ~6s | < 3s |
| Bundle Size | ~450KB | ~280KB |

---

*Generated for Random Pokemon Generator - Next.js 16*
*Last Updated: December 2024*
