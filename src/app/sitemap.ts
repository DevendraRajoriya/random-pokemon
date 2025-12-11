import { MetadataRoute } from "next";

const locales = ["en", "ja", "fr", "de", "es", "pt", "ko"];
const baseUrl = "https://www.randompokemon.co";

// Pokemon types for hub pages
const pokemonTypes = [
  "normal", "fire", "water", "electric", "grass", "ice", 
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy"
];

// Pokemon generations for hub pages
const generations = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

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
  const pokemonNames = await getAllPokemonNames();
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Homepage entries for all locales
  locales.forEach((locale) => {
    sitemapEntries.push({
      url: locale === "en" ? baseUrl : `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, l === "en" ? baseUrl : `${baseUrl}/${l}`])
        ),
      },
    });
  });

  // Pokédex entries for all locales
  locales.forEach((locale) => {
    sitemapEntries.push({
      url: locale === "en" ? `${baseUrl}/pokedex` : `${baseUrl}/${locale}/pokedex`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, l === "en" ? `${baseUrl}/pokedex` : `${baseUrl}/${l}/pokedex`])
        ),
      },
    });
  });

  // Type hub pages for all locales (18 types × 7 locales = 126 URLs)
  pokemonTypes.forEach((type) => {
    locales.forEach((locale) => {
      sitemapEntries.push({
        url: locale === "en" ? `${baseUrl}/types/${type}` : `${baseUrl}/${locale}/types/${type}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, l === "en" ? `${baseUrl}/types/${type}` : `${baseUrl}/${l}/types/${type}`])
          ),
        },
      });
    });
  });

  // Generation hub pages for all locales (9 generations × 7 locales = 63 URLs)
  generations.forEach((gen) => {
    locales.forEach((locale) => {
      sitemapEntries.push({
        url: locale === "en" ? `${baseUrl}/generations/${gen}` : `${baseUrl}/${locale}/generations/${gen}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, l === "en" ? `${baseUrl}/generations/${gen}` : `${baseUrl}/${l}/generations/${gen}`])
          ),
        },
      });
    });
  });

  // Pokemon detail pages for all locales (1025 Pokemon × 7 locales = 7,175 URLs)
  pokemonNames.forEach((name) => {
    locales.forEach((locale) => {
      sitemapEntries.push({
        url: locale === "en" ? `${baseUrl}/pokemon/${name}` : `${baseUrl}/${locale}/pokemon/${name}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, l === "en" ? `${baseUrl}/pokemon/${name}` : `${baseUrl}/${l}/pokemon/${name}`])
          ),
        },
      });
    });
  });

  return sitemapEntries;
}
