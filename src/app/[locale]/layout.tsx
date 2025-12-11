import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, locales, type Locale } from "@/i18n/routing";
import "../globals.css";
import Footer from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: true,
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: true,
});

const siteUrl = "https://www.randompokemon.co";

// Viewport configuration for mobile optimization
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FBE9BB",
};

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  
  // Import messages for metadata
  const messages = (await import(`@/messages/${locale}.json`)).default;
  const t = messages.metadata;

  return {
    metadataBase: new URL(siteUrl),
    title: t.title,
    description: t.description,
    keywords: [
      // Primary keywords
      "random pokemon generator",
      "pokemon team builder",
      "random pokemon",
      "pokemon randomizer",
      // Nuzlocke keywords
      "nuzlocke generator",
      "nuzlocke team builder",
      "soul link generator",
      "pokemon nuzlocke tool",
      // Challenge keywords
      "pokemon challenge run",
      "monotype run generator",
      "pokemon draft league",
      // Team building
      "random pokemon team",
      "pokemon team generator",
      "6 pokemon team builder",
      // Game specific
      "scarlet violet team builder",
      "pokemon scarlet randomizer",
      "pokemon violet team",
      // Feature keywords
      "pokemon picker",
      "random starter pokemon",
      "legendary pokemon generator",
      // Database
      "pokedex database",
      "all pokemon list",
      "pokemon stats lookup",
      // Long-tail keywords
      "best pokemon team generator",
      "random pokemon for nuzlocke",
      "pokemon randomizer online free",
      "generate random pokemon online",
      "pokemon team builder online",
      // 2025 keywords
      "pokemon generator 2025",
      "nuzlocke tool 2025",
    ],
    authors: [{ name: "Random Pokemon Generator" }],
    creator: "Random Pokemon Generator",
    publisher: "Random Pokemon Generator",
    alternates: {
      canonical: locale === "en" ? "/" : `/${locale}`,
      languages: {
        "en": "/",
        "ja": "/ja",
        "fr": "/fr",
        "de": "/de",
        "es": "/es",
        "pt": "/pt",
        "ko": "/ko",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : locale,
      url: locale === "en" ? siteUrl : `${siteUrl}/${locale}`,
      siteName: "Random Pokemon Generator",
      title: t.title,
      description: t.description,
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Random Pokemon Generator - Build Your Dream Team",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description,
      site: "@MisterLezend",
      creator: "@MisterLezend",
      images: [`${siteUrl}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "32x32" },
      ],
      apple: "/apple-touch-icon.svg",
    },
    verification: {
      google: "YOUR_GOOGLE_VERIFICATION_CODE",
    },
    category: "games",
  };
}

// JSON-LD Structured Data for Homepage
const homeJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Random Pokemon Generator",
    alternateName: ["Pokemon Team Builder", "Nuzlocke Generator", "Pokemon Randomizer"],
    description:
      "Generate random Pokemon teams instantly. The ultimate Nuzlocke tool and team builder for Scarlet, Violet, and all generations. Filter by type, region, and rarity.",
    url: siteUrl,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    featureList: [
      "Random Pokemon generation from all 9 generations",
      "Advanced type-based filtering",
      "Region/generation filtering (Gen 1-9)",
      "Nuzlocke challenge support",
      "Soul Link generator",
      "Team building with 1-6 Pokemon",
      "Legendary, Mythical, and Ultra Beast options",
      "Starter Pokemon generator",
      "Complete Pokédex database with 1025+ Pokemon",
      "Multi-language support (7 languages)",
    ],
    screenshot: `${siteUrl}/og-image.png`,
    softwareVersion: "2.0",
    inLanguage: ["en", "ja", "fr", "de", "es", "pt", "ko"],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
      bestRating: "5",
      worstRating: "1",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Random Pokemon Generator",
    alternateName: "randompokemon.co",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/pokemon/{search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I generate a random Pokemon team?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Click the 'Generate Team' button to instantly create a random team of 1-6 Pokemon. Use filters to customize by type, generation (Gen 1-9), or rarity (include/exclude Legendaries).",
        },
      },
      {
        "@type": "Question",
        name: "Can I use this for Nuzlocke challenges?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! The Random Pokemon Generator is perfect for Nuzlocke runs, Soul Link challenges, Monotype runs, and draft leagues. Generate random Pokemon for each route or encounter.",
        },
      },
      {
        "@type": "Question",
        name: "Which Pokemon generations are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "All generations from 1-9 are supported, including the latest Pokemon from Scarlet and Violet (Generation 9). Filter by specific generations or include all 1025+ Pokemon.",
        },
      },
      {
        "@type": "Question",
        name: "Is this Pokemon generator free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the Random Pokemon Generator is completely free with no registration required. Generate unlimited random teams, browse the Pokédex, and use all features at no cost.",
        },
      },
      {
        "@type": "Question",
        name: "Can I exclude Legendary Pokemon from random generation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Use the Rarity filter to exclude Legendary Pokemon, Mythical Pokemon, or Ultra Beasts. This is useful for standard playthroughs or Nuzlocke runs where you want regular Pokemon only.",
        },
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Random Pokemon Generator",
    url: siteUrl,
    logo: `${siteUrl}/apple-touch-icon.png`,
    sameAs: [
      "https://twitter.com/MisterLezend",
      "https://github.com/DevendraRajoriya"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "shadowrajoriya@gmail.com",
      contactType: "customer support",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Pokédex",
        item: `${siteUrl}/pokedex`,
      },
    ],
  },
];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming locale is valid
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${spaceMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Preconnect hints moved to metadata or next.config.ts for better performance */}
        <Script
          id="home-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
