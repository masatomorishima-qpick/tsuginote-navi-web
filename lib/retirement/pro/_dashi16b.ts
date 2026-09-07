// ★★★この本は、アプリから1か所も呼ばれません。`engine.ts` の当てのためだけに在ります。
//   ★★**写しを当てても、当てているのは写しです** ── ★ですので、
//     ★本物の `./engine` を読み込むために、この場所に置いています
//     （★2026-09-06・戦術Cowork `senjutsu_20260906p.md`）。
//   ★何をする本か …… ★2つのメソッドの答えを書き出すだけ（★当てるのは Python 側の `ate16.py`）。
//   ★★`_dashi16` を読み込んでいる本は、repo に **0本**です（★`node_modules` を除く）。
// ★★TypeScript 側の2つのメソッド（`hokenKojoShotoku` / `hokenKojoJumin`）の答えを書き出すだけの本
//   ★入れる7つ組は Python が作った `in16.jsonl` を読みます（★両側が**同じ入れ物**を見ます）
import * as fs from 'fs';
import { Jinbutsu } from './engine';
const NA = ['hoken_shin_ippan', 'hoken_kyu_ippan', 'hoken_kaigo', 'hoken_shin_nenkin',
            'hoken_kyu_nenkin', 'jishin_kojo', 'kyu_chouki'] as const;
const lines = fs.readFileSync('in16.jsonl', 'utf-8').split('\n').filter((x) => x.trim());
const out: string[] = [];
for (const line of lines) {
  const v = JSON.parse(line) as number[];
  const init: Record<string, number> = { seinen: 1963 };
  NA.forEach((n, i) => { init[n] = v[i]; });
  const p = new Jinbutsu(init as never);
  try {
    out.push(JSON.stringify([p.hokenKojoShotoku(), p.hokenKojoJumin()]));
  } catch (e) {
    // ★★★2026-09-06・戦術Cowork `senjutsu_20260906p.md` 気になる所(1)・判断ログ744番
    //   ★★**落ちた理由を捨てません**。★捨てると「たまたま同じ42組だった」ことしか言えません。
    //   ★理由も書き出して、★**「落ちた理由が両側で同じ」ことまで当てます**。
    out.push(JSON.stringify(['ochita', String(e instanceof Error ? e.message : e).slice(0, 120)]));
  }
}
fs.writeFileSync('out16.jsonl', out.join('\n') + '\n');
process.stdout.write(`★TypeScript が ${out.length} 組の答えを書き出しました\n`);
