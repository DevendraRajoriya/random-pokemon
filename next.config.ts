import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/PokeAPI/sprites/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // Cache images for 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200], // Optimized for common mobile/tablet sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Smaller icon sizes
  },
  // Enable compression
  compress: true,
  // Optimize production builds
  poweredByHeader: false,
  // Optimize React for production
  reactStrictMode: true,
  // Cache static assets
  headers: async () => [
    {
      source: "/:all*(svg|jpg|png|webp|avif|ico)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      source: "/:all*(js|css)",
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
      ],
    },
  ],
};

export default nextConfig;
