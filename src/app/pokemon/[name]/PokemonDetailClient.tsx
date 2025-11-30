"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Database, Share2, Zap } from "lucide-react";
import Image from "next/image";
import ShareModal from "@/components/ShareModal";
import { PokemonWithSpecies } from "./page";

interface Props {
  pokemon: PokemonWithSpecies;
}

const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

export default function PokemonDetailClient({ pokemon }: Props) {
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);

  const formatStatName = (name: string): string => {
    const statNames: Record<string, string> = {
      "hp": "HP",
      "attack": "ATK",
      "defense": "DEF",
      "special-attack": "SP.ATK",
      "special-defense": "SP.DEF",
      "speed": "SPEED",
    };
    return statNames[name] || name.toUpperCase();
  };

  const getStatBarColor = (value: number): string => {
    if (value >= 100) return "bg-marigold";
    if (value >= 80) return "bg-green-500";
    if (value >= 50) return "bg-indigo";
    return "bg-black";
  };

  // Format pokemon name for display
  const capitalizedName = pokemon.name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Calculate stats
  const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
  const highestStat = pokemon.stats.reduce((max, stat) => 
    stat.base_stat > max.base_stat ? stat : max
  , pokemon.stats[0]);
  
  // Determine battle role based on highest stat
  const getBattleRole = (statName: string): string => {
    const roles: Record<string, string> = {
      "hp": "bulk and endurance",
      "attack": "physical offense",
      "defense": "physical defense",
      "special-attack": "special offense",
      "special-defense": "special defense",
      "speed": "outspeeding opponents",
    };
    return roles[statName] || "versatile play";
  };

  // Get types display
  const typesDisplay = pokemon.types.map(t => 
    t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)
  ).join("/");

  // JSON-LD Structured Data
  const pokemonJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: capitalizedName,
    description: `${capitalizedName} is a ${typesDisplay}-type Pokemon. ${pokemon.species.flavorText}`,
    image: pokemon.sprites.other["official-artwork"].front_default,
    brand: { "@type": "Brand", name: "Pokemon" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "9.99",
      highPrice: "49.99",
      offerCount: "50+",
      availability: "https://schema.org/InStock",
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Pokemon ID", value: pokemon.id.toString() },
      { "@type": "PropertyValue", name: "Type", value: typesDisplay },
      { "@type": "PropertyValue", name: "Generation", value: pokemon.species.generation },
      { "@type": "PropertyValue", name: "Height", value: `${(pokemon.height / 10).toFixed(1)} m` },
      { "@type": "PropertyValue", name: "Weight", value: `${(pokemon.weight / 10).toFixed(1)} kg` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pokemonJsonLd) }}
      />
      <main className="min-h-screen bg-cream">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-12">
          
          {/* Top Navigation */}
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 bg-black text-white font-mono text-xs px-4 py-2 slasher hover:bg-charcoal transition-colors"
            >
              <ArrowLeft size={14} />
              BACK TO GENERATOR
            </button>
            
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 bg-sky-400 text-black font-mono text-xs font-bold px-4 py-2 slasher border-2 border-black hover:brightness-110 transition-all"
            >
              <Share2 size={14} />
              SHARE
            </button>
          </div>

          {/* Hero Header - Name Banner */}
          <div className="bg-heavy border-4 border-black slasher p-6 md:p-8 mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="font-sans font-bold text-4xl md:text-5xl lg:text-7xl text-black uppercase tracking-tighter">
                  {capitalizedName}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xl md:text-2xl text-black font-bold">
                  #{String(pokemon.id).padStart(4, "0")}
                </span>
                <div className="inline-block bg-marigold px-3 py-1 slasher border border-black">
                  <span className="font-mono text-xs font-bold text-black uppercase">
                    {pokemon.species.generation}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            
            {/* Left Column - Visuals */}
            <div className="space-y-4 md:space-y-6">
              
              {/* Artwork Box */}
              <div className="bg-white border-4 border-black slasher p-6 md:p-8">
                <div className="inline-block bg-black px-3 py-1 mb-4">
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    VISUAL DATA
                  </span>
                </div>
                <div className="relative w-full aspect-square bg-cream/50 flex items-center justify-center">
                  <Image
                    src={pokemon.sprites.other["official-artwork"].front_default}
                    alt={capitalizedName}
                    fill
                    className="object-contain p-4 mix-blend-multiply"
                    priority
                    unoptimized
                  />
                </div>
                
                {/* Type Badges */}
                <div className="flex gap-3 justify-center mt-6 flex-wrap">
                  {pokemon.types.map((typeInfo) => (
                    <span
                      key={typeInfo.type.name}
                      className="font-mono text-xs md:text-sm px-6 py-2 uppercase font-bold border-2 border-black"
                      style={{ 
                        backgroundColor: TYPE_COLORS[typeInfo.type.name] || '#888',
                        color: ['electric', 'normal', 'ground', 'fairy', 'ice'].includes(typeInfo.type.name) ? '#000' : '#fff'
                      }}
                    >
                      {typeInfo.type.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Physical Data Terminal */}
              <div className="bg-white border-4 border-black slasher p-6">
                <div className="inline-block bg-black px-3 py-1 mb-4">
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    PHYSICAL DATA
                  </span>
                </div>
                <div className="space-y-0">
                  <div className="flex justify-between items-center py-3 border-b-2 border-black/10">
                    <span className="font-mono text-sm text-charcoal uppercase">Height</span>
                    <span className="font-mono text-sm text-black font-bold">
                      {(pokemon.height / 10).toFixed(1)} m
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b-2 border-black/10">
                    <span className="font-mono text-sm text-charcoal uppercase">Weight</span>
                    <span className="font-mono text-sm text-black font-bold">
                      {(pokemon.weight / 10).toFixed(1)} kg
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b-2 border-black/10">
                    <span className="font-mono text-sm text-charcoal uppercase">Classification</span>
                    <span className="font-mono text-sm text-black font-bold">
                      {pokemon.species.genus}
                    </span>
                  </div>
                  {pokemon.species.habitat && (
                    <div className="flex justify-between items-center py-3">
                      <span className="font-mono text-sm text-charcoal uppercase">Habitat</span>
                      <span className="font-mono text-sm text-black font-bold uppercase">
                        {pokemon.species.habitat}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Abilities */}
              <div className="bg-white border-4 border-black slasher p-6">
                <div className="inline-block bg-black px-3 py-1 mb-4">
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    ABILITIES
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pokemon.abilities.map((abilityInfo, index) => (
                    <div
                      key={index}
                      className="bg-cream border-2 border-black px-4 py-2"
                    >
                      <span className="font-mono text-sm text-black uppercase font-semibold">
                        {abilityInfo.ability.name.replace(/-/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Data Terminal */}
            <div className="space-y-4 md:space-y-6">
              
              {/* Combat Statistics */}
              <div className="bg-white border-4 border-black slasher p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="inline-block bg-black px-3 py-1">
                    <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      COMBAT STATISTICS
                    </span>
                  </div>
                  <Zap className="text-marigold" size={20} fill="currentColor" />
                </div>
                
                <div className="space-y-4">
                  {pokemon.stats.map((stat) => (
                    <div key={stat.stat.name}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-xs font-bold text-black w-20">
                          {formatStatName(stat.stat.name)}
                        </span>
                        <span className="font-mono text-xs font-bold text-black">
                          {stat.base_stat}
                        </span>
                      </div>
                      {/* Chunky Stat Bar */}
                      <div className="w-full h-6 bg-black/10 border-2 border-black relative">
                        <div
                          className={`h-full ${getStatBarColor(stat.base_stat)} transition-all duration-500`}
                          style={{ width: `${Math.min((stat.base_stat / 255) * 100, 100)}%` }}
                        />
                        {/* Value inside bar for high stats */}
                        {stat.base_stat >= 80 && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-white">
                            {stat.base_stat}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Total Stats Row */}
                  <div className="pt-4 mt-4 border-t-4 border-black">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm font-bold text-black uppercase">
                        Total Base Stats
                      </span>
                      <span className="font-mono text-xl font-bold text-black">
                        {totalStats}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pokedex Entry */}
              <div className="bg-white border-4 border-black slasher p-6">
                <div className="inline-block bg-black px-3 py-1 mb-4">
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    POKEDEX ENTRY
                  </span>
                </div>
                {pokemon.species.flavorText ? (
                  <p className="font-mono text-sm text-charcoal leading-relaxed italic">
                    &ldquo;{pokemon.species.flavorText}&rdquo;
                  </p>
                ) : (
                  <p className="font-mono text-sm text-charcoal/50">
                    No entry available.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-4">
                <Link
                  href="/pokedex"
                  className="bg-purple-300 hover:brightness-110 text-black font-mono font-bold text-sm px-6 py-4 text-center border-4 border-black transition-all duration-200 slasher flex items-center justify-center gap-2"
                >
                  <Database size={18} />
                  EXPLORE POKEDEX
                </Link>
              </div>
            </div>
          </div>

          {/* SEO Content Section */}
          <article className="mt-8 md:mt-12 bg-white border-4 border-black slasher p-6 md:p-8">
            <div className="inline-block bg-black px-3 py-1 mb-6">
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                TRAINER INTEL
              </span>
            </div>
            
            <h2 className="font-sans font-bold text-2xl md:text-3xl mb-6 text-black uppercase">
              About {capitalizedName}
            </h2>
            
            <div className="space-y-4">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                Looking for details on <strong className="text-black">{capitalizedName}</strong>? 
                This <strong className="text-black">{typesDisplay}</strong>-type Pokemon was first introduced in{" "}
                <strong className="text-black">{pokemon.species.generation}</strong>.
                {pokemon.species.genus && (
                  <> It is known as the <strong className="text-black">{pokemon.species.genus}</strong>.</>
                )}
              </p>

              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                In terms of <strong className="text-black">battle strategy</strong>,{" "}
                {capitalizedName} has a total base stat of{" "}
                <strong className="text-black">{totalStats}</strong>. Its highest attribute is{" "}
                <strong className="text-black">
                  {formatStatName(highestStat.stat.name)} ({highestStat.base_stat})
                </strong>, making it a strong choice for trainers looking for{" "}
                <strong className="text-black">{getBattleRole(highestStat.stat.name)}</strong>.
              </p>

              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                Standing at <strong className="text-black">{(pokemon.height / 10).toFixed(1)} meters</strong> tall 
                and weighing <strong className="text-black">{(pokemon.weight / 10).toFixed(1)} kg</strong>,{" "}
                {capitalizedName} is a{" "}
                {pokemon.height < 10 ? "compact" : pokemon.height < 20 ? "medium-sized" : "large"} Pokemon
                {pokemon.species.habitat && (
                  <> typically found in <strong className="text-black">{pokemon.species.habitat}</strong> environments</>
                )}.
                {" "}Whether you&apos;re building a competitive team or completing your Pokédex,{" "}
                {capitalizedName} offers unique strengths worth considering.
              </p>
            </div>
          </article>
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          pokemon={pokemon}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
}
