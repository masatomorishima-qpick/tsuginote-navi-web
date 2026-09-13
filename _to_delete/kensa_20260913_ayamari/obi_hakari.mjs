/**
 * kensa/obi_hakari.mjs ── ★★帯を2通り描いて、字が1pxでも動くかを測る本
 *
 * ★姿: bin/senjutsu/tsuginote_gamen_base.html（179,553バイト ／ md5 5be20ed2ded9e44c1ecdc9ec8ba817ce）
 *
 * ★★【なぜ要るか】★戦術Cowork `senjutsu_20260905w.md`（★段4のお願い）──
 *   ★「帯を**どう引くと、字が1pxも動かないか**を、★**2つ描いて、数で**」。
 *   ★★見るもの …… ★帯が付いた行と付かない行で、★**1文字目の左からの位置が同じか**（★px で）。
 *
 * ★★【描き方】★基準HTMLを開き、★**その場で字を足して**測ります。
 *   ★★**基準HTMLには1バイトも書きません**（★足した字は、測ったあとに外します）。
 *   ★色は**描いて `getComputedStyle` で測ります**（★`<style>` を読みません・`senjutsu_20260905v.md` 6番 条件2）。
 *
 * ★★【これは門ではありません】★**札を出しません**。★測った数を並べるだけです。
 *   ★理由 …… ★帯を入れるかどうかは、★**森嶋さんと戦術Coworkの決め**です。
 *   ★★**Chromium が無いと回りません**（★お使いの Mac には入っていません ── ★器でだけ回せます）。
 *
 * 使い方: node kensa/obi_hakari.mjs
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { neWoHikuKa } from './ne_wo_hiku.mjs';

const KOKO = path.dirname(new URL(import.meta.url).pathname);
const KIJUN = neWoHikuKa(KOKO, 'kijun');
const HTML = path.join(KIJUN, 'tsuginote_gamen_base.html');

/** ★Chromium は、まず repo の `node_modules`、無ければ入っている所を見ます */
const michi = [
  path.join(neWoHikuKa(KOKO, 'repo'), 'node_modules/playwright/index.js'),
  '/home/claude/.npm-global/lib/node_modules/playwright/index.js',
].find((x) => fs.existsSync(x));
if (!michi) {
  console.log('★★Chromium（playwright）がありません ── ★この本は回りません');
  console.log('★★これは「通った」ではありません。★回らなかった、です（★戦術 `senjutsu_20260907b.md` の決め）');
  process.exit(2);
}
const pw = await import(michi);
const chromium = (pw.default ?? pw).chromium;

console.log(`★もと …… ${HTML}（${fs.statSync(HTML).size.toLocaleString('en-US')}バイト）`);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 430, height: 900 } });   // ★幅430px（`senjutsu_20260905s.md` 3番(1)）
await p.goto('file://' + HTML);

const hakaru = async () => p.evaluate(() => {
  const hi = document.querySelector('tr.hi');
  const hyo = hi.closest('table');
  const gyou = [...hyo.querySelectorAll('tr')].filter((r) => r.querySelector('td'));
  return gyou.map((r) => {
    const td = r.querySelector('td');
    const ji = td.querySelector('span, div') ?? td;
    const rr = r.getBoundingClientRect(), jr = ji.getBoundingClientRect();
    return {
      hi: r.classList.contains('hi'),
      jiLeft: +(jr.left - rr.left).toFixed(2),
      takasa: +rr.height.toFixed(2),
      ji: (ji.textContent ?? '').slice(0, 10),
      chi: getComputedStyle(td).backgroundColor,
    };
  });
});

const moto = await hakaru();
console.log('\n★いまの姿（★帯なし）');
for (const g of moto) console.log(`   ${g.hi ? '帯を付けたい行' : 'ふつうの行　　'}　1文字目の左 ${g.jiLeft}px ／ 高さ ${g.takasa}px ／ 地 ${g.chi}　［${g.ji}］`);

/** ★2通り。★どちらも `--accent`（#0f5f4e）の 4px です */
const TAMESHI = [
  ['ア　`border-left` ＋ `padding-left` を4px減らす',
   'table tr.hi td:first-child{border-left:4px solid #0f5f4e;padding-left:6px}'],
  ['イ　`box-shadow: inset`（★場所を取りません）',
   'table tr.hi td:first-child{box-shadow:inset 4px 0 0 #0f5f4e}'],
];

for (const [na, css] of TAMESHI) {
  const tag = await p.addStyleTag({ content: css });
  const ima = await hakaru();
  console.log(`\n★${na}`);
  let yoko = 0, tate = 0;
  ima.forEach((g, i) => {
    const dx = +(g.jiLeft - moto[i].jiLeft).toFixed(2);
    const dh = +(g.takasa - moto[i].takasa).toFixed(2);
    if (dx !== 0) yoko++;
    if (dh !== 0) tate++;
    console.log(`   ${g.hi ? '帯あり' : 'ふつう'}　1文字目の左 ${g.jiLeft}px（動き ${dx >= 0 ? '+' : ''}${dx}px）／ 高さ ${g.takasa}px（動き ${dh >= 0 ? '+' : ''}${dh}px）`);
  });
  console.log(`   ★★横に動いた行 ${yoko} / ${ima.length}　★★高さが変わった行 ${tate} / ${ima.length}`);
  await p.evaluate((el) => el.remove(), tag);
}

/** ★色（★描いて測ります） */
const iro = await p.evaluate(() => {
  const to = (s) => s.match(/\d+/g).slice(0, 3).map(Number);
  const L = ([r, g, bl]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl); };
  const sa = (x, y) => +((Math.max(L(x), L(y)) + 0.05) / (Math.min(L(x), L(y)) + 0.05)).toFixed(2);
  const hi = document.querySelector('tr.hi td');
  const chi = getComputedStyle(hi).backgroundColor;
  const a = to(chi.includes('rgba(0, 0, 0, 0)') ? 'rgb(255,255,255)' : chi);
  return { chi, chi_shiro: sa(a, [255, 255, 255]), obi_shiro: sa([15, 95, 78], [255, 255, 255]), obi_chi: sa([15, 95, 78], a) };
});
console.log('\n★色（★描いて `getComputedStyle` で測りました。`<style>` を読んでいません）');
console.log(`   帯を付けたい行の地 …… ${iro.chi}`);
console.log(`   いまの地 対 白 ……… ${iro.chi_shiro} : 1`);
console.log(`   帯（#0f5f4e）対 白 … ${iro.obi_shiro} : 1`);
console.log(`   帯 対 いまの地 …… ${iro.obi_chi} : 1`);
console.log('   ★決まりが求める最低（WCAG 1.4.11）…… 3 : 1');
console.log('\n★★この本は札を出しません（★測っただけです）');
await b.close();
