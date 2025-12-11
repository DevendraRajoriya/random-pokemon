import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { locales, Locale, pokeApiLanguageMap } from "@/i18n/routing";
import PokemonDetailClient from "./PokemonDetailClient";
import { pokemonList, TOTAL_POKEMON } from "@/data/pokemon";

// ============ TYPES ============
// Raw API response types
interface PokemonType {
  type: {
    name: string;
  };
}

interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

interface PokemonAbility {
  ability: {
    name: string;
    localizedName?: string;
  };
}

interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
}

interface FlavorTextEntry {
  flavor_text: string;
  language: {
    name: string;
  };
  version: {
    name: string;
  };
}

interface Genera {
  genus: string;
  language: {
    name: string;
  };
}

interface NameEntry {
  name: string;
  language: {
    name: string;
  };
}

interface EvolutionChainLink {
  species: { name: string; url: string };
  evolves_to: EvolutionChainLink[];
}

interface EvolutionChain {
  chain: EvolutionChainLink;
}

interface PokemonSpecies {
  names: NameEntry[];
  flavor_text_entries: FlavorTextEntry[];
  genera: Genera[];
  generation: {
    name: string;
  };
  habitat: {
    name: string;
  } | null;
  evolution_chain: {
    url: string;
  };
}

// ============ SANITIZED DATA INTERFACE ============
// This is the "PokemonPageData" - only includes what we need for the page
// Keeping the payload small for optimal performance
export interface EvolutionMember {
  id: number;
  name: string;
  localizedName: string;
  image: string;
}

export interface SanitizedStat {
  name: string;
  value: number;
}

export interface PokemonPageData {
  id: number;
  name: string; // English name (for URLs)
  localizedName: string; // Localized name for display
  image: string; // Official artwork URL
  types: string[]; // Array of type names (English keys for translation lookup)
  height: number; // In meters
  weight: number; // In kg
  description: string; // Localized flavor text
  genus: string; // Localized classification (e.g., "Seed Pokémon")
  generation: string; // e.g., "Generation 1"
  generationNumber: number;
  habitat: string | null;
  stats: SanitizedStat[];
  totalStats: number;
  abilities: string[];
  evolutionChain: EvolutionMember[];
}

// Legacy export for backward compatibility
export interface PokemonWithSpecies extends Pokemon {
  localizedName: string;
  species: {
    flavorText: string;
    genus: string;
    generation: string;
    generationNumber: number;
    habitat: string | null;
    evolutionChain: string[];
    evolutionChainLocalized: { name: string; localizedName: string }[];
  };
}

// ============ DATA FETCHING ============
// Helper to extract all Pokemon names from evolution chain
function extractEvolutionChain(chain: EvolutionChainLink): string[] {
  const names: string[] = [chain.species.name];
  for (const evolution of chain.evolves_to) {
    names.push(...extractEvolutionChain(evolution));
  }
  return names;
}

// Fetch localized name for a Pokemon ability
async function getLocalizedAbilityName(abilityName: string, locale: Locale): Promise<string> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/ability/${abilityName}`, { 
      cache: 'force-cache',
      next: { revalidate: 86400 } 
    });
    if (!res.ok) return abilityName.replace(/-/g, ' ');
    
    const ability = await res.json();
    const pokeApiLang = pokeApiLanguageMap[locale];
    
    // Find the localized name
    const localizedEntry = ability.names?.find((n: { language: { name: string }, name: string }) => n.language.name === pokeApiLang);
    if (localizedEntry) return localizedEntry.name;
    
    // Fallback to English
    const englishEntry = ability.names?.find((n: { language: { name: string }, name: string }) => n.language.name === 'en');
    if (englishEntry) return englishEntry.name;
    
    // Final fallback: format the ability name
    return abilityName.replace(/-/g, ' ');
  } catch {
    return abilityName.replace(/-/g, ' ');
  }
}

// Fetch localized name for a Pokemon species
async function getLocalizedPokemonName(speciesName: string, locale: Locale): Promise<string> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${speciesName}`, { 
      cache: 'force-cache',
      next: { revalidate: 86400 } 
    });
    if (!res.ok) return speciesName.charAt(0).toUpperCase() + speciesName.slice(1);
    
    const species: PokemonSpecies = await res.json();
    const pokeApiLang = pokeApiLanguageMap[locale];
    
    // Find the localized name
    const localizedEntry = species.names.find(n => n.language.name === pokeApiLang);
    if (localizedEntry) return localizedEntry.name;
    
    // Fallback to English
    const englishEntry = species.names.find(n => n.language.name === 'en');
    if (englishEntry) return englishEntry.name;
    
    // Final fallback: capitalize the species name
    return speciesName.charAt(0).toUpperCase() + speciesName.slice(1);
  } catch {
    return speciesName.charAt(0).toUpperCase() + speciesName.slice(1);
  }
}

