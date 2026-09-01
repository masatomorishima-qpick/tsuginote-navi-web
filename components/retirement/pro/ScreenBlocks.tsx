/**
 * components/retirement/pro/ScreenBlocks.tsx
 *   ── 画面9〜12の**かたまりを並べる**（5画面で共通）
 *
 * **ここは並べるだけです。**値は `gamenBun.ts` の `kumitate()` が入れ終えています。
 * 文言は基準HTMLのままで、**こちらが書き直してはいけません**（§2の8）。
 *
 * ──────────────────────────────────────────────────────────
 * 【帯（「まだお見せできないところがあります」）── 本番には出しません】
 *
 *   戦術Coworkのお願い（2026-08-23）
 *     「**『消えるはず』ではなく、『残っていたら止まる』形にしてください。**
 *      このプロジェクトで繰り返し起きているのは、**黙って残る／黙って落ちる**形です。」
 *
 *   判断ログ83②で「`data-mada` が0になるまで本番化しない」と決めています。
 *   ですので**本番で出せないかたまりがあること自体が、あってはならない状態**です。
 *
 *   | | 出せないかたまり 0個 | 1個以上 |
 *   |---|---|---|
 *   | 開発中（`NEXT_PUBLIC_PRO_KAIHATSU=1`） | ふつうに描く | **帯を出す** |
 *   | **本番**（フラグなし） | ふつうに描く | **例外で止まる** |
 *
 *   **19,800円をお支払いいただいた方に「まだお見せできないところがあります」とは出せません。**
 *   短い画面を黙って出すのは、もっといけません。**ですので止めます。**
 *
 *   帯の文は**開発中の分岐の中だけ**にあります。本番のビルドでは1文字も出ません
 *   （`kensa/obi_test.tsx` で、出ていないことまで当てています）。
 * ──────────────────────────────────────────────────────────
 */

'use client';

import type { BlockKyotsu, Kumi } from './gamenBun';

/**
 * 開発中かどうか。**本番のビルドでは立ちません。**
 *
 * **関数にしてあるのは、検査で両方の側を当てるためです。**
 * Next.js は `process.env.NEXT_PUBLIC_*` をビルドのときに埋め込むので、
 * 本番のビルドではここが `false` に固定され、**下の帯の分岐ごと消えます。**
 */
export const kaihatsuChu = (): boolean => process.env.NEXT_PUBLIC_PRO_KAIHATSU === '1';

/** 開発中の帯の文。**利用者に見せる文ではありません**（戦術Coworkの線引き・2026-08-23） */
export const OBI_BUN = 'この画面には、まだお見せできないところが';

function Hitotsu({ b }: { b: BlockKyotsu }) {
  if (b.kind === 'midashi') return b.lv === 2 ? <h2>{b.bun}</h2> : <h3>{b.bun}</h3>;
  if (b.kind === 'hon') return <p className="hon">{b.bun}</p>;
  if (b.kind === 'kousin') return <div className="src">{b.bun}</div>;
  if (b.kind === 'hako') {
    // 基準HTMLの `<br>` は、抜き出しのときに改行になっています
    return (
      <div className="box plain hon">
        {b.bun.split('\n').map((l, i) => <div key={i}>{l}</div>)}
      </div>
    );
  }
  if (b.kind === 'ret') {
    return <ul>{b.koumoku.map((k, i) => <li key={i}>{k.bun}</li>)}</ul>;
  }
  return (
    <table>
      <tbody>
        {b.gyou.map((g, i) => (
          <tr key={i}>
            {g.cells.map((c, j) => (
              // 2つめ以降のセルは数字なので右寄せ（基準HTMLの `class="n"` と同じ）
              <td key={j} className={j === 0 ? undefined : 'n'}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ScreenBlocks({ kumi }: { kumi: Kumi }) {
  if (kumi.ochita > 0 && !kaihatsuChu()) {
    throw new Error(
      `**本番化してはいけないものが、本番のビルドに出ています。**\n`
      + `  出せなかったかたまり ${kumi.ochita}個`
      + `（エンジンに出口が無い ${kumi.ochitaMada}個／その方に存在しない ${kumi.ochitaNashi}個）\n`
      + `  出口が無い名前： ${kumi.ochitaNa.join(' ') || '（なし）'}\n`
      + '  判断ログ83②「`data-mada` が0になるまで本番化しない」。\n'
      + '  短い画面を黙って出さないために、ここで止めます。',
    );
  }
  return (
    <>
      {kumi.dasu.map((b, i) => <Hitotsu key={i} b={b} />)}
      {kaihatsuChu() && kumi.ochita > 0 && (
        <div className="note" data-kaihatsu-obi>
          {OBI_BUN}{kumi.ochita}か所あります。準備ができ次第、お見せします。
        </div>
      )}
    </>
  );
}
