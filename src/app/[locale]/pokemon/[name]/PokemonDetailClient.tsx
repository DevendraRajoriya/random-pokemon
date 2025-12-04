"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Database, Share2, Zap, Shuffle, Sparkles } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
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

// Total Pokemon count for random generation (Gen 1-9)
const TOTAL_POKEMON = 1025;

export default function PokemonDetailClient({ pokemon }: Props) {
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showShiny, setShowShiny] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const t = useTranslations('pokemon');
  const tStats = useTranslations('stats');
  const tCommon = useTranslations('common');
  const tSeo = useTranslations('seo');

  // Generate Random Pokemon - navigates to a random pre-built Pokemon page
  const generateRandomPokemon = () => {
    setIsGenerating(true);
    const randomId = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
    // Small delay for visual feedback, then navigate to pre-rendered page
    setTimeout(() => {
      router.push(`/pokemon/${randomId}`);
    }, 300);
  };

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

  // Get evolution chain (exclude current Pokemon)
  const evolutionChain = pokemon.species.evolutionChain || [];
  const otherEvolutions = evolutionChain.filter(name => name.toLowerCase() !== pokemon.name.toLowerCase());
  const currentEvoIndex = evolutionChain.findIndex(name => name.toLowerCase() === pokemon.name.toLowerCase());

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
            text: `${capitalizedName} is part of the ${evolutionChain.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(" → ")} evolution line.`,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pokemonJsonLd) }}
      />
      <main className="min-h-screen bg-cream">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-12">
          
          {/* Top Navigation */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6 md:mb-8">
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 bg-black text-white font-mono text-xs px-4 py-2 slasher hover:bg-charcoal transition-colors"
              >
                <ArrowLeft size={14} />
                {tCommon('back').toUpperCase()}
              </button>
              
              {/* Generate Random Pokemon Button */}
              <button
                onClick={generateRandomPokemon}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-marigold text-black font-mono text-xs font-bold px-4 py-2 slasher border-2 border-black hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shuffle size={14} className={isGenerating ? 'animate-spin' : ''} />
                {isGenerating ? t('generating') : t('randomPokemon')}
              </button>
            </div>
            
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
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-block bg-black px-3 py-1">
                    <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      {t('visualData')}
                    </span>
                  </div>
                  
                  {/* Shiny Toggle Button */}
                  <button
                    onClick={() => setShowShiny(!showShiny)}
                    className={`flex items-center gap-2 font-mono text-xs font-bold px-3 py-1.5 border-2 border-black transition-all ${
                      showShiny 
                        ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 text-black' 
                        : 'bg-cream text-black hover:bg-marigold'
                    }`}
                  >
                    <Sparkles size={14} className={showShiny ? 'animate-pulse' : ''} />
                    {showShiny ? t('shiny') : t('normal')}
                  </button>
                </div>
                
                <div className="relative w-full aspect-square bg-cream/50 flex items-center justify-center">
                  {/* Shiny sparkle effect overlay */}
                  {showShiny && (
                    <div className="absolute inset-0 pointer-events-none z-20">
                      <div className="absolute top-4 left-8 w-2 h-2 bg-yellow-300 rounded-full animate-ping" />
                      <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-pink-300 rounded-full animate-ping delay-100" />
                      <div className="absolute bottom-16 left-16 w-2 h-2 bg-purple-300 rounded-full animate-ping delay-200" />
                    </div>
                  )}
                  <Image
                    src={showShiny 
                      ? (pokemon.sprites.other["official-artwork"].front_shiny || pokemon.sprites.front_shiny || pokemon.sprites.other["official-artwork"].front_default)
                      : pokemon.sprites.other["official-artwork"].front_default
                    }
                    alt={`${capitalizedName} ${showShiny ? 'shiny ' : ''}official artwork - ${typesDisplay} type Pokemon from ${pokemon.species.generation}`}
                    fill
                    className={`object-contain p-4 mix-blend-multiply transition-all duration-300 ${showShiny ? 'drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]' : ''}`}
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

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-4">
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
                      const formattedEvoName = evoName.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ');
                      
                      return (
                        <div key={evoName} className="flex items-center gap-2">
                          {index > 0 && (
                            <span className="font-mono text-xl text-charcoal">→</span>
                          )}
                          {isCurrentPokemon ? (
                            <span className="bg-marigold text-black font-mono text-sm font-bold px-4 py-2 border-2 border-black">
                              {formattedEvoName}
                            </span>
                          ) : (
                            <Link
                              href={`/pokemon/${evoName.toLowerCase()}`}
                              className="bg-cream hover:bg-marigold text-black font-mono text-sm font-bold px-4 py-2 border-2 border-black transition-colors"
                            >
                              {formattedEvoName}
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
                <p className="font-mono text-xs text-charcoal mb-3">
                  Find more {typesDisplay}-type Pokemon in the Pokédex:
                </p>
                <div className="flex flex-wrap gap-2">
                  {pokemon.types.map((typeInfo) => (
                    <Link
                      key={typeInfo.type.name}
                      href={`/pokedex?type=${typeInfo.type.name}`}
                      className="font-mono text-xs px-4 py-2 uppercase font-bold border-2 border-black hover:brightness-110 transition-all"
                      style={{ 
                        backgroundColor: TYPE_COLORS[typeInfo.type.name] || '#888',
                        color: ['electric', 'normal', 'ground', 'fairy', 'ice'].includes(typeInfo.type.name) ? '#000' : '#fff'
                      }}
                    >
                      {t('allTypesPokemon', { type: typeInfo.type.name })}
                    </Link>
                  ))}
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
                Looking for details on <strong className="text-black">{capitalizedName}</strong>? 
                This <strong className="text-black">{typesDisplay}</strong>-type Pokemon was first introduced in{" "}
                <strong className="text-black">{pokemon.species.generation}</strong>.
                {pokemon.species.genus && (
                  <> It is known as the <strong className="text-black">{pokemon.species.genus}</strong>.</>
                )}
              </p>

              {evolutionChain.length > 1 && (
                <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                  <strong className="text-black">{capitalizedName}</strong> is part of the{" "}
                  {evolutionChain.map((name, index) => {
                    const formatted = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    const isCurrent = name.toLowerCase() === pokemon.name.toLowerCase();
                    return (
                      <span key={name}>
                        {index > 0 && " → "}
                        {isCurrent ? (
                          <strong className="text-black">{formatted}</strong>
                        ) : (
                          <Link href={`/pokemon/${name.toLowerCase()}`} className="text-indigo hover:underline">
                            {formatted}
                          </Link>
                        )}
                      </span>
                    );
                  })}{" "}
                  evolution line.
                  {currentEvoIndex === 0 && " As the base form, it can evolve into stronger forms."}
                  {currentEvoIndex === evolutionChain.length - 1 && evolutionChain.length > 1 && " This is the final evolved form."}
                </p>
              )}

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

              {otherEvolutions.length > 0 && (
                <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                  Want to learn about related Pokemon? Check out{" "}
                  {otherEvolutions.map((name, index) => {
                    const formatted = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    const isLast = index === otherEvolutions.length - 1;
                    const separator = otherEvolutions.length > 2 
                      ? (isLast ? ", or " : ", ")
                      : (isLast ? " or " : "");
                    return (
                      <span key={name}>
                        {index > 0 && separator}
                        <Link href={`/pokemon/${name.toLowerCase()}`} className="text-indigo hover:underline font-semibold">
                          {formatted}
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
