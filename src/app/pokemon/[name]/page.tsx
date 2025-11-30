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

interface PokemonSpecies {
  flavor_text_entries: FlavorTextEntry[];
  genera: Genera[];
  generation: {
    name: string;
  };
  habitat: {
    name: string;
  } | null;
}

export interface PokemonWithSpecies extends Pokemon {
  species: {
    flavorText: string;
    genus: string;
    generation: string;
    generationNumber: number;
    habitat: string | null;
  };
}

// ============ DATA FETCHING ============
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

      speciesData = { flavorText, genus, generation, generationNumber, habitat };
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
  
  // Truncate flavor text for meta description
  const flavorSnippet = pokemon.species.flavorText.length > 120
    ? pokemon.species.flavorText.substring(0, 117) + "..."
    : pokemon.species.flavorText;

  return {
    title: `${formattedName} (#${pokemon.id}) Stats, Evolution & Pokedex | Random Pokemon Generator`,
    description: `${formattedName} is a ${typesCapitalized}-type Pokemon. ${flavorSnippet}`,
    openGraph: {
      title: `${formattedName} (#${pokemon.id}) | Random Pokemon Generator`,
      description: `${formattedName} is a ${typesCapitalized}-type Pokemon. ${flavorSnippet}`,
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
