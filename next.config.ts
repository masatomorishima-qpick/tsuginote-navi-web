import type { NextConfig } from "next";

/**
 * Next.js 設定
 *
 * リダイレクト方針:
 *   - "/" はサイトのトップページ（2026-07-29 に実体化。住宅ローンとお金の判断の入口）。
 *
 *   - 相続放棄・相続手続き・死亡後手続き・実家片付けは、2026-07-29 に転送先を
 *     "/" から **"/guide/ihinseiri"（遺品整理・実家片付け 役立ち情報一覧）** に変更した。
 *     これらのURLから来る人はすでに「亡くなった後」の状況にあり、生前準備が中心の
 *     "/guide" やトップに送ると目的とずれるため。ファイルは削除せず残置する。
 *
 *   - /demo/* だけは "/" のまま（アンケートのデモで、内容の受け皿がないため）。
 *
 *   - /guide/ihinseiri/digitalihin-* は「デジタル遺品」の解説記事として
 *     残置（公開ページとして使えるため）。
 *
 *   - /api/track, /api/events, /api/survey/* も残置（呼び出し元が無くなるが
 *     ファイル削除はせず、後で整理）。
 */
/**
 * 配布物（PDF・エクセル・ワード）の正規のページ（2026-11-16）。
 * 検索の28日間（10/18〜11/14）で /downloads/souzoku-shinkoku-shorui.pdf が表示74・12.6位と、PDF そのものが検索に出ていた。
 * PDF から来た人は紹介先のあるページを通らないため、HTTP の Link ヘッダーで「このファイルの正規のページはここ」と伝え、評価をページへ寄せる。
 * 配布物を足したら、ここにも1行足す。
 * 2026-11-20 11/16 以降に足した配布物8本（相続5・保険3）が抜けていたので足した。
 */
