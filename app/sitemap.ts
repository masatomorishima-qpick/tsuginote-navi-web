import type { MetadataRoute } from "next";
import { LOAN_ARTICLES } from "@/lib/loan/articles";
import { RETIREMENT_ARTICLES } from "@/lib/retirement/articles";

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
      // 2026-07-29：TOP を実体化したので sitemap に載せる（リダイレクト廃止）。
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shisan`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // 住宅ローン（2026-07-28 新設 → 07-29 レジストリ参照に変更）。
    // 記事は lib/loan/articles.ts に1件足すだけでここにも自動で載る。
    // 中カテゴリ /loan/karikae は 2026-07-29 に廃止（middleware で /loan へ301）。
    {
      url: `${baseUrl}/loan`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...LOAN_ARTICLES.map((a) => ({
      url: `${baseUrl}${a.path}`,
      lastModified: new Date(`${a.dateModified}T09:00:00+09:00`),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    // 退職金・年金（2026-08-03 新設・駅1）。/loan と同じくレジストリ参照。
    // 記事は lib/retirement/articles.ts に1件足すだけでここにも自動で載る。
    {
      url: `${baseUrl}/retirement`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // 受け取り方シミュレーション（無料版・2026-08-31 新設）。
    // /retirement/pro/result と /retirement/pro/buy は載せない（どちらも noindex）。
    {
      url: `${baseUrl}/retirement/pro`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...RETIREMENT_ARTICLES.map((a) => ({
      url: `${baseUrl}${a.path}`,
      lastModified: new Date(`${a.dateModified}T09:00:00+09:00`),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
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
      // 2026-07-30 追加：中立性ポリシー（広告掲載と運営の方針）。ASP広告の掲載開始前に
      // 公開する静的ページ。記事ではないためレジストリ（lib/loan/articles.ts）には載せず、
      // 他の静的ページ（/privacy 等）と同じ扱いにする。
      url: `${baseUrl}/policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    // 役立ちガイドTOP（コンテンツのハブ）
    {
      url: `${baseUrl}/guide`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    // デジタル資産ピラー（整理・引き継ぎハブ）
    {
      url: `${baseUrl}/guide/digital-shisan`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 調査データ（一次ソース・被引用の核）
    {
      url: `${baseUrl}/guide/research`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
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
    {
      url: `${baseUrl}/guide/digital-seiri/sumaho-shashin-seiri`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/digital-seiri/mail-seiri`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/digital-seiri/sabusuku-kanri`,
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
    {
      url: `${baseUrl}/guide/password-kanri/nidankai-ninsho`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 家族間の情報共有（本命ジャンル）
    {
      url: `${baseUrl}/guide/kazoku-kyoyu`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guide/kazoku-kyoyu/fuufu-joho-kyoyu`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/kazoku-kyoyu/password-account-kyoyu`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/kazoku-kyoyu/joho-kyoyu-hikaku`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 資産・お金の管理
    {
      url: `${baseUrl}/guide/shisan-kanri`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guide/shisan-kanri/hoken-ichiran-excel`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/shisan-kanri/toshi-kazoku`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 親・家族のケア
    {
      url: `${baseUrl}/guide/oya-care`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guide/oya-care/oya-netbank`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // もしもの備え
    {
      url: `${baseUrl}/guide/moshimo-sonae`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guide/moshimo-sonae/kyu-nyuin-sonae`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // コラム（提言型読み物）
    {
      url: `${baseUrl}/guide/column`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guide/column/subsuku-kaiyaku-riyu`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/column/okane-kanri-kichinto`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/column/saifu-hikidashi-5sen`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/column/kodomo-omoide-5shukan`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/column/sumaho-shuyaku-5sen`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/column/pet-omoide-5shukan`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
