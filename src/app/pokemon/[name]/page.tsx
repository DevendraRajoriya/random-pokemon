import { Metadata } from "next";
import { notFound } from "next/navigation";
import PokemonDetailClient from "./PokemonDetailClient";

// ============ TYPES ============
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

interface EvolutionChainLink {
  species: { name: string; url: string };
  evolves_to: EvolutionChainLink[];
}

interface EvolutionChain {
  chain: EvolutionChainLink;
}

interface PokemonSpecies {
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

export interface PokemonWithSpecies extends Pokemon {
  species: {
    flavorText: string;
    genus: string;
    generation: string;
    generationNumber: number;
    habitat: string | null;
    evolutionChain: string[]; // Array of Pokemon names in evolution chain
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

async function getPokemon(name: string): Promise<PokemonWithSpecies | null> {
  try {
    // Fetch Pokemon data and Species data in parallel
    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${name}`, { next: { revalidate: 86400 } }),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`, { next: { revalidate: 86400 } }),
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
    };

    if (speciesRes.ok) {
      const species: PokemonSpecies = await speciesRes.json();
      
      // Extract English flavor text (clean up newlines/form feeds)
      const englishFlavorEntry = species.flavor_text_entries.find(
        (entry) => entry.language.name === "en"
      );
      const flavorText = englishFlavorEntry
        ? englishFlavorEntry.flavor_text.replace(/[\n\f\r]/g, " ").replace(/\s+/g, " ").trim()
        : "";

      // Extract English genus (e.g., "Seed Pokemon")
      const englishGenus = species.genera.find(
        (g) => g.language.name === "en"
      );
      const genus = englishGenus ? englishGenus.genus : "Pokemon";

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

      // Fetch evolution chain
      let evolutionChain: string[] = [];
      if (species.evolution_chain?.url) {
        try {
          const evoRes = await fetch(species.evolution_chain.url, { next: { revalidate: 86400 } });
          if (evoRes.ok) {
            const evoData: EvolutionChain = await evoRes.json();
            evolutionChain = extractEvolutionChain(evoData.chain);
          }
        } catch {
          // Evolution chain fetch failed, continue without it
        }
      }

      speciesData = { flavorText, genus, generation, generationNumber, habitat, evolutionChain };
    }

    return {
      ...pokemon,
      species: speciesData,
    };
  } catch (error) {
    console.error("Error fetching Pokemon:", error);
    return null;
  }
}

// ============ METADATA ============
type Props = {
  params: Promise<{ name: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const pokemon = await getPokemon(name);

  if (!pokemon) {
    return {
      title: "Pokemon Not Found | Random Pokemon Generator",
      description: "The requested Pokemon could not be found.",
    };
  }

  const formattedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const types = pokemon.types.map((t) => t.type.name).join("/");
  const typesCapitalized = types.charAt(0).toUpperCase() + types.slice(1);
  const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
  
  // Create unique, compelling meta description
  const hasEvolutions = pokemon.species.evolutionChain.length > 1;
  const evolutionInfo = hasEvolutions 
    ? ` Part of the ${pokemon.species.evolutionChain[0].charAt(0).toUpperCase() + pokemon.species.evolutionChain[0].slice(1)} evolution line.`
    : "";
  
  const uniqueDescription = `${formattedName} (#${pokemon.id}) is a ${typesCapitalized}-type ${pokemon.species.genus} from ${pokemon.species.generation}. Base stats total: ${totalStats}. Height: ${(pokemon.height / 10).toFixed(1)}m, Weight: ${(pokemon.weight / 10).toFixed(1)}kg.${evolutionInfo}`;

  return {
    title: `${formattedName} (#${pokemon.id}) - Stats, Evolution & Type | Pokemon Database`,
    description: uniqueDescription,
    keywords: [
      formattedName.toLowerCase(),
      `${formattedName.toLowerCase()} stats`,
      `${formattedName.toLowerCase()} evolution`,
      `${formattedName.toLowerCase()} type`,
      ...pokemon.types.map(t => `${t.type.name} type pokemon`),
      pokemon.species.genus.toLowerCase(),
      pokemon.species.generation.toLowerCase(),
    ],
    alternates: {
      canonical: `/pokemon/${pokemon.name.toLowerCase()}`,
    },
    openGraph: {
      title: `${formattedName} (#${pokemon.id}) - ${typesCapitalized} Type | Pokemon Database`,
      description: uniqueDescription,
      url: `https://www.randompokemon.co/pokemon/${pokemon.name.toLowerCase()}`,
      images: [
        {
          url: pokemon.sprites.other["official-artwork"].front_default,
          width: 475,
          height: 475,
          alt: `${formattedName} official artwork - ${typesCapitalized} type Pokemon`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${formattedName} (#${pokemon.id}) | Pokemon Database`,
      description: uniqueDescription,
      images: [pokemon.sprites.other["official-artwork"].front_default],
    },
  };
}

// ============ PAGE COMPONENT ============
export default async function PokemonDetailPage({ params }: Props) {
  const { name } = await params;
  const pokemon = await getPokemon(name);

  if (!pokemon) {
    notFound();
  }

  return <PokemonDetailClient pokemon={pokemon} />;
}
