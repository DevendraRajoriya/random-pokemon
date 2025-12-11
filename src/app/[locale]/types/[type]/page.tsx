import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { locales, type Locale } from '@/i18n/routing';
import dynamic from 'next/dynamic';

const TypePageClient = dynamic(() => import('./TypePageClient'));

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const;

type Props = {
  params: Promise<{ locale: Locale; type: string }>;
};

// Generate static params for all type pages
export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    POKEMON_TYPES.map((type) => ({
      locale,
      type,
    }))
  );
}

// Fetch Pokemon by type from PokeAPI
async function getPokemonByType(type: string) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const pokemon = data.pokemon
      .map((p: any) => {
        const id = parseInt(p.pokemon.url.split('/')[6]);
        return { id, name: p.pokemon.name };
      })
      .filter((p: any) => p.id <= 1025)
      .sort((a: any, b: any) => a.id - b.id);
    
    return pokemon;
  } catch (error) {
    console.error('Error fetching type data:', error);
    return [];
  }
}

// Generate metadata for each type page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, locale } = await params;
  
  if (!POKEMON_TYPES.includes(type as any)) {
    return { title: 'Not Found' };
  }

  const t = await getTranslations({ locale, namespace: 'types' });
  const typeName = type.charAt(0).toUpperCase() + type.slice(1);
  const localizedType = t(type);
  
  const pokemon = await getPokemonByType(type);
  const count = pokemon.length;

  return {
    title: `All ${typeName} Type Pokemon | Complete List of ${count} ${typeName} Pokemon`,
    description: `Browse all ${count} ${typeName} type Pokemon with stats, abilities, and evolutions. Filter by ${typeName} type for team building, Nuzlocke runs, and competitive battles.`,
    keywords: [
      `${type} type pokemon`,
      `${type} pokemon list`,
      `all ${type} type pokemon`,
      `${type} pokemon database`,
      `best ${type} type pokemon`,
      `${type} pokemon team`,
      `${type} type pokemon weakness`,
      `gen 1-9 ${type} pokemon`,
    ],
    alternates: {
      canonical: locale === 'en' ? `/types/${type}` : `/${locale}/types/${type}`,
      languages: Object.fromEntries(
        locales.map(loc => [
          loc,
          loc === 'en' ? `/types/${type}` : `/${loc}/types/${type}`
        ])
      ),
    },
    openGraph: {
      title: `All ${typeName} Type Pokemon (${count} total)`,
      description: `Complete database of ${typeName} type Pokemon from all generations. Perfect for team building and type-based challenges.`,
      url: `https://www.randompokemon.co/types/${type}`,
      type: 'website',
    },
  };
}

export default async function TypePage({ params }: Props) {
  const { type, locale } = await params;
  setRequestLocale(locale);
  
  if (!POKEMON_TYPES.includes(type as any)) {
    notFound();
  }

  const pokemon = await getPokemonByType(type);
  
  return <TypePageClient type={type} pokemon={pokemon} locale={locale} />;
}
