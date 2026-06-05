/**
 * /digital/* 共通のローディング画面（スケルトン）
 *
 * Next.js の loading.tsx 規約：このファイルを置くだけで、/digital 配下の
 * ページ間を移動する際、データ取得が終わるまでの間この骨組みが即座に
 * 表示される。これまでは次のページが完成するまで前の画面のまま固まって
 * 見えていたため、「反応していない」と感じる主因になっていた。
 *
 * 実際の取得速度は変わらないが、クリック直後に画面が切り替わることで
 * 体感速度が大きく改善する。
 */

export default function DigitalLoading() {
  return (
    <div
      className="min-h-screen bg-[#F5F5F0]"
      role="status"
      aria-label="読み込み中"
    >
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* 見出しのスケルトン */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200" />
        </div>

        {/* カードのスケルトン × 3 */}
        <div className="space-y-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-white p-4"
            >
              <div className="mb-4 h-5 w-32 animate-pulse rounded bg-gray-200" />
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">読み込み中…</p>
      </div>
    </div>
  );
}
