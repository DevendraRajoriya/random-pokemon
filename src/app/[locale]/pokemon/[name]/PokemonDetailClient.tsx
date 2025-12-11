"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Database, Share2, Zap, Shuffle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Script from "next/script";
import ShareModal from "@/components/ShareModal";
import { PokemonWithSpecies } from "./page";
import { pokemonList, TOTAL_POKEMON } from "@/data/pokemon";
import { Locale } from "@/i18n/routing";

interface Props {
  pokemon: PokemonWithSpecies;
  locale: Locale;
}

// Type gradient colors for beautiful badges
const TYPE_GRADIENTS: Record<string, { from: string; to: string; text: string }> = {
  normal: { from: "#A8A878", to: "#C6C6A7", text: "#000" },
  fire: { from: "#F08030", to: "#F5AC78", text: "#fff" },
  water: { from: "#6890F0", to: "#9DB7F5", text: "#fff" },
  electric: { from: "#F8D030", to: "#FAE078", text: "#000" },
  grass: { from: "#78C850", to: "#A7DB8D", text: "#000" },
  ice: { from: "#98D8D8", to: "#BCE6E6", text: "#000" },
  fighting: { from: "#C03028", to: "#D67873", text: "#fff" },
  poison: { from: "#A040A0", to: "#C183C1", text: "#fff" },
  ground: { from: "#E0C068", to: "#EBD69D", text: "#000" },
  flying: { from: "#A890F0", to: "#C6B7F5", text: "#000" },
  psychic: { from: "#F85888", to: "#FA92B2", text: "#fff" },
  bug: { from: "#A8B820", to: "#C6D16E", text: "#000" },
  rock: { from: "#B8A038", to: "#D1C17D", text: "#000" },
  ghost: { from: "#705898", to: "#A292BC", text: "#fff" },
  dragon: { from: "#7038F8", to: "#A27DFA", text: "#fff" },
  dark: { from: "#705848", to: "#A29288", text: "#fff" },
  steel: { from: "#B8B8D0", to: "#D1D1E0", text: "#000" },
  fairy: { from: "#EE99AC", to: "#F4BDC9", text: "#000" },
};

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

