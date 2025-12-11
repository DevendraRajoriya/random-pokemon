import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Enable standalone output for optimized Docker/Heroku deployment
  output: 'standalone',
  
  // Turbopack configuration
  turbopack: {
    // Ensure consistent root directory
    root: __dirname,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/PokeAPI/sprites/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // Cache images for 1 year (immutable sprites)
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  
  // Enable compression
  compress: true,
  
  // Security headers
  poweredByHeader: false,
  
  // React strict mode for better development
  reactStrictMode: true,
  
  // Experimental features for better performance
  experimental: {
    // Enable optimized CSS
    optimizeCss: true,
    // Optimize package imports (tree-shaking)
    optimizePackageImports: ['lucide-react', 'next-intl'],
  },
  
  // Cache static assets with long TTL
  headers: async () => [
    {
      source: "/:all*(svg|jpg|png|webp|avif|ico|woff|woff2)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      source: "/_next/static/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      source: "/:path*",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
      ],
    },
  ],
};

export default withNextIntl(nextConfig);