async function getPokemon(name: string, locale: Locale): Promise<PokemonWithSpecies | null> {
  try {
    const pokeApiLang = pokeApiLanguageMap[locale];
    
    // Fetch Pokemon data and Species data in parallel
    // Using cache: 'force-cache' prevents API rate limiting during rebuilds
    // Next.js will use disk cache instead of hitting PokeAPI 5000+ times
    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${name}`, { cache: 'force-cache', next: { revalidate: 86400 } }),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`, { cache: 'force-cache', next: { revalidate: 86400 } }),
    ]);

    if (!pokemonRes.ok) return null;

    const pokemon: Pokemon = await pokemonRes.json();
    
    // Default species data if species fetch fails
    let speciesData = {
      flavorText: "",
      genus: "Pokemon",
      generation: "Generation 1",
      generationNumber: 1,
      habitat: null as string | null,
      evolutionChain: [] as string[],
      evolutionChainLocalized: [] as { name: string; localizedName: string }[],
    };
    
    let localizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    if (speciesRes.ok) {
      const species: PokemonSpecies = await speciesRes.json();
      
      // Get localized Pokemon name
      const localizedNameEntry = species.names.find(n => n.language.name === pokeApiLang);
      if (localizedNameEntry) {
        localizedName = localizedNameEntry.name;
      } else {
        // Fallback to English name
        const englishNameEntry = species.names.find(n => n.language.name === 'en');
        if (englishNameEntry) localizedName = englishNameEntry.name;
      }
      
      // Extract localized flavor text (clean up newlines/form feeds)
      const localizedFlavorEntry = species.flavor_text_entries.find(
        (entry) => entry.language.name === pokeApiLang
      );
      // Fallback to English if localized not found
      const englishFlavorEntry = species.flavor_text_entries.find(
        (entry) => entry.language.name === "en"
      );
      const flavorEntry = localizedFlavorEntry || englishFlavorEntry;
      const flavorText = flavorEntry
        ? flavorEntry.flavor_text.replace(/[\n\f\r]/g, " ").replace(/\s+/g, " ").trim()
        : "";

      // Extract localized genus (e.g., "Seed Pokemon")
      const localizedGenus = species.genera.find(
        (g) => g.language.name === pokeApiLang
      );
      const englishGenus = species.genera.find(
        (g) => g.language.name === "en"
      );
      const genus = localizedGenus?.genus || englishGenus?.genus || "Pokemon";

      // Parse generation (e.g., "generation-vi" -> "Generation 6")
      const genMatch = species.generation.name.match(/generation-(\w+)/);
      const romanToNum: Record<string, number> = {
        i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9,
      };
      const genNumeral = genMatch ? genMatch[1] : "i";
      const generationNumber = romanToNum[genNumeral] || 1;
      const generation = `Generation ${generationNumber}`;

      // Extract habitat
      const habitat = species.habitat ? species.habitat.name : null;

      // Fetch evolution chain with localized names
      let evolutionChain: string[] = [];
      let evolutionChainLocalized: { name: string; localizedName: string }[] = [];
      
      if (species.evolution_chain?.url) {
        try {
          const evoRes = await fetch(species.evolution_chain.url, { cache: 'force-cache', next: { revalidate: 86400 } });
          if (evoRes.ok) {
            const evoData: EvolutionChain = await evoRes.json();
            evolutionChain = extractEvolutionChain(evoData.chain);
            
            // Fetch localized names for all evolution chain members
            evolutionChainLocalized = await Promise.all(
              evolutionChain.map(async (evoName) => ({
                name: evoName,
                localizedName: await getLocalizedPokemonName(evoName, locale),
              }))
            );
          }
        } catch {
          // Evolution chain fetch failed, continue without it
        }
      }

      speciesData = { 
        flavorText, 
        genus, 
        generation, 
        generationNumber, 
        habitat, 
        evolutionChain,
        evolutionChainLocalized,
      };
    }

    // Fetch localized ability names
    const abilitiesWithLocalizedNames = await Promise.all(
      pokemon.abilities.map(async (abilityInfo) => ({
        ability: {
          name: abilityInfo.ability.name,
          localizedName: await getLocalizedAbilityName(abilityInfo.ability.name, locale),
        },
      }))
    );

    return {
      ...pokemon,
      abilities: abilitiesWithLocalizedNames,
      localizedName,
      species: speciesData,
    };
  } catch (error) {
    console.error("Error fetching Pokemon:", error);
    return null;
  }
}

// ============ METADATA ============
type Props = {
  params: Promise<{ name: string; locale: Locale }>;
};

