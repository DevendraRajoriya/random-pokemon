import { MetadataRoute } from "next";

// Function to fetch all Pokemon names from PokeAPI
async function getAllPokemonNames(): Promise<string[]> {
  try {
    const response = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0"
    );
    const data = await response.json();
    return data.results.map((pokemon: { name: string }) => pokemon.name);
  } catch (error) {
    console.error("Error fetching Pokemon names for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://randompokemon.co";
  const pokemonNames = await getAllPokemonNames();

  // Homepage entry
  const homepage = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 1,
  };

  // Generate URLs for all 1,025 Pokemon
  const pokemonUrls = pokemonNames.map((name) => ({
    url: `${baseUrl}/pokemon/${name}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [homepage, ...pokemonUrls];
}
