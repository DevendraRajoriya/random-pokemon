import { Metadata } from 'next';
import { pokemonList, TOTAL_POKEMON } from '@/data/pokemon';
import PokedexClient from './PokedexClient';

export const metadata: Metadata = {
  title: "Pokédex - Complete Pokemon Database | All 1025 Pokemon",
  description:
    "Browse all 1025 Pokemon from Generation 1-9. Complete Pokedex with types, stats, abilities, and sprites. Search and filter the ultimate Pokemon database.",
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
    title: "Pokédex - Complete Pokemon Database | All 1025 Pokemon",
    description:
      "Browse all 1025 Pokemon from Generation 1-9. Complete Pokedex with types, stats, abilities, and sprites.",
    url: "https://www.randompokemon.co/pokedex",
  },
  alternates: {
    canonical: "/pokedex",
  },
};

export default function PokedexPage() {
  // Data is available at build/request time for SSR
  return (
    <PokedexClient 
      initialPokemonList={pokemonList} 
      totalCount={TOTAL_POKEMON} 
    />
  );
}
