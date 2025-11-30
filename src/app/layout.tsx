import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "600", "700"], // Reduced weights for faster loading
  display: "swap", // Prevent FOIT (Flash of Invisible Text)
  preload: true,
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: true,
});

const siteUrl = "https://randompokemon.co";

// Viewport configuration for mobile optimization
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FBE9BB",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Random Pokemon Generator | Build Your Team (Gen 1-9)",
  description:
    "Generate random Pokemon teams instantly. The ultimate Nuzlocke tool and team builder for Scarlet, Violet, and all generations. Filter by type, region, and rarity.",
  keywords: [
    "random pokemon",
    "random pokemon generator",
    "pokemon team builder",
    "nuzlocke generator",
    "pokemon randomizer",
    "random pokemon team",
    "pokemon team generator",
    "scarlet violet team builder",
    "pokemon picker",
    "random starter pokemon",
    "pokemon draft league",
    "soullink generator",
    "pixel art pokemon",
  ],
  authors: [{ name: "Random Pokemon Generator" }],
  creator: "Random Pokemon Generator",
  publisher: "Random Pokemon Generator",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Random Pokemon Generator",
    title: "Random Pokemon Generator | Build Your Team (Gen 1-9)",
    description:
      "Generate random Pokemon teams instantly. The ultimate Nuzlocke tool and team builder for Scarlet, Violet, and all generations. Filter by type, region, and rarity.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Random Pokemon Generator - Build Your Dream Team",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Random Pokemon Generator | Build Your Team (Gen 1-9)",
    description:
      "Generate random Pokemon teams instantly. The ultimate Nuzlocke tool and team builder for Scarlet, Violet, and all generations. Filter by type, region, and rarity.",
    images: ["/og-image.png"],
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
    apple: "/apple-touch-icon.png",
  },
};

// JSON-LD Structured Data for Homepage
const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Random Pokemon Protocol",
  description:
    "Generate random Pokemon teams instantly. The ultimate Nuzlocke tool and team builder for Scarlet, Violet, and all generations. Filter by type, region, and rarity.",
  url: siteUrl,
  applicationCategory: "Utility",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${spaceMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
