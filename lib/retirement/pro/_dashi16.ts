// ★★★この本は、アプリから1か所も呼ばれません。`engine.ts` の当てのためだけに在ります。
//   ★★**写しを当てても、当てているのは写しです** ── ★ですので、
//     ★本物の `./engine` を読み込むために、この場所に置いています
//     （★2026-09-06・戦術Cowork `senjutsu_20260906p.md`）。
//   ★何をする本か …… ★7つの表の答えを書き出すだけ（★当てるのは Python 側の `ate16.py`）。
//   ★★`_dashi16` を読み込んでいる本は、repo に **0本**です（★`node_modules` を除く）。
// ★★★TypeScript 側の7つの表の値を、0〜300,000 の1円きざみで**書き出す**だけの本
//   ★（★目で見比べません。★Python 側で読んで引き算します・戦術Cowork `senjutsu_20260906o.md`）
import { hokenDan, HOKEN_SHOTOKU_SHIN, HOKEN_SHOTOKU_KYU, HOKEN_JUMIN_SHIN, HOKEN_JUMIN_KYU,
         HOKEN_SHOTOKU_KYUCHOUKI, HOKEN_JUMIN_KYUCHOUKI, HOKEN_JUMIN_JISHIN } from './engine';
const HYOU: [string, typeof HOKEN_SHOTOKU_SHIN][] = [
  ['HOKEN_SHOTOKU_SHIN', HOKEN_SHOTOKU_SHIN],
  ['HOKEN_SHOTOKU_KYU', HOKEN_SHOTOKU_KYU],
  ['HOKEN_JUMIN_SHIN', HOKEN_JUMIN_SHIN],
  ['HOKEN_JUMIN_KYU', HOKEN_JUMIN_KYU],
  ['HOKEN_SHOTOKU_KYUCHOUKI', HOKEN_SHOTOKU_KYUCHOUKI],
  ['HOKEN_JUMIN_KYUCHOUKI', HOKEN_JUMIN_KYUCHOUKI],
  ['HOKEN_JUMIN_JISHIN', HOKEN_JUMIN_JISHIN],
];
const kowasu = process.env.KUZUSU === '1';
if (kowasu) {
  // ★★壊し …… 所得税・新の2段目の「足す数」を 20,000 → 10,000 に（★2026-09-06 の誤りと同じ形・760番）
  (HOKEN_SHOTOKU_SHIN as unknown as number[][])[1][1] = 10_000;
  process.stderr.write('★★KUZUSU=1 …… HOKEN_SHOTOKU_SHIN の2段目の足す数を 20,000 → 10,000 にしました\n');
}
const out: string[] = [];
for (const [na, h] of HYOU) {
  const v: number[] = [];
  for (let x = 0; x <= 300_000; x++) v.push(hokenDan(x, h));
  out.push(JSON.stringify({ na, v }));
}
process.stdout.write(out.join('\n') + '\n');
