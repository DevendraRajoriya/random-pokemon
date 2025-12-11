import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { locales, type Locale } from '@/i18n/routing';
import dynamic from 'next/dynamic';

const GenerationPageClient = dynamic(() => import('./GenerationPageClient'));

const GENERATIONS = [
  { gen: '1', name: 'Kanto', range: [1, 151], games: 'Red, Blue, Yellow' },
  { gen: '2', name: 'Johto', range: [152, 251], games: 'Gold, Silver, Crystal' },
  { gen: '3', name: 'Hoenn', range: [252, 386], games: 'Ruby, Sapphire, Emerald' },
  { gen: '4', name: 'Sinnoh', range: [387, 493], games: 'Diamond, Pearl, Platinum' },
  { gen: '5', name: 'Unova', range: [494, 649], games: 'Black, White, Black 2, White 2' },
  { gen: '6', name: 'Kalos', range: [650, 721], games: 'X, Y' },
  { gen: '7', name: 'Alola', range: [722, 809], games: 'Sun, Moon, Ultra Sun, Ultra Moon' },
  { gen: '8', name: 'Galar', range: [810, 905], games: 'Sword, Shield' },
  { gen: '9', name: 'Paldea', range: [906, 1025], games: 'Scarlet, Violet' },
] as const;

type Props = {
  params: Promise<{ locale: Locale; gen: string }>;
};

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    GENERATIONS.map((g) => ({
      locale,
      gen: g.gen,
    }))
  );
}

async function getPokemonInRange(start: number, end: number) {
  const pokemon = [];
  for (let id = start; id <= end; id++) {
    pokemon.push({
      id,
      name: `pokemon-${id}` // Will be replaced with actual names from API if needed
    });
  }
  return pokemon;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gen, locale } = await params;
  
  const generation = GENERATIONS.find(g => g.gen === gen);
  if (!generation) {
    return { title: 'Not Found' };
  }

  const count = generation.range[1] - generation.range[0] + 1;
  const romanGen = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][parseInt(gen) - 1];

  return {
    title: `Generation ${gen} Pokemon (${generation.name}) | Complete Gen ${romanGen} Pokedex`,
    description: `Browse all ${count} Generation ${gen} Pokemon from ${generation.name}. Includes all Pokemon from ${generation.games}. Perfect for Gen ${gen} team building and nostalgic runs.`,
    keywords: [
      `generation ${gen} pokemon`,
      `gen ${gen} pokemon list`,
      `${generation.name} pokemon`,
      `pokemon ${generation.games}`,
      `gen ${romanGen} pokedex`,
      `all gen ${gen} pokemon`,
      `generation ${gen} starters`,
    ],
    alternates: {
      canonical: locale === 'en' ? `/generations/${gen}` : `/${locale}/generations/${gen}`,
      languages: Object.fromEntries(
        locales.map(loc => [
          loc,
          loc === 'en' ? `/generations/${gen}` : `/${loc}/generations/${gen}`
        ])
      ),
    },
    openGraph: {
      title: `Generation ${gen} Pokemon - ${generation.name} (${count} Pokemon)`,
      description: `Complete list of Generation ${gen} Pokemon from ${generation.games}.`,
      url: `https://www.randompokemon.co/generations/${gen}`,
      type: 'website',
    },
  };
}

export default async function GenerationPage({ params }: Props) {
  const { gen, locale } = await params;
  setRequestLocale(locale);
  
  const generation = GENERATIONS.find(g => g.gen === gen);
  if (!generation) {
    notFound();
  }

  const pokemon = await getPokemonInRange(generation.range[0], generation.range[1]);
  
  return (
    <GenerationPageClient 
      generation={generation} 
      pokemon={pokemon} 
      locale={locale} 
    />
  );
}
