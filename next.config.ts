import type { NextConfig } from "next";

/**
 * Next.js 設定
 *
 * リダイレクト方針（Phase 1 ローンチ準備）:
 *   - "/" は新 TOP ページ（デジタル資産ランディング）として動作させる。
 *     旧 "/" → "/tokyo/souzoku-houki/start" のリダイレクトは廃止。
 *
 *   - 相続放棄系コンテンツは SEO 流入を切り、"/" へ 301（permanent）で集約する。
 *     ファイルは削除せず残置（Phase 2 以降で参照する可能性に備える）が、
 *     公開導線からは完全に外れる。
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
        destination: "/",
        permanent: true,
      },
      // 2. 相続手続きページ
      {
        source: "/souzoku-tetsuzuki",
        destination: "/",
        permanent: true,
      },
      // 3. 死亡後手続きページ
      {
        source: "/shibougo-tetsuzuki",
        destination: "/",
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
        destination: "/",
        permanent: true,
      },
      // 6. 地域別パラメトリックページ（/tokyo/souzoku-houki, /tokyo/souzoku-houki/start 等）
      //    [area]/[category] 配下は相続放棄系のみなので全面的に / へ寄せる。
      {
        source: "/:area/souzoku-houki",
        destination: "/",
        permanent: true,
      },
      {
        source: "/:area/souzoku-houki/start",
        destination: "/",
        permanent: true,
      },
      {
        source: "/:area/souzoku-houki/results",
        destination: "/",
        permanent: true,
      },
      // ※ /guide/ihinseiri/digitalihin-* は残置（リダイレクトしない）
      // ※ /digital/*, /login, /auth/*, /privacy, /terms, /company も残置
    ];
  },
};

export default nextConfig;
