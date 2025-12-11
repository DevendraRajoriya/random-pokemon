// Static Pokemon data for SSR - prevents "Loading database..." on initial render
// This ensures Google and AI agents see the actual Pokemon count

import { POKEMON_NAMES, TOTAL_POKEMON_COUNT, getPokemonNameById } from './pokemon-names';

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
}

// Generate Pokemon list (1-1025) with complete data from pokemon-names.ts
// All 1025 Pokemon names are included for full SSG support
export const pokemonList: { name: string; url: string }[] = Array.from(
  { length: TOTAL_POKEMON_COUNT },
  (_, i) => ({
    name: getPokemonNameById(i + 1),
    url: `https://pokeapi.co/api/v2/pokemon/${i + 1}`,
  })
);

export const TOTAL_POKEMON = TOTAL_POKEMON_COUNT;

// Re-export for convenience
export { POKEMON_NAMES, getPokemonNameById } from './pokemon-names';
