import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Locale } from "@/i18n/routing";

interface RelatedPokemonProps {
  currentPokemonId: number;
  types: string[];
  locale: Locale;
}

// Get Pokemon by type for internal linking
async function getRelatedByType(type: string, currentId: number, limit: number = 8) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    const data = await response.json();
    
    const pokemon = data.pokemon
      .map((p: any) => {
        const id = parseInt(p.pokemon.url.split("/")[6]);
        return { id, name: p.pokemon.name };
      })
      .filter((p: any) => p.id <= 1025 && p.id !== currentId)
      .slice(0, limit);
    
    return pokemon;
  } catch (error) {
    console.error("Error fetching related Pokemon:", error);
    return [];
  }
}

/**
 * Related Pokemon Section - Server Component
 * Provides internal linking for SEO by showing Pokemon of the same type
 */
export default async function RelatedPokemon({ currentPokemonId, types, locale }: RelatedPokemonProps) {
  const t = await getTranslations("pokemon");
  
  // Get related Pokemon of the same primary type
  const primaryType = types[0];
  const related = await getRelatedByType(primaryType, currentPokemonId, 8);

  if (related.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 md:py-12 bg-white border-2 border-black slasher mt-8">
      <div className="mb-6">
        <div className="inline-block bg-black px-4 py-2 slasher mb-4">
          <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
            More {primaryType.toUpperCase()} Type Pokemon
          </h2>
        </div>
        <p className="font-mono text-sm text-black/70">
          Discover other {primaryType} type Pokemon for your team
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {related.map((pokemon: { id: number; name: string }, index: number) => (
          <Link
            key={pokemon.id}
            href={`/pokemon/${pokemon.name}`}
            className="group bg-cream border-2 border-black hover:bg-black hover:scale-105 transition-all duration-200 slasher overflow-hidden"
          >
            <div className="relative w-full aspect-square bg-white p-4">
              <Image
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                alt={pokemon.name}
                fill
                className="object-contain group-hover:scale-110 transition-transform duration-200"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading={index < 4 ? "eager" : "lazy"}
                unoptimized
              />
            </div>
            <div className="p-3 bg-cream group-hover:bg-marigold transition-colors">
              <p className="font-mono text-xs md:text-sm font-bold text-black uppercase text-center truncate">
                {pokemon.name}
              </p>
              <p className="font-mono text-xs text-black/50 text-center">
                #{String(pokemon.id).padStart(4, "0")}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Call-to-action for more exploration */}
      <div className="mt-8 text-center">
        <Link
          href="/pokedex"
          className="inline-block btn-slide bg-black text-white px-6 py-3 font-mono text-sm font-bold hover:bg-charcoal transition-colors border-2 border-black"
        >
          → View Full Pokedex
        </Link>
      </div>
    </section>
  );
}
