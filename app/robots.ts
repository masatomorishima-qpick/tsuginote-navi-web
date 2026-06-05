import type { MetadataRoute } from "next";

/**
 * robots.txt — クロール許可と認証エリアの除外
 *
 * /digital/* は認証エリアなので明示的に Disallow にしてもよいが、
 * すべて 302 で /login に飛ぶ設計のため allow のままでも実害はない。
 * 念のため /digital と認証コールバックは disallow にしておく。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/digital/", "/auth/", "/api/"],
    },
    sitemap: "https://www.tsuginotenavi.jp/sitemap.xml",
    host: "https://www.tsuginotenavi.jp",
  };
}