// ============ STATIC SITE GENERATION ============
// Generate static params for ALL 1025 Pokémon across all locales
// This is the "Library Architecture" pattern - pre-build everything for instant loads
export async function generateStaticParams() {
  const params: { locale: string; name: string }[] = [];
  
  // Generate params for all locale + pokemon combinations (1025 × number of locales)
  for (const locale of locales) {
    for (const pokemon of pokemonList) {
      params.push({ locale, name: pokemon.name });
    }
  }

  console.log(`[SSG] Generating ${params.length} static pages (${TOTAL_POKEMON} Pokémon × ${locales.length} locales)`);
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name, locale } = await params;
  const pokemon = await getPokemon(name, locale);
  const t = await getTranslations({ locale, namespace: 'pokemon' });
  const tTypes = await getTranslations({ locale, namespace: 'types' });
  const tMeta = await getTranslations({ locale, namespace: 'metadata' });

  if (!pokemon) {
    return {
      title: "Pokemon Not Found | Random Pokemon Generator",
      description: "The requested Pokemon could not be found.",
    };
  }

  // Use localized name for display
  const displayName = pokemon.localizedName;
  
  // Get localized types
  const typeKeys = pokemon.types.map((t) => t.type.name);
  const localizedTypes = typeKeys.map(typeKey => {
    try {
      return tTypes(typeKey as any);
    } catch {
      return typeKey.charAt(0).toUpperCase() + typeKey.slice(1);
    }
  });
  const typesDisplay = localizedTypes.join("/");
  
  const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
  
  // Create unique, compelling meta description using localized content
  const hasEvolutions = pokemon.species.evolutionChain.length > 1;
  const evolutionInfo = hasEvolutions && pokemon.species.evolutionChainLocalized.length > 0
    ? ` ${pokemon.species.evolutionChainLocalized[0].localizedName}`
    : "";
  
  const uniqueDescription = `${displayName} (#${pokemon.id}) - ${typesDisplay} | ${pokemon.species.genus} | ${pokemon.species.generation}. ${t('totalBaseStats')}: ${totalStats}. ${t('height')}: ${(pokemon.height / 10).toFixed(1)}m, ${t('weight')}: ${(pokemon.weight / 10).toFixed(1)}kg.${evolutionInfo ? ` ${t('evolutionChain')}: ${evolutionInfo}` : ""}`;

  // Generate hreflang alternates for all locales
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    const prefix = loc === 'en' ? '' : `/${loc}`;
    languages[loc] = `https://www.randompokemon.co${prefix}/pokemon/${pokemon.name.toLowerCase()}`;
  }
  // Add x-default pointing to English version
  languages['x-default'] = `https://www.randompokemon.co/pokemon/${pokemon.name.toLowerCase()}`;

  return {
    title: `${displayName} (#${pokemon.id}) - ${typesDisplay} | Pokemon Database`,
    description: uniqueDescription,
    keywords: [
      displayName.toLowerCase(),
      `${displayName.toLowerCase()} stats`,
      `${displayName.toLowerCase()} evolution`,
      `${displayName.toLowerCase()} type`,
      ...localizedTypes.map(type => type.toLowerCase()),
      pokemon.species.genus.toLowerCase(),
      pokemon.species.generation.toLowerCase(),
    ],
    alternates: {
      canonical: locale === 'en' 
        ? `/pokemon/${pokemon.name.toLowerCase()}`
        : `/${locale}/pokemon/${pokemon.name.toLowerCase()}`,
      languages,
    },
    openGraph: {
      title: `${displayName} (#${pokemon.id}) - ${typesDisplay} | Pokemon Database`,
      description: uniqueDescription,
      url: `https://www.randompokemon.co/pokemon/${pokemon.name.toLowerCase()}`,
      images: [
        {
          url: pokemon.sprites.other["official-artwork"].front_default,
          width: 475,
          height: 475,
          alt: `${displayName} - ${typesDisplay}`,
        },
      ],
      locale: locale,
      alternateLocale: locales.filter(l => l !== locale),
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} (#${pokemon.id}) | Pokemon Database`,
      description: uniqueDescription,
      images: [pokemon.sprites.other["official-artwork"].front_default],
    },
  };
}

// ============ PAGE COMPONENT ============
export default async function PokemonDetailPage({ params }: Props) {
  const { name, locale } = await params;
  const pokemon = await getPokemon(name, locale);

  if (!pokemon) {
    notFound();
  }

  // Lazy load RelatedPokemon component
  const RelatedPokemon = (await import("./RelatedPokemon")).default;

  return (
    <>
      <PokemonDetailClient pokemon={pokemon} locale={locale} />
      
      {/* Internal linking section for SEO */}
      <RelatedPokemon 
        currentPokemonId={pokemon.id} 
        types={pokemon.types.map(t => t.type.name)} 
        locale={locale} 
      />
    </>
  );
}
