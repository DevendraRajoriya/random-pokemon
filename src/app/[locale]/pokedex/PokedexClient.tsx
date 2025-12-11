'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Search, Database, Share2, Loader2, ChevronDown, ArrowLeft, Filter, X, SlidersHorizontal } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Locale, pokeApiLanguageMap } from '@/i18n/routing';

// Dynamic import for ShareModal to reduce initial bundle
const ShareModal = dynamic(() => import('@/components/ShareModal'), {
  loading: () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
      <Loader2 className="animate-spin text-white" size={48} />
    </div>
  ),
  ssr: false,
});

interface PokemonListItem {
  name: string;
  url: string;
}

interface Pokemon {
  id: number;
  name: string;
  localizedName?: string;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
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

const POKEMON_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark",
  "steel", "fairy",
];

// Generation ranges
const GENERATIONS = [
  { key: "gen1", label: "Gen 1", range: [1, 151] },
  { key: "gen2", label: "Gen 2", range: [152, 251] },
  { key: "gen3", label: "Gen 3", range: [252, 386] },
  { key: "gen4", label: "Gen 4", range: [387, 493] },
  { key: "gen5", label: "Gen 5", range: [494, 649] },
  { key: "gen6", label: "Gen 6", range: [650, 721] },
  { key: "gen7", label: "Gen 7", range: [722, 809] },
  { key: "gen8", label: "Gen 8", range: [810, 905] },
  { key: "gen9", label: "Gen 9", range: [906, 1025] },
];

// Sort options
const SORT_OPTIONS = [
  { key: "id-asc", label: "# Low → High" },
  { key: "id-desc", label: "# High → Low" },
  { key: "name-asc", label: "A → Z" },
  { key: "name-desc", label: "Z → A" },
];

const ITEMS_PER_PAGE = 24;

interface PokedexFilters {
  types: string[];
  generations: string[];
  sort: string;
}

interface PokedexClientProps {
  initialPokemonList: PokemonListItem[];
  totalCount: number;
}

