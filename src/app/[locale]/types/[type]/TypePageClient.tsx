'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Search, ArrowLeft } from 'lucide-react';
import { Locale } from '@/i18n/routing';

interface Pokemon {
  id: number;
  name: string;
}

interface TypePageClientProps {
  type: string;
  pokemon: Pokemon[];
  locale: Locale;
}

const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

export default function TypePageClient({ type, pokemon, locale }: TypePageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const t = useTranslations('types');
  const tCommon = useTranslations('common');
  
  const typeName = type.charAt(0).toUpperCase() + type.slice(1);
  const typeColor = TYPE_COLORS[type] || '#A8A878';
  const localizedType = t(type);

  const filteredPokemon = useMemo(() => {
    if (!searchQuery.trim()) return pokemon;
    
    const query = searchQuery.toLowerCase();
    return pokemon.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.id.toString().includes(query)
    );
  }, [pokemon, searchQuery]);

  return (
    <main className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-black/60 hover:text-black transition-colors mb-4 font-mono text-sm"
          >
            <ArrowLeft size={16} />
            {tCommon('backToHome')}
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-16 h-16 rounded-full border-4 border-black flex items-center justify-center"
              style={{ backgroundColor: typeColor }}
            >
              <span className="text-white font-bold text-2xl">{typeName[0]}</span>
            </div>
            <div>
              <h1 className="font-grotesk font-bold text-4xl md:text-6xl text-black">
                {localizedType} Type Pokemon
              </h1>
              <p className="font-mono text-lg text-black/60 mt-2">
                {filteredPokemon.length} {filteredPokemon.length === 1 ? 'Pokemon' : 'Pokemon'} found
              </p>
            </div>
          </div>

          <p className="font-mono text-sm text-black/80 max-w-3xl leading-relaxed">
            Browse all {typeName} type Pokemon from Generation 1 through 9. Click any Pokemon to view detailed stats, abilities, and evolution chains. Perfect for building {typeName} type teams or Monotype challenge runs.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={20} />
            <input
              type="text"
              placeholder="Search by name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-black py-3 pl-12 pr-4 font-mono text-sm text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {/* Pokemon Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredPokemon.map((p, index) => (
            <Link
              key={p.id}
              href={`/pokemon/${p.name}`}
              className="group bg-white border-2 border-black hover:border-4 hover:bg-cream transition-all duration-200 overflow-hidden"
            >
              <div className="relative w-full aspect-square p-4 bg-cream/50">
                <Image
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`}
                  alt={p.name}
                  fill
                  className="object-contain group-hover:scale-110 transition-transform duration-200"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  loading={index < 12 ? 'eager' : 'lazy'}
                  priority={index < 6}
                  unoptimized
                />
              </div>
              <div className="p-3 bg-white border-t-2 border-black">
                <p className="font-mono text-xs font-bold text-black uppercase truncate">
                  {p.name}
                </p>
                <p className="font-mono text-xs text-black/50">
                  #{String(p.id).padStart(4, '0')}
                </p>
                <div 
                  className="mt-2 text-center text-white text-xs font-bold py-1 border border-black"
                  style={{ backgroundColor: typeColor }}
                >
                  {localizedType.toUpperCase()}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredPokemon.length === 0 && (
          <div className="text-center py-20">
            <p className="font-mono text-black/60">No Pokemon found matching "{searchQuery}"</p>
          </div>
        )}

        {/* Type Links */}
        <div className="mt-16 border-t-2 border-black pt-8">
          <h2 className="font-grotesk font-bold text-2xl text-black mb-6">
            Browse Other Types
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.keys(TYPE_COLORS).map((t) => (
              <Link
                key={t}
                href={`/types/${t}`}
                className="px-4 py-2 border-2 border-black font-mono text-sm font-bold hover:scale-105 transition-transform"
                style={{ 
                  backgroundColor: TYPE_COLORS[t],
                  color: 'white'
                }}
              >
                {t.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