export default function PokemonDetailClient({ pokemon, locale }: Props) {
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const t = useTranslations('pokemon');
  const tStats = useTranslations('stats');
  const tTypes = useTranslations('types');
  const tCommon = useTranslations('common');
  const tSeo = useTranslations('seo');

  // ============ RANDOM GENERATION (Client-Side Only - No API Calls!) ============
  // This is the key to the "Library Architecture" pattern
  // All 1025 pages are pre-built, so we just calculate a random ID and navigate
  const generateRandomPokemon = useCallback(() => {
    setIsNavigating(true);
    
    // Generate random ID (1-1025) - Pure client-side, no API call
    const randomId = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
    const randomPokemon = pokemonList[randomId - 1];
    
    // Navigate to the pre-built static page
    router.push(`/pokemon/${randomPokemon.name}`);
    
    // Reset loading state after navigation completes
    setTimeout(() => setIsNavigating(false), 500);
  }, [router]);

  const formatStatName = (name: string): string => {
    const statNames: Record<string, string> = {
      "hp": tStats('hp'),
      "attack": tStats('attack'),
      "defense": tStats('defense'),
      "special-attack": tStats('specialAttack'),
      "special-defense": tStats('specialDefense'),
      "speed": tStats('speed'),
    };
    return statNames[name] || name.toUpperCase();
  };

  const getStatBarColor = (value: number): string => {
    if (value >= 100) return "bg-marigold";
    if (value >= 80) return "bg-green-500";
    if (value >= 50) return "bg-indigo";
    return "bg-black";
  };

  // Format pokemon name for display - use localized name if available
  const capitalizedName = pokemon.localizedName || pokemon.name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Helper to get translated type name
  const getTranslatedType = (typeName: string): string => {
    try {
      return tTypes(typeName as any);
    } catch {
      return typeName.charAt(0).toUpperCase() + typeName.slice(1);
    }
  };
  
  // Calculate stats
  const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
  const highestStat = pokemon.stats.reduce((max, stat) => 
    stat.base_stat > max.base_stat ? stat : max
  , pokemon.stats[0]);
  
  // Determine battle role based on highest stat (translated)
  const tRoles = useTranslations("battleRoles");
  const getBattleRole = (statName: string): string => {
    try {
      return tRoles(statName as any);
    } catch {
      return tRoles("versatile");
    }
  };

  // Get types display (translated)
  const typesDisplay = pokemon.types.map(t => getTranslatedType(t.type.name)).join("/");

  // Get evolution chain with localized names
  const evolutionChain = pokemon.species.evolutionChain || [];
  const evolutionChainLocalized = pokemon.species.evolutionChainLocalized || [];
  const otherEvolutions = evolutionChain.filter(name => name.toLowerCase() !== pokemon.name.toLowerCase());
  const currentEvoIndex = evolutionChain.findIndex(name => name.toLowerCase() === pokemon.name.toLowerCase());
  
  // Helper to get localized evolution name
  const getLocalizedEvoName = (englishName: string): string => {
    const entry = evolutionChainLocalized.find(e => e.name.toLowerCase() === englishName.toLowerCase());
    return entry?.localizedName || englishName.charAt(0).toUpperCase() + englishName.slice(1);
  };

  // JSON-LD Structured Data - Improved for rich snippets
  const pokemonJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Thing",
      "@id": `https://www.randompokemon.co/pokemon/${pokemon.name.toLowerCase()}`,
      name: capitalizedName,
      alternateName: `Pokemon #${pokemon.id}`,
      description: `${capitalizedName} is a ${typesDisplay}-type ${pokemon.species.genus} from ${pokemon.species.generation}. ${pokemon.species.flavorText}`,
      image: {
        "@type": "ImageObject",
        url: pokemon.sprites.other["official-artwork"].front_default,
        caption: `${capitalizedName} official artwork - ${typesDisplay} type Pokemon`,
      },
      identifier: pokemon.id.toString(),
      additionalProperty: [
        { "@type": "PropertyValue", name: "National Dex Number", value: pokemon.id.toString() },
        { "@type": "PropertyValue", name: "Type", value: typesDisplay },
        { "@type": "PropertyValue", name: "Generation", value: pokemon.species.generation },
        { "@type": "PropertyValue", name: "Classification", value: pokemon.species.genus },
        { "@type": "PropertyValue", name: "Height", value: `${(pokemon.height / 10).toFixed(1)} m` },
        { "@type": "PropertyValue", name: "Weight", value: `${(pokemon.weight / 10).toFixed(1)} kg` },
        { "@type": "PropertyValue", name: "Total Base Stats", value: totalStats.toString() },
        ...pokemon.stats.map(stat => ({
          "@type": "PropertyValue",
          name: formatStatName(stat.stat.name),
          value: stat.base_stat.toString(),
        })),
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `What type is ${capitalizedName}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${capitalizedName} is a ${typesDisplay}-type Pokemon introduced in ${pokemon.species.generation}.`,
          },
        },
        {
          "@type": "Question",
          name: `What are ${capitalizedName}'s base stats?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${capitalizedName} has a total base stat of ${totalStats}. Its highest stat is ${formatStatName(highestStat.stat.name)} at ${highestStat.base_stat}, making it strong for ${getBattleRole(highestStat.stat.name)}.`,
          },
        },
        ...(evolutionChain.length > 1 ? [{
          "@type": "Question",
          name: `What is ${capitalizedName}'s evolution chain?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${capitalizedName} is part of the ${evolutionChainLocalized.map(e => e.localizedName).join(" → ")} evolution line.`,
          },
        }] : []),
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.randompokemon.co",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Pokédex",
          item: "https://www.randompokemon.co/pokedex",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: capitalizedName,
          item: `https://www.randompokemon.co/pokemon/${pokemon.name.toLowerCase()}`,
        },
      ],
    },
  ];

  return (
    <>
      <Script
        id="pokemon-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pokemonJsonLd) }}
      />
      <main className="min-h-screen bg-cream">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-12">
          
          {/* Top Navigation */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6 md:mb-8">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 bg-black text-white font-mono text-xs px-4 py-2 slasher hover:bg-charcoal transition-colors"
            >
              <ArrowLeft size={14} />
              {tCommon('back').toUpperCase()}
            </button>
            
            {/* Generate Another Random Pokémon - The Key Feature! */}
            <button
              onClick={generateRandomPokemon}
              disabled={isNavigating}
              className="flex items-center gap-2 bg-[#4ADE80] hover:bg-[#22c55e] text-black font-mono text-xs font-bold px-5 py-2.5 slasher border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isNavigating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t('loading')}
                </>
              ) : (
                <>
                  <Shuffle size={16} />
                  {t('randomPokemon')}
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 bg-sky-400 text-black font-mono text-xs font-bold px-4 py-2 slasher border-2 border-black hover:brightness-110 transition-all"
            >
              <Share2 size={14} />
              {t('share')}
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
                    {t('generationLabel', { num: pokemon.species.generationNumber })}
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
                    {t('visualData')}
                  </span>
                </div>
                <div className="relative w-full aspect-square bg-cream/50 flex items-center justify-center">
                  <Image
                    src={pokemon.sprites.other["official-artwork"].front_default}
                    alt={`${capitalizedName} official artwork - ${typesDisplay} type Pokemon from ${pokemon.species.generation}`}
                    fill
                    sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 40vw"
                    className="object-contain p-4 mix-blend-multiply"
                    priority
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
                      {getTranslatedType(typeInfo.type.name)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Physical Data Terminal */}
              <div className="bg-white border-4 border-black slasher p-6">
                <div className="inline-block bg-black px-3 py-1 mb-4">
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    {t('physicalData')}
                  </span>
                </div>
                <div className="space-y-0">
                  <div className="flex justify-between items-center py-3 border-b-2 border-black/10">
                    <span className="font-mono text-sm text-charcoal uppercase">{t('height')}</span>
                    <span className="font-mono text-sm text-black font-bold">
                      {(pokemon.height / 10).toFixed(1)} m
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b-2 border-black/10">
                    <span className="font-mono text-sm text-charcoal uppercase">{t('weight')}</span>
                    <span className="font-mono text-sm text-black font-bold">
                      {(pokemon.weight / 10).toFixed(1)} kg
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b-2 border-black/10">
                    <span className="font-mono text-sm text-charcoal uppercase">{t('classification')}</span>
                    <span className="font-mono text-sm text-black font-bold">
                      {pokemon.species.genus}
                    </span>
                  </div>
                  {pokemon.species.habitat && (
                    <div className="flex justify-between items-center py-3">
                      <span className="font-mono text-sm text-charcoal uppercase">{t('habitat')}</span>
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
                    {t('abilities')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pokemon.abilities.map((abilityInfo, index) => (
                    <div
                      key={index}
                      className="bg-cream border-2 border-black px-4 py-2"
                    >
                      <span className="font-mono text-sm text-black uppercase font-semibold">
                        {abilityInfo.ability.localizedName || abilityInfo.ability.name.replace(/-/g, " ")}
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
                      {t('combatStatistics')}
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
                        {t('totalBaseStats')}
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
                    {t('pokedexEntry')}
                  </span>
                </div>
                {pokemon.species.flavorText ? (
                  <p className="font-mono text-sm text-charcoal leading-relaxed italic">
                    &ldquo;{pokemon.species.flavorText}&rdquo;
                  </p>
                ) : (
                  <p className="font-mono text-sm text-charcoal/50">
                    {t('noEntry')}
                  </p>
                )}
              </div>

              {/* Action Buttons - Primary CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Generate Another Random - THE MAIN CTA */}
                <button
                  onClick={generateRandomPokemon}
                  disabled={isNavigating}
                  className="bg-[#4ADE80] hover:bg-[#22c55e] text-black font-mono font-bold text-sm px-6 py-4 text-center border-4 border-black transition-all duration-200 slasher flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_#000]"
                >
                  {isNavigating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {t('generating')}
                    </>
                  ) : (
                    <>
                      <Zap size={18} className="text-yellow-400 fill-yellow-400" />
                      {t('generateAnother')}
                    </>
                  )}
                </button>
                
                <Link
                  href="/pokedex"
                  className="bg-purple-300 hover:brightness-110 text-black font-mono font-bold text-sm px-6 py-4 text-center border-4 border-black transition-all duration-200 slasher flex items-center justify-center gap-2"
                >
                  <Database size={18} />
                  {t('explorePokedex')}
                </Link>
              </div>

              {/* Evolution Chain - Internal Linking */}
              {evolutionChain.length > 1 && (
                <div className="bg-white border-4 border-black slasher p-6">
                  <div className="inline-block bg-black px-3 py-1 mb-4">
                    <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      {t('evolutionChain')}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {evolutionChain.map((evoName, index) => {
                      const isCurrentPokemon = evoName.toLowerCase() === pokemon.name.toLowerCase();
                      // Use localized name for display
                      const displayName = getLocalizedEvoName(evoName);
                      
                      return (
                        <div key={evoName} className="flex items-center gap-2">
                          {index > 0 && (
                            <span className="font-mono text-xl text-charcoal">→</span>
                          )}
                          {isCurrentPokemon ? (
                            <span className="bg-marigold text-black font-mono text-sm font-bold px-4 py-2 border-2 border-black">
                              {displayName}
                            </span>
                          ) : (
                            <Link
                              href={`/pokemon/${evoName.toLowerCase()}`}
                              className="bg-cream hover:bg-marigold text-black font-mono text-sm font-bold px-4 py-2 border-2 border-black transition-colors"
                            >
                              {displayName}
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {currentEvoIndex >= 0 && (
                    <p className="font-mono text-xs text-charcoal text-center mt-3">
                      {currentEvoIndex === 0 && evolutionChain.length > 1 && t('baseForm')}
                      {currentEvoIndex > 0 && currentEvoIndex < evolutionChain.length - 1 && t('middleEvolution')}
                      {currentEvoIndex === evolutionChain.length - 1 && evolutionChain.length > 1 && t('finalEvolution')}
                    </p>
                  )}
                </div>
              )}

              {/* Related Types - Internal Linking */}
              <div className="bg-white border-4 border-black slasher p-6">
                <div className="inline-block bg-black px-3 py-1 mb-4">
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    {t('exploreByType')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pokemon.types.map((typeInfo) => {
                    const translatedType = getTranslatedType(typeInfo.type.name);
                    return (
                      <Link
                        key={typeInfo.type.name}
                        href={`/pokedex?type=${typeInfo.type.name}`}
                        className="font-mono text-xs px-4 py-2 uppercase font-bold border-2 border-black hover:brightness-110 transition-all"
                        style={{ 
                          backgroundColor: TYPE_COLORS[typeInfo.type.name] || '#888',
                          color: ['electric', 'normal', 'ground', 'fairy', 'ice'].includes(typeInfo.type.name) ? '#000' : '#fff'
                        }}
                      >
                        {t('allTypesPokemon', { type: translatedType })}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SEO Content Section */}
          <article className="mt-8 md:mt-12 bg-white border-4 border-black slasher p-6 md:p-8">
            <div className="inline-block bg-black px-3 py-1 mb-6">
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                {t('trainerIntel')}
              </span>
            </div>
            
            <h2 className="font-sans font-bold text-2xl md:text-3xl mb-6 text-black uppercase">
              {t('about', { name: capitalizedName })}
            </h2>
            
            <div className="space-y-4">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                {tSeo('lookingFor', { name: capitalizedName })}{" "}
                {tSeo('typeIntro', { types: typesDisplay, generation: t('generationLabel', { num: pokemon.species.generationNumber }) })}
                {pokemon.species.genus && (
                  <> {tSeo('knownAs', { genus: pokemon.species.genus })}</>
                )}
              </p>

              {evolutionChain.length > 1 && (
                <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                  {tSeo('evolutionLine', { 
                    name: capitalizedName, 
                    chain: evolutionChainLocalized.map(e => e.localizedName).join(" → ")
                  })}
                  {currentEvoIndex === 0 && ` ${t('baseFormCanEvolve')}`}
                  {currentEvoIndex === evolutionChain.length - 1 && evolutionChain.length > 1 && ` ${t('finalEvolvedForm')}`}
                </p>
              )}

              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                {tSeo('battleStrategy', { name: capitalizedName, total: totalStats })}{" "}
                {tSeo('highestStat', { 
                  stat: formatStatName(highestStat.stat.name), 
                  value: highestStat.base_stat,
                  role: getBattleRole(highestStat.stat.name)
                })}
              </p>

              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                {tSeo('physicalDescription', { 
                  height: (pokemon.height / 10).toFixed(1), 
                  weight: (pokemon.weight / 10).toFixed(1),
                  name: capitalizedName,
                  size: pokemon.height < 10 ? t('compact') : pokemon.height < 20 ? t('mediumSized') : t('large')
                })}
                {pokemon.species.habitat && (
                  <> {tSeo('habitatInfo', { habitat: pokemon.species.habitat })}</>
                )}.
                {" "}{tSeo('conclusion', { name: capitalizedName })}
              </p>

              {otherEvolutions.length > 0 && (
                <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                  {tSeo('relatedPokemon')}{" "}
                  {otherEvolutions.map((name, index) => {
                    const displayName = getLocalizedEvoName(name);
                    const isLast = index === otherEvolutions.length - 1;
                    const separator = otherEvolutions.length > 2 
                      ? (isLast ? ", " : ", ")
                      : (isLast ? " " : "");
                    return (
                      <span key={name}>
                        {index > 0 && separator}
                        <Link href={`/pokemon/${name.toLowerCase()}`} className="text-indigo hover:underline font-semibold">
                          {displayName}
                        </Link>
                      </span>
                    );
                  })}.
                </p>
              )}
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
