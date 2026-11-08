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
      // 2026-07-29：TOP を実体化したので sitemap に載せる（リダイレクト廃止）。
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    // 2026-11-04 削除：家計診断・住宅ローン・退職金・ジム・トレンド速攻（売上がなく検索も少ないためページごと削除。docs/site-top.md）。
    // 給湯器の交換費用（記事型、2026-10-31 新設）。2026-11-04 に検索からの集客の親ページとして載せる
    // （docs/kyutoki-seo/plan.md の P1。それまで sitemap に載っていなかった）。
    {
      url: `${baseUrl}/kyutoki/kokan-hiyou`,
      lastModified: new Date("2026-11-04T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 給湯器の配布物のページ（2026-11-04 新設、docs/kyutoki-seo/plan.md の P2・P3）。
    {
      url: `${baseUrl}/kyutoki/mitsumori-mikata`,
      lastModified: new Date("2026-11-04T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kyutoki/gosu-erabikata`,
      lastModified: new Date("2026-11-04T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 相続の配布物のページ（2026-11-05 新設、docs/haifu-plan.md）。
    {
      url: `${baseUrl}/guide/souzoku/isan-bunkatsu-kyogisho`,
      lastModified: new Date("2026-11-05T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/souzoku/souzoku-kankei-setsumeizu`,
      lastModified: new Date("2026-11-05T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/souzoku/zaisan-mokuroku`,
      lastModified: new Date("2026-11-05T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide/souzoku/jikka-akiya-tokurei`,
      lastModified: new Date("2026-11-05T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 給湯器の事情ごとのページ（2026-11-05 公開、docs/kyutoki-seo/schedule.md の P11・P15）。
    {
      url: `${baseUrl}/kyutoki/mitsumori-takai`,
      lastModified: new Date("2026-11-05T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kyutoki/sokujitsu`,
      lastModified: new Date("2026-11-05T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kyutoki/shiharai`,
      lastModified: new Date("2026-11-05T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kyutoki/mansion`,
      lastModified: new Date("2026-11-05T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kyutoki/furo`,
      lastModified: new Date("2026-11-06T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kyutoki/kodate`,
      lastModified: new Date("2026-11-06T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kyutoki/nensu`,
      lastModified: new Date("2026-11-07T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kyutoki/maker`,
      lastModified: new Date("2026-11-07T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 給湯器の事情ごとのページ（2026-11-08 公開、P9 エコジョーズ・P7 暖房付き）。
    {
      url: `${baseUrl}/kyutoki/ecojozu`,
      lastModified: new Date("2026-11-08T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kyutoki/danbo`,
      lastModified: new Date("2026-11-08T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 給湯器のエラー番号の早見（2026-11-08 作成、docs/seisaku-queue.md の P17）。
    {
      url: `${baseUrl}/kyutoki/error`,
      lastModified: new Date("2026-11-08T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 給湯器の型番の見方（2026-11-08 作成、docs/seisaku-queue.md の P10）。
    {
      url: `${baseUrl}/kyutoki/kataban`,
      lastModified: new Date("2026-11-08T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 給湯器「お湯が出ない」診断（2026-10-28 新設）。検索広告の着地ページだが、
    // 本文（目安表・FAQ）はサーバー出力なので自然検索にも載せる。
    {
      url: `${baseUrl}/kyutoki/oyu-ga-denai`,
      lastModified: new Date("2026-10-28T09:00:00+09:00"),
      changeFrequency: "monthly",
      priority: 0.7,
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
      // 2026-07-30 追加：中立性ポリシー（広告掲載と運営の方針）。ASP広告の掲載開始前に
      // 公開する静的ページ。記事ではないため、
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
