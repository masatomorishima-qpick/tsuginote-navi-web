import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://tsuginotenavi.jp/sitemap.xml",
    host: "https://tsuginotenavi.jp",
  };
}