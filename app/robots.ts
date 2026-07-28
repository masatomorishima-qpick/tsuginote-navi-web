import type { MetadataRoute } from "next";

/**
 * robots.txt — クロール許可と認証エリアの除外
 *
 * /digital/* は認証エリアなので Disallow を維持（2026-07-15 のピボットで noindex も付与済み）。
 *
 * 2026-07-28：AIクローラー（GPTBot / ClaudeBot / PerplexityBot 等）を明示的に Allow。
 * 多くのサイトがこれらをブロックしているため、明示的な許可自体が相対的な優位になる。
 * 許可する場合も、認証エリア（/digital/・/auth/）とAPIは全クローラー共通で除外する。
 */

/** AIクローラー・AI検索のユーザーエージェント（明示的に許可する） */
const AI_CRAWLERS = [
  "GPTBot",             // OpenAI（クロール）
  "ChatGPT-User",       // ChatGPT のユーザー起点アクセス
  "OAI-SearchBot",      // OpenAI の検索インデックス
  "ClaudeBot",          // Anthropic（クロール）
  "Claude-User",        // Claude のユーザー起点アクセス
  "Claude-SearchBot",   // Anthropic の検索インデックス
  "PerplexityBot",      // Perplexity
  "Perplexity-User",    // Perplexity のユーザー起点アクセス
  "Google-Extended",    // Google（Gemini 等での利用可否）
  "Applebot-Extended",  // Apple（生成AI での利用可否）
  "CCBot",              // Common Crawl
  "Bytespider",         // ByteDance
  "meta-externalagent", // Meta
];

const DISALLOW = ["/digital/", "/auth/", "/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_CRAWLERS.map((ua) => ({ userAgent: ua, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: "https://www.tsuginotenavi.jp/sitemap.xml",
    host: "https://www.tsuginotenavi.jp",
  };
}
