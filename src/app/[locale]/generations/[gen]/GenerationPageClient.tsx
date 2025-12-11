'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Search, ArrowLeft, Zap } from 'lucide-react';
import { Locale } from '@/i18n/routing';

interface Pokemon {
  id: number;
  name: string;
}

interface Generation {
  gen: string;
  name: string;
  range: readonly [number, number];
  games: string;
}

interface GenerationPageClientProps {
  generation: Generation;
  pokemon: Pokemon[];
  locale: Locale;
}

const GEN_COLORS: Record<string, string> = {
  '1': '#FF1111',
  '2': '#FFD700',
  '3': '#009900',
  '4': '#0066CC',
  '5': '#000000',
  '6': '#FF6B6B',
  '7': '#FFA500',
  '8': '#8B00FF',
  '9': '#FF1493',
};

export default function GenerationPageClient({ generation, pokemon, locale }: GenerationPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const tCommon = useTranslations('common');
  
  const romanGen = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][parseInt(generation.gen) - 1];
  const genColor = GEN_COLORS[generation.gen] || '#000000';

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
              style={{ backgroundColor: genColor }}
            >
              <span className="text-white font-bold text-xl">{romanGen}</span>
            </div>
            <div>
              <h1 className="font-grotesk font-bold text-4xl md:text-6xl text-black">
                Generation {generation.gen} - {generation.name}
              </h1>
              <p className="font-mono text-lg text-black/60 mt-2">
                #{generation.range[0]} - #{generation.range[1]} ({pokemon.length} Pokemon)
              </p>
            </div>
          </div>

          <div className="bg-white border-2 border-black p-4 inline-block">
            <p className="font-mono text-sm text-black">
              <Zap className="inline-block mr-2" size={16} />
              <strong>Games:</strong> {generation.games}
            </p>
          </div>

          <p className="font-mono text-sm text-black/80 max-w-3xl leading-relaxed mt-4">
            Browse all Generation {generation.gen} Pokemon from the {generation.name} region. 
            These Pokemon were introduced in {generation.games}. Click any Pokemon to view detailed 
            stats, abilities, types, and evolution chains.
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
                  alt={`Pokemon #${p.id}`}
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
                  #{String(p.id).padStart(4, '0')}
                </p>
                <div 
                  className="mt-2 text-center text-white text-xs font-bold py-1 border border-black"
                  style={{ backgroundColor: genColor }}
                >
                  GEN {romanGen}
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

        {/* Generation Navigation */}
        <div className="mt-16 border-t-2 border-black pt-8">
          <h2 className="font-grotesk font-bold text-2xl text-black mb-6">
            Browse Other Generations
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-9 gap-3">
            {Object.entries(GEN_COLORS).map(([gen, color]) => {
              const romanNum = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][parseInt(gen) - 1];
              return (
                <Link
                  key={gen}
                  href={`/generations/${gen}`}
                  className="aspect-square flex flex-col items-center justify-center border-2 border-black font-mono font-bold hover:scale-105 transition-transform"
                  style={{ backgroundColor: color, color: 'white' }}
                >
                  <span className="text-2xl">{romanNum}</span>
                  <span className="text-xs mt-1">GEN {gen}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