const DOWNLOAD_CANONICAL: [string, string][] = [
  ['souzoku-isan-bunkatsu-kyogisho', '/guide/souzoku/isan-bunkatsu-kyogisho'],
  ['souzoku-kankei-setsumeizu', '/guide/souzoku/souzoku-kankei-setsumeizu'],
  ['souzoku-zaisan-mokuroku', '/guide/souzoku/zaisan-mokuroku'],
  ['souzoku-akiya-tokurei-check', '/guide/souzoku/jikka-akiya-tokurei'],
  ['souzoku-tetsuzuki-checklist', '/guide/souzoku/tetsuzuki-checklist'],
  ['souzoku-shinkoku-shorui', '/guide/souzoku/shinkoku-shorui-checklist'],
  ['souzoku-hokenkin-hikazei', '/guide/souzoku/shibou-hokenkin-hikazei'],
  ['souzoku-houtei-souzokubun', '/guide/souzoku/houtei-souzokubun'],
  ['souzoku-touki-shorui', '/guide/souzoku/touki-shorui'],
  ['souzoku-junkakutei-shorui', '/guide/souzoku/junkakutei-checklist'],
  ['souzoku-zaisan-shirabekata', '/guide/souzoku/zaisan-shirabekata'],
  ['souzoku-koseki-atsumekata', '/guide/souzoku/koseki-atsumekata'],
  ['souzoku-shinkoku-jibun', '/guide/souzoku/shinkoku-jibun'],
  ['souzoku-souzokunin-shinkoku-touki', '/guide/souzoku/souzokunin-shinkoku-touki'],
  ['souzoku-seizen-zouyo-kasan', '/guide/souzoku/seizen-zouyo-kasan'],
  ['souzoku-shokibo-takuchi-shorui', '/guide/souzoku/shokibo-takuchi-shorui'],
  ['souzoku-miseinen-shougaisha-kojo', '/guide/souzoku/miseinen-shougaisha-kojo'],
  ['souzoku-souji-souzoku-kojo', '/guide/souzoku/souji-souzoku-kojo'],
  ['souzoku-niwari-kasan', '/guide/souzoku/niwari-kasan'],
  ['souzoku-shibou-taishokukin-hikazei', '/guide/souzoku/shibou-taishokukin-hikazei'],
  ['souzoku-zero-en-shinkoku', '/guide/souzoku/zero-en-shinkoku'],
  ['souzoku-shinkoku-okure', '/guide/souzoku/shinkoku-okure'],
  ['souzoku-shinkoku-tojikata', '/guide/souzoku/shinkoku-tojikata'],
  ['hoken-keiyaku-ichiran', '/guide/shisan-kanri/hoken-ichiran-excel'],
  ['hoken-hikaku', '/guide/shisan-kanri/hoken-hikaku-excel'],
  ['hoken-minaoshi-checklist', '/guide/shisan-kanri/hoken-minaoshi-checklist'],
  ['hoken-minaoshi-kekkon', '/guide/shisan-kanri/hoken-minaoshi-kekkon'],
  ['hoken-minaoshi-shussan', '/guide/shisan-kanri/hoken-minaoshi-shussan'],
  ['hoken-shoken-kakiutsushi', '/guide/shisan-kanri/hoken-shoken-mikata'],
  ['hoken-minaoshi-teinen', '/guide/shisan-kanri/hoken-minaoshi-teinen'],
  ['hoken-minaoshi-danshin', '/guide/shisan-kanri/hoken-minaoshi-danshin'],
  ['hoken-minaoshi-dokuritsu', '/guide/shisan-kanri/hoken-minaoshi-dokuritsu'],
  ['hoken-minaoshi-rikon', '/guide/shisan-kanri/hoken-minaoshi-rikon'],
  ['houjin-kouza-check', '/guide/houjin/kouza-tsukurenai'],
  ['kyutoki-hiyou-meyasu', '/kyutoki/kokan-hiyou'],
  ['kyutoki-mitsumori-check', '/kyutoki/mitsumori-mikata'],
  ['kyutoki-gosu', '/kyutoki/gosu-erabikata'],
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      ...DOWNLOAD_CANONICAL.map(([file, page]) => ({
        source: `/downloads/${file}.:ext(pdf|xlsx|docx)`,
        headers: [{ key: 'Link', value: `<https://www.tsuginotenavi.jp${page}>; rel="canonical"` }],
      })),
      // 2026-11-16 共有用の画像（/og?title=…）は検索に載せない。Search Console の「クロール済み - インデックス未登録」41件のうち15件がこの画像だった。
      // SNS が画像を読む妨げにならないよう、robots.txt で止めずに X-Robots-Tag で検索から外す。
      { source: '/og', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] },
    ];
  },
  async redirects() {
    return [
      // 1. 相続放棄解説ページ
      {
        source: "/souzoku-houki",
        destination: "/guide/ihinseiri",
        permanent: true,
      },
      // 2. 相続手続きページ
      {
        source: "/souzoku-tetsuzuki",
        destination: "/guide/ihinseiri",
        permanent: true,
      },
      // 3. 死亡後手続きページ
      {
        source: "/shibougo-tetsuzuki",
        destination: "/guide/ihinseiri",
        permanent: true,
      },
      // 4. アンケートデモ系（/demo/[area]/[category]/results 等を全部）
      {
        source: "/demo/:path*",
        destination: "/",
        permanent: true,
      },
      // 5.（2026-06-06 解除）/guide は「役立ちガイドTOP」として復活。
      //    新方針カテゴリ（digital-seiri / password-kanri 等）のハブページ。
      //    旧・相続混在インデックスは廃止し、app/guide/page.tsx を新TOPに差し替え済み。
      // 5a. 実家片付けガイド（/guide/jikka-kataduke/...）
      {
        source: "/guide/jikka-kataduke/:path*",
        destination: "/guide/ihinseiri",
        permanent: true,
      },
      // 6. 地域別パラメトリックページ（/tokyo/souzoku-houki, /tokyo/souzoku-houki/start 等）
      //    [area]/[category] 配下は相続放棄系のみなので全面的に / へ寄せる。
      {
        source: "/:area/souzoku-houki",
        destination: "/guide/ihinseiri",
        permanent: true,
      },
      {
        source: "/:area/souzoku-houki/start",
        destination: "/guide/ihinseiri",
        permanent: true,
      },
      {
        source: "/:area/souzoku-houki/results",
        destination: "/guide/ihinseiri",
        permanent: true,
      },
      // 7. 給湯器 B（自社の取り次ぎ）の終了（2026-11-09、オーナー決定）。
      //    見積もりのページは「準備中」のボタンが残るため、内容の近い記事へ一時的に転送する。
      //    ページのファイルは残す（再開するときはこの3行を消す）。経緯は docs/kyutoki-b/measure.md（枝 docs/listing-rules）。
      {
        source: "/kyutoki/mitsumori",
        destination: "/kyutoki/kokan-hiyou",
        permanent: false,
      },
      {
        source: "/kyutoki/mitsumori/hiyou",
        destination: "/kyutoki/kokan-hiyou",
        permanent: false,
      },
      {
        source: "/kyutoki/mitsumori/jumyo",
        destination: "/kyutoki/nensu",
        permanent: false,
      },
      // 8. Google が読んだのに登録しなかった古いページの整理（2026-11-17、オーナー了承「悪影響するなら消して良い」）。
      //    条件：Search Console で「クロール済み - インデックス未登録」、直近3か月の検索の表示が10回以下、紹介先の出口なし、
      //    他のページの根拠（調査のページなど）になっていない。いちばん近い内容のページへ転送する（リンクの評価と訪問者を逃がさない）。
      { source: "/guide/column/pet-omoide-5shukan", destination: "/guide/column", permanent: true },
      { source: "/guide/column/kodomo-omoide-5shukan", destination: "/guide/column", permanent: true },
      { source: "/guide/column/sumaho-shuyaku-5sen", destination: "/guide/column", permanent: true },
      { source: "/guide/column/saifu-hikidashi-5sen", destination: "/guide/column", permanent: true },
      { source: "/guide/column/subsuku-kaiyaku-riyu", destination: "/guide/digital-seiri/sabusuku-kanri", permanent: true },
      { source: "/guide/oya-care/oya-netbank", destination: "/guide/digital-shisan", permanent: true },
      { source: "/guide/oya-care", destination: "/guide/digital-shisan", permanent: true },
      { source: "/guide/password-kanri/nidankai-ninsho", destination: "/guide/password-kanri/sumaho-password", permanent: true },
      { source: "/guide/ihinseiri/digitalihin-006", destination: "/guide/ihinseiri/digitalihin-005", permanent: true },
      // ※ /guide/ihinseiri/digitalihin-* は 006 以外は残置（リダイレクトしない）
      // ※ /digital/*, /login, /auth/*, /privacy, /terms, /company も残置
    ];
  },
};

export default nextConfig;
