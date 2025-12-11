import { Metadata } from 'next';
import Script from 'next/script';
import { pokemonList, TOTAL_POKEMON } from '@/data/pokemon';
import PokedexClient from './PokedexClient';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`@/messages/${locale}.json`)).default;
  const t = messages.metadata;
  const baseUrl = "https://www.randompokemon.co";

  return {
    title: t.pokedexTitle,
    description: t.pokedexDescription,
    keywords: [
      // Primary pokedex keywords
      "pokedex",
      "pokemon database",
      "all pokemon",
      "pokemon list",
      // Type keywords
      "pokemon types",
      "type chart",
      "pokemon type matchups",
      // Stats keywords
      "pokemon stats",
      "base stats",
      "pokemon abilities",
      // Dex keywords
      "complete pokedex",
      "national dex",
      "pokemon encyclopedia",
      // Generation keywords
      "gen 1 pokemon",
      "gen 9 pokemon",
      "scarlet violet pokedex",
      // Feature keywords
      "pokemon search",
      "pokemon finder",
      "pokemon lookup",
    ],
    openGraph: {
      title: t.pokedexTitle,
      description: t.pokedexDescription,
      url: locale === 'en' ? `${baseUrl}/pokedex` : `${baseUrl}/${locale}/pokedex`,
      type: "website",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Complete Pokédex Database - All 1025 Pokemon",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.pokedexTitle,
      description: t.pokedexDescription,
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: locale === 'en' ? "/pokedex" : `/${locale}/pokedex`,
      languages: {
        en: "/pokedex",
        ja: "/ja/pokedex",
        fr: "/fr/pokedex",
        de: "/de/pokedex",
        es: "/es/pokedex",
        pt: "/pt/pokedex",
        ko: "/ko/pokedex",
        "x-default": "/pokedex",
      },
    },
  };
}

// JSON-LD for Pokedex page
const pokedexJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Complete Pokédex Database",
  description: "Comprehensive Pokemon database with all 1025 Pokemon from Generation 1-9. Includes stats, types, abilities, evolutions, and official artwork.",
  url: "https://www.randompokemon.co/pokedex",
  keywords: ["Pokemon", "Pokedex", "Database", "Stats", "Types", "Abilities"],
  creator: {
    "@type": "Organization",
    name: "Random Pokemon Generator",
    url: "https://www.randompokemon.co",
  },
  includedInDataCatalog: {
    "@type": "DataCatalog",
    name: "Pokemon Data",
  },
  distribution: {
    "@type": "DataDownload",
    encodingFormat: "HTML",
    contentUrl: "https://www.randompokemon.co/pokedex",
  },
  variableMeasured: [
    "HP", "Attack", "Defense", "Special Attack", "Special Defense", "Speed"
  ],
};

export default async function PokedexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  return (
    <>
      <Script
        id="pokedex-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pokedexJsonLd) }}
      />
      <PokedexClient 
        initialPokemonList={pokemonList} 
        totalCount={TOTAL_POKEMON} 
      />
    </>
  );
}
