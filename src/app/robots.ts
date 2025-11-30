import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://www.randompokemon.co/sitemap.xml",
    host: "https://www.randompokemon.co",
  };
}
