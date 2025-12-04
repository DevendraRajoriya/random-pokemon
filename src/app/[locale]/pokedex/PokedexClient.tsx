'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Search, Database, Share2, Loader2, ChevronDown, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import ShareModal from '@/components/ShareModal';

interface PokemonListItem {
  name: string;
  url: string;
}

interface Pokemon {
  id: number;
  name: string;
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

const ITEMS_PER_PAGE = 24;

interface PokedexClientProps {
  initialPokemonList: PokemonListItem[];
  totalCount: number;
}

export default function PokedexClient({ initialPokemonList, totalCount }: PokedexClientProps) {
  const t = useTranslations('pokedex');
  const tCommon = useTranslations('common');
  const [allPokemon] = useState<PokemonListItem[]>(initialPokemonList);
  const [visiblePokemon, setVisiblePokemon] = useState<Pokemon[]>([]);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredList, setFilteredList] = useState<PokemonListItem[]>(initialPokemonList);
  const [sharePokemon, setSharePokemon] = useState<Pokemon | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch detailed data for visible Pokemon
  const fetchPokemonDetails = useCallback(async (pokemonList: PokemonListItem[]) => {
    try {
      const details = await Promise.all(
        pokemonList.map(async (pokemon) => {
          const response = await fetch(pokemon.url);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${pokemon.name}`);
          }
          return response.json();
        })
      );
      return details;
    } catch (err) {
      console.error('Failed to fetch Pokemon details:', err);
      throw err;
    }
  }, []);

  // Initial load of first batch
  useEffect(() => {
    const loadInitialBatch = async () => {
      if (filteredList.length === 0) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
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
    
    loadInitialBatch();
  }, [filteredList, fetchPokemonDetails]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredList(allPokemon);
    } else {
      const filtered = allPokemon.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredList(filtered);
    }
  }, [searchQuery, allPokemon]);

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

  const formatPokemonName = (name: string) => {
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatId = (id: number) => {
    return `#${String(id).padStart(4, '0')}`;
  };

  return (
    <main className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-black text-white font-mono text-sm font-bold px-4 py-2 border-2 border-black hover:bg-charcoal transition-colors mb-6"
        >
          <ArrowLeft size={16} />
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

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-white border-2 border-black py-3 md:py-4 pl-12 pr-4 font-mono text-sm text-black placeholder:text-black/30 focus:outline-none focus:bg-cream transition-colors"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <span className="font-mono text-xs text-black/40">
                {t('results', { count: filteredList.length })}
              </span>
            </div>
          </div>
        </div>

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
        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {visiblePokemon.map((pokemon) => (
                <div
                  key={pokemon.id}
                  className="bg-white border-2 border-black p-3 md:p-4 slasher relative group hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                >
                  {/* Header with ID and Share */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] md:text-xs bg-marigold text-black px-2 py-0.5 md:py-1 inline-block border border-black font-semibold">
                      {formatId(pokemon.id)}
                    </span>
                    <button
                      onClick={() => setSharePokemon(pokemon)}
                      className="p-1 text-black/40 hover:text-marigold transition-colors cursor-pointer"
                      aria-label="Share"
                    >
                      <Share2 size={14} />
                    </button>
                  </div>

                  {/* Pokemon Image */}
                  <div className="relative w-full aspect-square mb-3 bg-cream/50 flex items-center justify-center">
                    {pokemon.sprites.other['official-artwork'].front_default ? (
                      <Image
                        src={pokemon.sprites.other['official-artwork'].front_default}
                        alt={pokemon.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-contain p-2"
                        priority={pokemon.id <= 12}
                      />
                    ) : (
                      <div className="text-black/20 font-mono text-xs">{tCommon('noImage')}</div>
                    )}
                  </div>

                  {/* Pokemon Name */}
                  <h2 className="font-sans font-bold text-sm md:text-base text-black uppercase mb-2 truncate">
                    {formatPokemonName(pokemon.name)}
                  </h2>

                  {/* Types */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {pokemon.types.map(({ type }) => (
                      <span
                        key={type.name}
                        className="px-2 py-0.5 text-[10px] md:text-xs font-mono uppercase font-semibold border border-black/20"
                        style={{
                          backgroundColor: TYPE_COLORS[type.name] || '#888',
                          color: ['electric', 'normal', 'ground', 'fairy', 'ice'].includes(type.name) ? '#000' : '#fff'
                        }}
                      >
                        {type.name}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 gap-1.5">
                    <Link
                      href={`/pokemon/${pokemon.name}`}
                      className="bg-indigo hover:bg-opacity-90 text-cream font-grotesk font-semibold text-[10px] md:text-xs px-2 py-2 text-center border border-black transition-all duration-200"
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
                  className="bg-black text-white font-mono text-sm font-bold px-8 py-4 border-2 border-black hover:bg-charcoal transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      {tCommon('loading')}
                    </>
                  ) : (
                    <>
                      <ChevronDown size={18} />
                      {t('loadMore', { count: filteredList.length - displayCount })}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* No Results */}
            {filteredList.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="inline-block border-4 border-charcoal p-8 slasher">
                  <p className="font-mono text-charcoal text-lg">
                    {t('noResults', { query: searchQuery })}
                  </p>
                </div>
              </div>
            )}

            {/* End of Results */}
            {displayCount >= filteredList.length && filteredList.length > 0 && (
              <div className="mt-8 text-center">
                <p className="font-mono text-charcoal text-sm">
                  {t('displayingAll', { count: filteredList.length })}
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
