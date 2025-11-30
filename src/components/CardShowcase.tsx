'use client';
import { Share2, Download } from 'lucide-react';

/**
 * CardShowcase Component - Export Trading Cards Feature
 * 
 * Styling Notes:
 * - Section badge: bg-black with text-white
 * - Download & Share icons: White background (bg-white) with black border (border-2 border-black)
 * - Slasher cut applied to section container
 */
export default function CardShowcase() {
  return (
    <section className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        {/* LEFT: Text Content */}
        <div className="flex-1 space-y-8">
          <div className="inline-block bg-black px-4 py-1 slasher border border-black">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">New Feature</span>
          </div>
          <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9]">
            EXPORT <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-charcoal">
              TRADING CARDS
            </span>
          </h2>
          <p className="font-mono text-charcoal text-base md:text-lg leading-relaxed border-l-4 border-black pl-6">
            Turn any generated Pokémon into a high-resolution collectible card. Perfect for sharing your Nuzlocke encounters or dream team on social media.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-black"><Download size={20} /></div>
              <span className="font-mono text-sm font-bold text-black">HD Download</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-black"><Share2 size={20} /></div>
              <span className="font-mono text-sm font-bold text-black">Instant Share</span>
            </div>
          </div>
        </div>

        {/* RIGHT: The Pikachu Demo Card */}
        <div className="flex-1 relative group flex justify-center">
          {/* Decorative Backing */}
          <div className="absolute inset-0 bg-black translate-x-4 translate-y-4 slasher opacity-20 max-w-[320px] mx-auto"></div>
          
          {/* THE CARD ITSELF */}
          <div className="relative w-[280px] md:w-[320px] bg-gradient-to-br from-yellow-200 to-yellow-500 p-3 border-[8px] border-[#D4AF37] shadow-2xl transform transition-transform duration-500 group-hover:rotate-2 group-hover:scale-105">
            
            {/* Header */}
            <div className="flex justify-between items-center bg-white/90 px-3 py-1 mb-2 border-b-2 border-black/10">
              <span className="font-sans font-bold text-black text-lg">PIKACHU</span>
              <span className="font-mono text-red-600 font-bold text-sm">HP 35</span>
            </div>

            {/* Art Box */}
            <div className="bg-white border-2 border-[#D4AF37] shadow-inner flex items-center justify-center h-48 mb-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-yellow-100 to-transparent opacity-50"></div>
              <img 
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" 
                alt="Pikachu"
                className="w-40 h-40 object-contain relative z-10"
              />
            </div>

            {/* Info Line */}
            <div className="bg-[#D4AF37] text-black text-[10px] font-mono text-center py-0.5 mb-3 font-bold">
              NO. 0025 Electric Pokemon HT: 0.4m WT: 6.0kg
            </div>

            {/* Stats Section */}
            <div className="space-y-2 px-1 mb-4">
              <div className="flex justify-between items-center border-b border-black/10 pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-white border border-black flex items-center justify-center text-[8px]">⚡</span>
                  <span className="font-sans font-bold text-sm text-black">Thunder Shock</span>
                </div>
                <span className="font-mono font-bold text-black text-lg">40</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-white border border-black flex items-center justify-center text-[8px]">⚡</span>
                  <span className="font-sans font-bold text-sm text-black">Electro Ball</span>
                </div>
                <span className="font-mono font-bold text-black text-lg">60+</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-2">
              <p className="font-mono text-[10px] text-black/60 font-bold">Generated by RandomPokemon.co</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
