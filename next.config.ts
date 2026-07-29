import type { NextConfig } from "next";

/**
 * Next.js 設定
 *
 * リダイレクト方針:
 *   - "/" はサイトのトップページ（2026-07-30 に実体化。住宅ローンとお金の判断の入口）。
 *
 *   - 相続放棄・相続手続き・死亡後手続き・実家片付けは、2026-07-30 に転送先を
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
const nextConfig: NextConfig = {
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
      // ※ /guide/ihinseiri/digitalihin-* は残置（リダイレクトしない）
      // ※ /digital/*, /login, /auth/*, /privacy, /terms, /company も残置
    ];
  },
};

export default nextConfig;
