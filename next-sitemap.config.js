/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://randompokemon.co',
  generateRobotsTxt: true,
  outDir: 'out',
  // Generate sitemaps for all locales
  alternateRefs: [
    { href: 'https://randompokemon.co/en', hreflang: 'en' },
    { href: 'https://randompokemon.co/ja', hreflang: 'ja' },
    { href: 'https://randompokemon.co/ko', hreflang: 'ko' },
    { href: 'https://randompokemon.co/fr', hreflang: 'fr' },
    { href: 'https://randompokemon.co/de', hreflang: 'de' },
    { href: 'https://randompokemon.co/es', hreflang: 'es' },
    { href: 'https://randompokemon.co/pt', hreflang: 'pt' },
  ],
  // Transform function to add alternate language links
  transform: async (config, path) => {
    // Default priority and changefreq
    let priority = 0.7;
    let changefreq = 'weekly';

    // Higher priority for main pages
    if (path === '/' || path.match(/^\/[a-z]{2}$/)) {
      priority = 1.0;
      changefreq = 'daily';
    }
    // Pokedex pages
    else if (path.includes('/pokedex')) {
      priority = 0.9;
      changefreq = 'weekly';
    }
    // Type hub pages
    else if (path.includes('/types/')) {
      priority = 0.9;
      changefreq = 'weekly';
    }
    // Generation hub pages
    else if (path.includes('/generations/')) {
      priority = 0.9;
      changefreq = 'weekly';
    }
    // Individual Pokemon pages
    else if (path.includes('/pokemon/')) {
      priority = 0.8;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};
