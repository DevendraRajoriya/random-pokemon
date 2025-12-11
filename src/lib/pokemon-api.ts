import { Locale } from '@/i18n/routing';

/**
 * Map our app locales to PokeAPI language codes
 * PokeAPI uses different codes than standard ISO codes
 */
export const pokeApiLanguageMap: Record<Locale, string> = {
  en: 'en',
  ja: 'ja',
  fr: 'fr',
  de: 'de',
  es: 'es',
  pt: 'pt', // PokeAPI uses 'pt' for Portuguese (Brazilian)
  ko: 'ko',
};

interface PokemonName {
  language: {
    name: string;
    url: string;
  };
  name: string;
}

interface PokemonGenus {
  genus: string;
  language: {
    name: string;
    url: string;
  };
}

interface FlavorTextEntry {
  flavor_text: string;
  language: {
    name: string;
    url: string;
  };
  version: {
    name: string;
    url: string;
  };
}

interface PokemonSpeciesResponse {
  id: number;
  name: string;
  names: PokemonName[];
  genera: PokemonGenus[];
  flavor_text_entries: FlavorTextEntry[];
  evolution_chain: {
    url: string;
  };
  generation: {
    name: string;
    url: string;
  };
  habitat: {
    name: string;
    url: string;
  } | null;
}

/**
 * Get the localized Pokemon name from species data
 */
export function getLocalizedName(
  names: PokemonName[],
  locale: Locale
): string | null {
  const langCode = pokeApiLanguageMap[locale];
  const localizedName = names.find((n) => n.language.name === langCode);
  return localizedName?.name || null;
}

/**
 * Get the localized Pokemon genus (category) from species data
 */
export function getLocalizedGenus(
  genera: PokemonGenus[],
  locale: Locale
): string | null {
  const langCode = pokeApiLanguageMap[locale];
  const localizedGenus = genera.find((g) => g.language.name === langCode);
  return localizedGenus?.genus || null;
}

/**
 * Get the localized flavor text (Pokedex entry) from species data
 * Prioritizes more recent game versions
 */
export function getLocalizedFlavorText(
  flavorTextEntries: FlavorTextEntry[],
  locale: Locale
): string | null {
  const langCode = pokeApiLanguageMap[locale];
  
  // Filter entries by language
  const localizedEntries = flavorTextEntries.filter(
    (entry) => entry.language.name === langCode
  );
  
  if (localizedEntries.length === 0) return null;
  
  // Prefer newer game versions (last entry is usually newest)
  const entry = localizedEntries[localizedEntries.length - 1];
  
  // Clean up the flavor text (remove line breaks and extra spaces)
  return entry.flavor_text
    .replace(/\f/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch Pokemon species data from PokeAPI
 */
export async function fetchPokemonSpecies(
  idOrName: number | string
): Promise<PokemonSpeciesResponse | null> {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${idOrName}`,
      { cache: 'force-cache' }
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch species for ${idOrName}: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching Pokemon species:`, error);
    return null;
  }
}

/**
 * Get all localized Pokemon data for a given Pokemon
 */
export async function getLocalizedPokemonData(
  idOrName: number | string,
  locale: Locale
): Promise<{
  name: string | null;
  genus: string | null;
  flavorText: string | null;
} | null> {
  const species = await fetchPokemonSpecies(idOrName);
  
  if (!species) return null;
  
  return {
    name: getLocalizedName(species.names, locale),
    genus: getLocalizedGenus(species.genera, locale),
    flavorText: getLocalizedFlavorText(species.flavor_text_entries, locale),
  };
}

/**
 * Format Pokemon name for display (capitalize, handle hyphens)
 */
export function formatPokemonName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format Pokemon ID with leading zeros
 */
export function formatPokemonId(id: number, digits: number = 4): string {
  return `#${String(id).padStart(digits, '0')}`;
}

/**
 * Get generation display name from PokeAPI generation name
 */
export function formatGeneration(generationName: string): string {
  // Convert "generation-i" to "Generation I"
  const match = generationName.match(/generation-(\w+)/);
  if (!match) return generationName;
  
  const romanNumeral = match[1].toUpperCase();
  return `Generation ${romanNumeral}`;
}

/**
 * Batch fetch localized names for multiple Pokemon
 * Useful for lists/grids where we need many names at once
 */
export async function batchGetLocalizedNames(
  ids: number[],
  locale: Locale
): Promise<Map<number, string>> {
  const nameMap = new Map<number, string>();
  
  // Fetch in parallel with a concurrency limit
  const batchSize = 10;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (id) => {
        const species = await fetchPokemonSpecies(id);
        if (species) {
          const localizedName = getLocalizedName(species.names, locale);
          return { id, name: localizedName || formatPokemonName(species.name) };
        }
        return { id, name: null };
      })
    );
    
    results.forEach(({ id, name }) => {
      if (name) nameMap.set(id, name);
    });
  }
  
  return nameMap;
}