export default function PokedexClient({ initialPokemonList, totalCount }: PokedexClientProps) {
  const t = useTranslations('pokedex');
  const tCommon = useTranslations('common');
  const tTypes = useTranslations('types');
  const tFilters = useTranslations('filters');
  const locale = useLocale() as Locale;
  const [allPokemon] = useState<PokemonListItem[]>(initialPokemonList);
  const [visiblePokemon, setVisiblePokemon] = useState<Pokemon[]>([]);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredList, setFilteredList] = useState<PokemonListItem[]>(initialPokemonList);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Advanced filters state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<PokedexFilters>({
    types: [],
    generations: [],
    sort: 'id-asc',
  });
  
  // Pokemon type cache for filtering
  const [pokemonTypeCache, setPokemonTypeCache] = useState<Map<string, string[]>>(new Map());
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);

  // Debounce search input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 200);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchInput]);
  const [sharePokemon, setSharePokemon] = useState<Pokemon | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch localized Pokemon name from species endpoint
  const fetchLocalizedName = useCallback(async (pokemonName: string): Promise<string> => {
    try {
      const pokeApiLang = pokeApiLanguageMap[locale];
      
      // Try original name first, then base name (without form suffix like -solo, -galar, etc.)
      const namesToTry = [pokemonName];
      if (pokemonName.includes('-')) {
        // Extract base name for variant forms (e.g., "wishiwashi-solo" -> "wishiwashi")
        const baseName = pokemonName.split('-')[0];
        if (!namesToTry.includes(baseName)) {
          namesToTry.push(baseName);
        }
      }
      
      for (const name of namesToTry) {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
        if (res.ok) {
          const species = await res.json();
          const localizedEntry = species.names?.find((n: { language: { name: string }, name: string }) => n.language.name === pokeApiLang);
          if (localizedEntry) return localizedEntry.name;
          
          const englishEntry = species.names?.find((n: { language: { name: string }, name: string }) => n.language.name === 'en');
          if (englishEntry) return englishEntry.name;
        }
      }
      
      return pokemonName;
    } catch {
      return pokemonName;
    }
  }, [locale]);

  // Fetch detailed data for visible Pokemon
  const fetchPokemonDetails = useCallback(async (pokemonList: PokemonListItem[]) => {
    try {
      const details = await Promise.all(
        pokemonList.map(async (pokemon) => {
          const [pokemonRes, localizedName] = await Promise.all([
            fetch(pokemon.url),
            fetchLocalizedName(pokemon.name)
          ]);
          if (!pokemonRes.ok) {
            throw new Error(`Failed to fetch ${pokemon.name}`);
          }
          const pokemonData = await pokemonRes.json();
          
          // Cache types for filtering
          const types = pokemonData.types.map((t: { type: { name: string } }) => t.type.name);
          setPokemonTypeCache(prev => new Map(prev).set(pokemon.name, types));
          
          return { ...pokemonData, localizedName };
        })
      );
      return details;
    } catch (err) {
      console.error('Failed to fetch Pokemon details:', err);
      throw err;
    }
  }, [fetchLocalizedName]);

  // Get Pokemon ID from URL
  const getPokemonIdFromUrl = useCallback((url: string): number => {
    const match = url.match(/\/pokemon\/(\d+)\//);
    return match ? parseInt(match[1], 10) : 0;
  }, []);

  // Check if Pokemon matches generation filter
  const matchesGeneration = useCallback((pokemonId: number, generations: string[]): boolean => {
    if (generations.length === 0) return true;
    if (!pokemonId || pokemonId < 1) return false;
    return generations.some(genKey => {
      const gen = GENERATIONS.find(g => g.key === genKey);
      if (!gen) return false;
      return pokemonId >= gen.range[0] && pokemonId <= gen.range[1];
    });
  }, []);

  // Check if Pokemon matches type filter (needs to fetch type data)
  const matchesType = useCallback((pokemonName: string, types: string[]): boolean => {
    if (types.length === 0) return true;
    const cachedTypes = pokemonTypeCache.get(pokemonName);
    if (!cachedTypes) return true; // Include if not cached yet
    return types.some(t => cachedTypes.includes(t));
  }, [pokemonTypeCache]);

  // Apply search, generation, and sort filters (not type - that needs Pokemon data)
  const applyFilters = useMemo(() => {
    let result = [...allPokemon];
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      result = result.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by generation
    if (filters.generations.length > 0) {
      result = result.filter(pokemon => {
        const id = getPokemonIdFromUrl(pokemon.url);
        if (id === 0) return false; // Skip invalid IDs
        return matchesGeneration(id, filters.generations);
      });
    }
    
    // Sort
    switch (filters.sort) {
      case 'id-desc':
        result.sort((a, b) => getPokemonIdFromUrl(b.url) - getPokemonIdFromUrl(a.url));
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'id-asc':
      default:
        result.sort((a, b) => getPokemonIdFromUrl(a.url) - getPokemonIdFromUrl(b.url));
        break;
    }
    
    return result;
  }, [allPokemon, searchQuery, filters.generations, filters.sort, getPokemonIdFromUrl, matchesGeneration]);
  
  // Update filtered list and reload Pokemon when non-type filters change
  useEffect(() => {
    const newFilteredList = applyFilters;
    setFilteredList(newFilteredList);
    
    // Reload Pokemon for the new filtered list
    const loadFilteredBatch = async () => {
      if (newFilteredList.length === 0) {
        setVisiblePokemon([]);
        setDisplayCount(0);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        // Always load extra Pokemon to account for type filtering
        const batchSize = ITEMS_PER_PAGE * 4;
        const maxLoad = Math.min(batchSize, newFilteredList.length);
        const initialBatch = newFilteredList.slice(0, maxLoad);
        const details = await fetchPokemonDetails(initialBatch);
        setVisiblePokemon(details);
        setDisplayCount(maxLoad);
        setLoading(false);
      } catch (err) {
        setError('Failed to load Pokemon details. Please try again.');
        setLoading(false);
      }
    };
    
    loadFilteredBatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyFilters]);

  // Load more Pokemon
  const loadMore = async () => {
    if (loadingMore || displayCount >= filteredList.length) return;
    
    setLoadingMore(true);
    try {
      const nextBatch = filteredList.slice(displayCount, displayCount + ITEMS_PER_PAGE);
      const details = await fetchPokemonDetails(nextBatch);
      setVisiblePokemon((prev) => [...prev, ...details]);
      setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
    } catch (err) {
      setError('Failed to load more Pokemon. Please try again.');
    }
    setLoadingMore(false);
  };

  // Retry function
  const retryLoad = async () => {
    setError(null);
    setLoading(true);
    try {
      const initialBatch = filteredList.slice(0, ITEMS_PER_PAGE);
      const details = await fetchPokemonDetails(initialBatch);
      setVisiblePokemon(details);
      setDisplayCount(ITEMS_PER_PAGE);
    } catch (err) {
      setError('Failed to load Pokemon details. Please try again.');
    }
    setLoading(false);
  };

  // Toggle type filter
  const toggleTypeFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  // Toggle generation filter
  const toggleGenFilter = (gen: string) => {
    setFilters(prev => ({
      ...prev,
      generations: prev.generations.includes(gen)
        ? prev.generations.filter(g => g !== gen)
        : [...prev.generations, gen]
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      types: [],
      generations: [],
      sort: 'id-asc',
    });
    setSearchInput('');
    setSearchQuery('');
  };

  // Count active filters
  const activeFilterCount = filters.types.length + filters.generations.length + (filters.sort !== 'id-asc' ? 1 : 0);

  // Apply type filter to visible Pokemon (client-side after data is loaded)
  const displayedPokemon = useMemo(() => {
    if (filters.types.length === 0) return visiblePokemon;
    
    return visiblePokemon.filter(pokemon => {
      const pokemonTypes = pokemon.types.map(t => t.type.name);
      return filters.types.some(filterType => pokemonTypes.includes(filterType));
    });
  }, [visiblePokemon, filters.types]);

  const formatPokemonName = (name: string) => {
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatId = (id: number) => {
    return `#${String(id).padStart(4, '0')}`;
  };

  // Helper to get translated type name
  const getTranslatedType = (typeName: string): string => {
    try {
      return tTypes(typeName as any);
    } catch {
      return typeName.charAt(0).toUpperCase() + typeName.slice(1);
    }
  };

  return (
    <main className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="btn-slide inline-flex items-center gap-2 bg-black text-white font-mono text-sm font-bold px-4 py-2 border-2 border-black hover:bg-charcoal transition-colors mb-6"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          {t('backToGenerator')}
        </Link>

        {/* Header - SSR content visible to Google */}
        <div className="mb-8 md:mb-12">
          <div className="inline-block bg-marigold px-4 py-1 slasher border border-black mb-4">
            <span className="font-mono text-xs font-bold text-black uppercase tracking-widest">{t('indexOnline')}</span>
          </div>
          <h1 className="font-sans font-bold text-5xl md:text-6xl lg:text-7xl text-black leading-[0.9] uppercase">
            {t('title')}
          </h1>
          <p className="font-mono text-charcoal text-sm md:text-base mt-4 max-w-xl">
            {t('subtitle', { count: totalCount.toLocaleString() })}
          </p>
        </div>

        {/* Search Bar & Filter Toggle */}
        <div className="mb-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={20} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-white border-2 border-black py-3 md:py-4 pl-12 pr-4 font-mono text-sm text-black placeholder:text-black/30 focus:outline-none focus:bg-cream transition-colors"
              />
            </div>
            
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-3 md:py-4 border-2 border-black font-mono text-sm font-bold transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'bg-indigo text-white'
                  : 'bg-white text-black hover:bg-cream'
              }`}
            >
              <SlidersHorizontal size={18} />
              <span>{t('filters')}</span>
              {activeFilterCount > 0 && (
                <span className="bg-marigold text-black text-xs px-2 py-0.5 font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
          
          {/* Results count */}
          <div className="mt-2">
            <span className="font-mono text-xs text-black/40">
              {loading ? t('loading') : t('results', { count: filters.types.length > 0 ? displayedPokemon.length : filteredList.length })}
            </span>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mb-8 bg-white border-2 border-black p-4 md:p-6 animate-in slide-in-from-top-2">
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans font-bold text-lg text-black uppercase">{t('advancedFilters')}</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 font-mono text-xs font-bold transition-colors"
                >
                  <X size={14} />
                  {t('clearAll')}
                </button>
              )}
            </div>

            {/* Type Filters */}
            <div className="mb-6">
              <h4 className="font-mono text-xs font-bold text-charcoal uppercase mb-3">{tFilters('typeLabel')}</h4>
              <div className="flex flex-wrap gap-2">
                {POKEMON_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleTypeFilter(type)}
                    className={`px-3 py-1.5 font-mono text-xs uppercase font-semibold border-2 transition-all ${
                      filters.types.includes(type)
                        ? 'border-black scale-105 shadow-[2px_2px_0px_0px_#000]'
                        : 'border-transparent hover:border-black/20'
                    }`}
                    style={{
                      backgroundColor: TYPE_COLORS[type] || '#888',
                      color: ['electric', 'normal', 'ground', 'fairy', 'ice'].includes(type) ? '#000' : '#fff',
                    }}
                  >
                    {getTranslatedType(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Generation Filters */}
            <div className="mb-6">
              <h4 className="font-mono text-xs font-bold text-charcoal uppercase mb-3">{tFilters('generationLabel')}</h4>
              <div className="flex flex-wrap gap-2">
                {GENERATIONS.map(gen => (
                  <button
                    key={gen.key}
                    onClick={() => toggleGenFilter(gen.key)}
                    className={`px-4 py-2 font-mono text-xs font-bold border-2 border-black transition-all ${
                      filters.generations.includes(gen.key)
                        ? 'bg-black text-white'
                        : 'bg-cream text-black hover:bg-charcoal hover:text-white'
                    }`}
                  >
                    {gen.label}
                    <span className="text-[10px] ml-1 opacity-60">
                      ({gen.range[0]}-{gen.range[1]})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h4 className="font-mono text-xs font-bold text-charcoal uppercase mb-3">{t('sortBy')}</h4>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.key}
                    onClick={() => setFilters(prev => ({ ...prev, sort: option.key }))}
                    className={`px-4 py-2 font-mono text-xs font-bold border-2 border-black transition-all ${
                      filters.sort === option.key
                        ? 'bg-marigold text-black'
                        : 'bg-white text-black hover:bg-cream'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Tags */}
        {activeFilterCount > 0 && !showFilters && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="font-mono text-xs text-charcoal">{t('activeFilters')}:</span>
            {filters.types.map(type => (
              <button
                key={type}
                onClick={() => toggleTypeFilter(type)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-mono font-semibold border border-black"
                style={{
                  backgroundColor: TYPE_COLORS[type] || '#888',
                  color: ['electric', 'normal', 'ground', 'fairy', 'ice'].includes(type) ? '#000' : '#fff',
                }}
              >
                {getTranslatedType(type)}
                <X size={12} />
              </button>
            ))}
            {filters.generations.map(gen => {
              const genData = GENERATIONS.find(g => g.key === gen);
              return (
                <button
                  key={gen}
                  onClick={() => toggleGenFilter(gen)}
                  className="flex items-center gap-1 px-2 py-1 bg-black text-white text-xs font-mono font-semibold"
                >
                  {genData?.label}
                  <X size={12} />
                </button>
              );
            })}
            {filters.sort !== 'id-asc' && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, sort: 'id-asc' }))}
                className="flex items-center gap-1 px-2 py-1 bg-marigold text-black text-xs font-mono font-semibold border border-black"
              >
                {SORT_OPTIONS.find(o => o.key === filters.sort)?.label}
                <X size={12} />
              </button>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="border-2 border-red-500 bg-white p-8 text-center">
              <p className="font-mono text-red-600 text-base mb-4">{tCommon('error')}</p>
              <button
                onClick={retryLoad}
                className="bg-black text-white font-mono text-sm font-bold px-6 py-3 border-2 border-black hover:bg-charcoal transition-colors"
              >
                {tCommon('retry')}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo mb-4" size={48} />
            <p className="font-mono text-charcoal text-sm">{t('loading')}</p>
          </div>
        )}

        {/* Pokemon Grid */}
        {!loading && !error && displayedPokemon.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {displayedPokemon.map((pokemon, index) => (
                <div
                  key={pokemon.id}
                  className={`pokemon-card bg-white border-2 border-black p-3 md:p-4 slasher relative group hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 card-scale-in stagger-${(index % 24) + 1}`}
                >
                  {/* Header with ID and Share */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] md:text-xs bg-marigold text-black px-2 py-0.5 md:py-1 inline-block border border-black font-semibold">
                      {formatId(pokemon.id)}
                    </span>
                    <button
                      onClick={() => setSharePokemon(pokemon)}
                      className="btn-icon-rotate p-1 text-black/40 hover:text-marigold transition-colors cursor-pointer"
                      aria-label="Share"
                    >
                      <Share2 size={14} className="transition-transform duration-200" />
                    </button>
                  </div>

                  {/* Pokemon Image */}
                  <div className="relative w-full aspect-square mb-3 bg-cream/50 flex items-center justify-center overflow-hidden">
                    {pokemon.sprites.other['official-artwork'].front_default ? (
                      <Image
                        src={pokemon.sprites.other['official-artwork'].front_default}
                        alt={`${pokemon.localizedName || pokemon.name} official artwork`}
                        fill
                        sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 25vw"
                        className="object-contain p-2 pokemon-image pokemon-float"
                        priority={index < 8}
                        loading={index < 8 ? undefined : 'lazy'}
                      />
                    ) : (
                      <div className="text-black/20 font-mono text-xs">{tCommon('noImage')}</div>
                    )}
                  </div>

                  {/* Pokemon Name */}
                  <h2 className="font-sans font-bold text-sm md:text-base text-black uppercase mb-2 truncate">
                    {pokemon.localizedName || formatPokemonName(pokemon.name)}
                  </h2>

                  {/* Types */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {pokemon.types.map(({ type }, typeIndex) => (
                      <span
                        key={type.name}
                        className="px-2 py-0.5 text-[10px] md:text-xs font-mono uppercase font-semibold border border-black/20 type-pop"
                        style={{
                          backgroundColor: TYPE_COLORS[type.name] || '#888',
                          color: ['electric', 'normal', 'ground', 'fairy', 'ice'].includes(type.name) ? '#000' : '#fff',
                          animationDelay: `${typeIndex * 0.1}s`
                        }}
                      >
                        {getTranslatedType(type.name)}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 gap-1.5">
                    <Link
                      href={`/pokemon/${pokemon.name}`}
                      className="btn-shine bg-indigo hover:bg-opacity-90 text-cream font-grotesk font-semibold text-[10px] md:text-xs px-2 py-2 text-center border border-black transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <span className="flex items-center justify-center gap-1">
                        <Database size={12} />
                        {t('viewDetails')}
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {displayCount < filteredList.length && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-shine btn-glow bg-black text-white font-mono text-sm font-bold px-8 py-4 border-2 border-black hover:bg-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      {tCommon('loading')}
                    </>
                  ) : (
                    <>
                      <ChevronDown size={18} className="animate-bounce" />
                      {t('loadMore', { count: filteredList.length - displayCount })}
                    </>
                  )}
                </button>
              </div>
            )}

        {/* No Results */}
        {!loading && !error && displayedPokemon.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block border-4 border-charcoal p-8 slasher">
              <p className="font-mono text-charcoal text-lg">
                {filteredList.length === 0 
                  ? t('noResults', { query: searchInput }) 
                  : t('noResults', { query: 'selected filters' })}
              </p>
            </div>
          </div>
        )}

            {/* End of Results */}
            {displayCount >= filteredList.length && displayedPokemon.length > 0 && (
              <div className="mt-8 text-center">
                <p className="font-mono text-charcoal text-sm">
                  {t('displayingAll', { count: displayedPokemon.length })}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Share Modal */}
      {sharePokemon && (
        <ShareModal
          pokemon={sharePokemon}
          onClose={() => setSharePokemon(null)}
        />
      )}
    </main>
  );
}
