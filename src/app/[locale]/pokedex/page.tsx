import { Metadata } from 'next';
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

  return {
    title: t.pokedexTitle,
    description: t.pokedexDescription,
    keywords: [
      "pokedex",
      "pokemon database",
      "all pokemon",
      "pokemon list",
      "pokemon types",
      "pokemon stats",
      "complete pokedex",
      "national dex",
    ],
    openGraph: {
      title: t.pokedexTitle,
      description: t.pokedexDescription,
      url: locale === 'en' ? "https://www.randompokemon.co/pokedex" : `https://www.randompokemon.co/${locale}/pokedex`,
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
      },
    },
  };
}

export default async function PokedexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  return (
    <PokedexClient 
      initialPokemonList={pokemonList} 
      totalCount={TOTAL_POKEMON} 
    />
  );
}
