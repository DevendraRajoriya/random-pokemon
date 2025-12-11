'use client';

import { useTranslations } from 'next-intl';

/**
 * SeoContent Component
 * 
 * Styling Notes:
 * - All section badges: bg-black with text-white for consistency
 * - Slasher cuts: Applied to all section containers and item headers
 * - Operating Instructions & Core Capabilities: Containers match Legal Disclaimer style (border-2 border-black border-t-0)
 * - Animations: challenge-card for slide-in, challenge-badge for pop effect, stagger-N for delays
 */
export default function SeoContent() {
  const t = useTranslations('seoContent');
  
  return (
    <>
      {/* Section 1: The Advanced Random Pokemon Generator */}
      <section className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
        <div className="inline-block bg-black px-4 py-1 slasher border border-black mb-4 challenge-badge">
          <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">{t('protocol.badge')}</span>
        </div>
        <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9] mb-8 uppercase">
          {t('protocol.title').split(' ').slice(0, 1).join(' ')} <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-charcoal">
            {t('protocol.title').split(' ').slice(1).join(' ')}
          </span>
        </h2>
        <div className="space-y-4">
          <p className="font-mono text-charcoal text-base md:text-lg leading-relaxed border-l-4 border-black pl-6 challenge-card stagger-1">
            {t('protocol.subtitle')}
          </p>
          <p className="font-mono text-charcoal text-base md:text-lg leading-relaxed border-l-4 border-black pl-6 challenge-card stagger-2">
            {t('protocol.paragraph1')}
          </p>
          <p className="font-mono text-charcoal text-base md:text-lg leading-relaxed border-l-4 border-black pl-6 challenge-card stagger-3">
            {t('protocol.paragraph2')}
          </p>
        </div>
      </section>

      {/* Section 2: How to Use */}
      <section className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
        <div className="inline-block bg-black px-4 py-1 slasher border border-black mb-4 challenge-badge">
          <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">{t('instructions.badge')}</span>
        </div>
        <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9] mb-8 uppercase">
          {t('instructions.title').split(' ').slice(0, -1).join(' ')} <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-charcoal">
            {t('instructions.title').split(' ').slice(-1).join(' ')}
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className={`challenge-card stagger-${step}`}>
              <div className="bg-black text-white p-4 slasher">
                <div className="flex items-center gap-3">
                  <span className="text-marigold font-mono text-xs font-bold challenge-badge">{t('instructions.stepLabel', { defaultValue: 'STEP' })} 0{step}</span>
                  <h3 className="font-sans font-bold text-lg">{t(`instructions.step${step}.title` as const).replace(/^(Step \d+:|Paso \d+:|Schritt \d+:|Étape \d+ :|Passo \d+:|단계 \d+:)\s*/i, '')}</h3>
                </div>
              </div>
              <div className="border-2 border-black border-t-0 p-4 bg-white">
                <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                  {t(`instructions.step${step}.description` as const)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Nuzlocke Tools */}
      <section className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
        <div className="inline-block bg-black px-4 py-1 slasher border border-black mb-4 challenge-badge">
          <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">{t('nuzlocke.badge')}</span>
        </div>
        <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9] mb-8 uppercase">
          {t('nuzlocke.title').split(' ').slice(0, -1).join(' ')} <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-charcoal">
            {t('nuzlocke.title').split(' ').slice(-1).join(' ')}
          </span>
        </h2>
        <p className="font-mono text-charcoal text-base md:text-lg leading-relaxed border-l-4 border-black pl-6 mb-8">
          {t('nuzlocke.intro')}
        </p>
        <div className="border-2 border-black bg-white p-6 md:p-8 slasher challenge-card">
          <h3 className="font-sans font-bold uppercase text-xl md:text-2xl text-black mb-6">
            {t('nuzlocke.subtitle')}
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((challenge) => (
              <div key={challenge} className={`flex items-start gap-4 challenge-card stagger-${challenge} ${challenge < 5 ? 'border-b border-black/10 pb-4' : ''}`}>
                <span className="bg-marigold text-black font-mono text-xs font-bold px-2 py-1 slasher challenge-badge">0{challenge}</span>
                <div>
                  <span className="font-sans font-bold text-black">{t(`nuzlocke.challenge${challenge}.title` as const)}</span>
                  <p className="font-mono text-sm text-charcoal mt-1">{t(`nuzlocke.challenge${challenge}.description` as const)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Core Features */}
      <section className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
        <div className="inline-block bg-black px-4 py-1 slasher border border-black mb-4 challenge-badge">
          <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">{t('capabilities.badge')}</span>
        </div>
        <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9] mb-8 uppercase">
          {t('capabilities.title').split(' ').slice(0, 1).join(' ')} <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-charcoal">
            {t('capabilities.title').split(' ').slice(1).join(' ')}
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((feature) => (
            <div key={feature} className={`challenge-card stagger-${feature}`}>
              <div className="bg-black text-white p-4 slasher">
                <h3 className="font-sans font-bold text-lg md:text-xl">{t(`capabilities.feature${feature}.title` as const)}</h3>
              </div>
              <div className="border-2 border-black border-t-0 p-4 bg-white">
                <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                  {t(`capabilities.feature${feature}.description` as const)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: Why Choose Us */}
      <section className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
        <div className="inline-block bg-black px-4 py-1 slasher border border-black mb-4 challenge-badge">
          <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">{t('whyChoose.badge')}</span>
        </div>
        <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9] mb-8 uppercase">
          {t('whyChoose.title').split(' ').slice(0, 2).join(' ')} <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-charcoal">
            {t('whyChoose.title').split(' ').slice(2).join(' ')}
          </span>
        </h2>
        <div className="space-y-4">
          <p className="font-mono text-charcoal text-base md:text-lg leading-relaxed border-l-4 border-black pl-6 challenge-card stagger-1">
            {t('whyChoose.subtitle')}
          </p>
          <p className="font-mono text-charcoal text-base md:text-lg leading-relaxed border-l-4 border-black pl-6 challenge-card stagger-2">
            {t('whyChoose.paragraph1')}
          </p>
          <p className="font-mono text-charcoal text-base md:text-lg leading-relaxed border-l-4 border-black pl-6 challenge-card stagger-3">
            {t('whyChoose.paragraph2')}
          </p>
        </div>
      </section>
    </>
  );
}
