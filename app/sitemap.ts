import type { MetadataRoute } from "next";

/**
 * sitemap.xml — Phase 1 ローンチ準備にあわせて刷新
 *
 * 方針:
 *   - 旧サイトマップにあった相続放棄系（/souzoku-houki, /souzoku-tetsuzuki, /shibougo-tetsuzuki）は
 *     301 リダイレクトで "/" に集約済みのため sitemap からは除外する。
 *   - デジタル資産（つぎの手ナビ デジタル資産）の TOP / プライバシー / 利用規約 /
 *     会社情報、および残置中のデジタル遺品ガイド（/guide/ihinseiri/...）を掲載。
 *   - /digital/* は認証必須なので sitemap には含めない。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.tsuginotenavi.jp";

  const digitalLegacyGuideSlugs = [
    "digitalihin-001",
    "digitalihin-002",
    "digitalihin-003",
    "digitalihin-004",
    "digitalihin-005",
    "digitalihin-006",
    "digitalihin-007",
    "digitalihin-008",
  ];

  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/company`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/guide/ihinseiri`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...digitalLegacyGuideSlugs.map((slug) => ({
      url: `${baseUrl}/guide/ihinseiri/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    // デジタル整理術（前向き整理の新方針記事。転換導線の主力のため priority 高め）
    {
      url: `${baseUrl}/guide/digital-seiri`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guide/digital-seiri/digital-dansyari`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/digital-seiri/account-seiri`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/digital-seiri/sumaho-kakin-seiri`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // パスワード・認証管理
    {
      url: `${baseUrl}/guide/password-kanri`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guide/password-kanri/sumaho-password`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
