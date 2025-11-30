'use client';

/**
 * SeoContent Component
 * 
 * Styling Notes:
 * - All section badges: bg-black with text-white for consistency
 * - Slasher cuts: Applied to all section containers and item headers
 * - Operating Instructions & Core Capabilities: Containers match Legal Disclaimer style (border-2 border-black border-t-0)
 */
export default function SeoContent() {
  return (
    <>
      {/* Section 1: The Advanced Random Pokemon Generator */}
      <section className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
        <div className="inline-block bg-black px-4 py-1 slasher border border-black mb-4">
          <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">PROTOCOL V1.0</span>
        </div>
        <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9] mb-8 uppercase">
          ADVANCED <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-charcoal">
            POKEMON GENERATOR
          </span>
        </h2>
        <div className="space-y-4">
          <p className="font-mono text-charcoal text-base md:text-lg leading-relaxed border-l-4 border-black pl-6">
            Welcome to the most comprehensive random Pokemon generator available on the internet. Our advanced protocol supports every generation of Pokemon games—from the original Red and Blue (Generation 1) through the latest entries including Pokemon Scarlet and Violet (Generation 9), and we&apos;re ready for the upcoming Pokemon Legends: Z-A.
          </p>
          <p className="font-mono text-charcoal text-base md:text-lg leading-relaxed border-l-4 border-black pl-6">
            With access to over 1,025 unique Pokemon species, our generator provides trainers with an unparalleled tool for team building, challenge runs, and competitive preparation. The cypherpunk-inspired interface ensures a sleek, no-nonsense experience focused entirely on functionality and speed.
          </p>
          <p className="font-mono text-charcoal text-base md:text-lg leading-relaxed border-l-4 border-black pl-6">
            Our database is continuously updated to include new Pokemon forms, regional variants (Alolan, Galarian, Hisuian, and Paldean forms), Paradox Pokemon, and special event distributions.
          </p>
        </div>
      </section>

      {/* Section 2: How to Use */}
      <section className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
        <div className="inline-block bg-black px-4 py-1 slasher border border-black mb-4">
          <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">USER MANUAL</span>
        </div>
        <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9] mb-8 uppercase">
          OPERATING <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-charcoal">
            INSTRUCTIONS
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div>
            <div className="bg-black text-white p-4 slasher">
              <div className="flex items-center gap-3">
                <span className="text-marigold font-mono text-xs font-bold">STEP 01</span>
                <h3 className="font-sans font-bold text-lg">SET TEAM SIZE</h3>
              </div>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                Use the &quot;Team&quot; dropdown to select 1-6 Pokemon for a full competitive team or solo challenge run.
              </p>
            </div>
          </div>
          <div>
            <div className="bg-black text-white p-4 slasher">
              <div className="flex items-center gap-3">
                <span className="text-marigold font-mono text-xs font-bold">STEP 02</span>
                <h3 className="font-sans font-bold text-lg">SELECT REGION</h3>
              </div>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                Filter by native region—Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, Hisui, or Paldea.
              </p>
            </div>
          </div>
          <div>
            <div className="bg-black text-white p-4 slasher">
              <div className="flex items-center gap-3">
                <span className="text-marigold font-mono text-xs font-bold">STEP 03</span>
                <h3 className="font-sans font-bold text-lg">APPLY FILTERS</h3>
              </div>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                Narrow results by selecting one or more of the 18 Pokemon types. Perfect for monotype challenges.
              </p>
            </div>
          </div>
          <div>
            <div className="bg-black text-white p-4 slasher">
              <div className="flex items-center gap-3">
                <span className="text-marigold font-mono text-xs font-bold">STEP 04</span>
                <h3 className="font-sans font-bold text-lg">SET RARITY</h3>
              </div>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                Toggle legendary, mythical, Paradox, and Ultra Beast Pokemon based on your challenge rules.
              </p>
            </div>
          </div>
          <div>
            <div className="bg-black text-white p-4 slasher">
              <div className="flex items-center gap-3">
                <span className="text-marigold font-mono text-xs font-bold">STEP 05</span>
                <h3 className="font-sans font-bold text-lg">GENERATE TEAM</h3>
              </div>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                Press the glowing button and watch as Pokemon matching your criteria appear instantly.
              </p>
            </div>
          </div>
          <div>
            <div className="bg-black text-white p-4 slasher">
              <div className="flex items-center gap-3">
                <span className="text-marigold font-mono text-xs font-bold">STEP 06</span>
                <h3 className="font-sans font-bold text-lg">EXPLORE DATA</h3>
              </div>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                Click &quot;DATA&quot; on any Pokemon to view detailed stats, abilities, and additional information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Nuzlocke Tools */}
      <section className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
        <div className="inline-block bg-black px-4 py-1 slasher border border-black mb-4">
          <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">CHALLENGE MODE</span>
        </div>
        <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9] mb-8 uppercase">
          NUZLOCKE <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-charcoal">
            UTILITIES
          </span>
        </h2>
        <p className="font-mono text-charcoal text-base md:text-lg leading-relaxed border-l-4 border-black pl-6 mb-8">
          Our random Pokemon generator has become an indispensable utility for the Nuzlocke community. Use our generator to pre-determine starter options, simulate encounter tables, or generate replacement Pokemon for fallen team members.
        </p>
        <div className="border-2 border-black bg-white p-6 md:p-8 slasher">
          <h3 className="font-sans font-bold uppercase text-xl md:text-2xl text-black mb-6">
            Supported Challenge Formats
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 border-b border-black/10 pb-4">
              <span className="bg-marigold text-black font-mono text-xs font-bold px-2 py-1 slasher">01</span>
              <div>
                <span className="font-sans font-bold text-black">Classic Nuzlocke</span>
                <p className="font-mono text-sm text-charcoal mt-1">Generate random starter trios or simulate route encounters for ROM hacks and fan games.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 border-b border-black/10 pb-4">
              <span className="bg-marigold text-black font-mono text-xs font-bold px-2 py-1 slasher">02</span>
              <div>
                <span className="font-sans font-bold text-black">SoulLink Challenges</span>
                <p className="font-mono text-sm text-charcoal mt-1">Generate paired teams for two players running synchronized Nuzlocke runs.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 border-b border-black/10 pb-4">
              <span className="bg-marigold text-black font-mono text-xs font-bold px-2 py-1 slasher">03</span>
              <div>
                <span className="font-sans font-bold text-black">Draft Leagues</span>
                <p className="font-mono text-sm text-charcoal mt-1">Create randomized draft pools for competitive Pokemon draft leagues and tournaments.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 border-b border-black/10 pb-4">
              <span className="bg-marigold text-black font-mono text-xs font-bold px-2 py-1 slasher">04</span>
              <div>
                <span className="font-sans font-bold text-black">Randomizer Seeds</span>
                <p className="font-mono text-sm text-charcoal mt-1">Preview potential team compositions before starting a randomized ROM playthrough.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="bg-marigold text-black font-mono text-xs font-bold px-2 py-1 slasher">05</span>
              <div>
                <span className="font-sans font-bold text-black">Wonderlocke Prep</span>
                <p className="font-mono text-sm text-charcoal mt-1">Generate expectations for Wonder Trade-based challenge runs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Core Features */}
      <section className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
        <div className="inline-block bg-black px-4 py-1 slasher border border-black mb-4">
          <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">SYSTEM SPECS</span>
        </div>
        <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9] mb-8 uppercase">
          CORE <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-charcoal">
            CAPABILITIES
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">Type Filtering System</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                Filter by any of the 18 Pokemon types. Select multiple types to include dual-type Pokemon or focus on a single type for monotype challenges.
              </p>
            </div>
          </div>
          <div>
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">Legendary &amp; Rarity Toggle</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                Fine-tune with granular rarity controls. Include or exclude Legendaries, Mythicals, Paradox Pokemon, and Ultra Beasts.
              </p>
            </div>
          </div>
          <div>
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">Sprite &amp; Artwork Modes</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                Choose &quot;Sprite Only&quot; for pixel-art, &quot;Name Only&quot; for minimal view, or &quot;Both&quot; for high-resolution artwork with full details.
              </p>
            </div>
          </div>
          <div>
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">Complete Pokedex Database</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                Access our comprehensive Pokedex database with detailed stats, types, abilities, and Pokédex entries for all 1025 Pokemon across every generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Why Choose Us */}
      <section className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
        <div className="inline-block bg-black px-4 py-1 slasher border border-black mb-4">
          <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">BENCHMARKS</span>
        </div>
        <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9] mb-8 uppercase">
          WHY CHOOSE <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-charcoal">
            THIS TOOL?
          </span>
        </h2>
        <div className="space-y-4">
          <p className="font-mono text-charcoal text-base md:text-lg leading-relaxed border-l-4 border-black pl-6">
            Unlike other random Pokemon generators, our protocol is built with performance and accuracy as top priorities. The database pulls directly from verified Pokemon API sources ensuring that all information—types, sprites, and Pokédex numbers—is accurate and up-to-date.
          </p>
          <p className="font-mono text-charcoal text-base md:text-lg leading-relaxed border-l-4 border-black pl-6">
            The minimalist cypherpunk design philosophy means zero bloat, zero unnecessary animations, and zero wasted time. Our generator works flawlessly on desktop computers, tablets, and mobile devices.
          </p>
          <p className="font-mono text-charcoal text-base md:text-lg leading-relaxed border-l-4 border-black pl-6">
            Join the thousands of trainers who trust our random Pokemon generator for their team-building needs. From casual fans to hardcore Nuzlockers, our tool serves the entire Pokemon community with speed, reliability, and style.
          </p>
        </div>
      </section>
    </>
  );
}
