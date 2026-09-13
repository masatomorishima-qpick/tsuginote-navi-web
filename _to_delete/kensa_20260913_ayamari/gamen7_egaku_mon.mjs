/**
 * kensa/gamen7_egaku_mon.mjs ── ★★★**画面7を1度描いて、欄を数える門**
 *
 * ★姿: bin/senjutsu/tsuginote_gamen_base.html（179,553バイト ／ md5 5be20ed2ded9e44c1ecdc9ec8ba817ce）
 *
 * ★★【なぜ要るか】★本番化の手前の止め ── ★**画面7を1度も描いていませんでした**。
 *   ★★`paidFields.ts` の字を数えても、★**描いた画面に34の欄が出るか**は分かりません。
 *   ★★★**字ではなく、描いた物で数えます**（★判断ログ620番 ── 確かめられないものは通さない）。
 *
 * ★★【描き方】★`react-dom/server` で1度だけ描きます。
 *   ★`useEffect` は動きません ── ★★**`track()` は1度も呼ばれません**（★台帳を汚しません）。
 *   ★★**本番の本には1バイトも書きません**。★描いた字は `/tmp` に置きます。
 *   ★`jiti` で `.tsx` を読みます（★`jiti` の JSX は古い形で出ますので `globalThis.React` を置きます）。
 *
 * ★★【当て・10】
 *   (1) 欄の数が **34**
 *   (2) ⑯-1〜⑯-7 が **7つ**、★どれも**ちょうど1つ**
 *   (3) 描いた並びが `paidFields.ts` の `no` と **1文字も違わない**
 *   (4) ★**既定値を作っていない**（★字の欄の `value` が空／`select` の選ばれている札が空／`checked` 0個）
 *   (5) ★**「現在の年」は呼び出し側から**（★2026 と 2027 で、年の並びが**ちょうど1つずれる**）
 *   (6) ★**ⓘ の中身を、押す前に出していない**（`role="dialog"` が 0個）
 *   (7) ★**`required`・`min`・`max` を付けていない**（★検査は `paidRules` の1本・二重にしない）
 *   (8) ★★**`no` と `label` の先頭の番号が食い違わない**（★★画面に出る番号は `label` の先頭です）
 *   (9) ★★**`paidFields.ts` の `no` と `paidRules.ts` の `no` が、ぴったり同じ集合**（★3つ目の写し）
 *  (10) ★★**鍵は `no` と同じか、`no + '/'` で始まる**（★母数65）
 *
 * ★★【数えるが、門にしないもの】★**㉘ が描いた画面にあるか**
 *   ── ★止め②の姿を1行で出すだけです（★件数の門は置きません）。
 *
 * 使い方: node kensa/gamen7_egaku_mon.mjs
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { neWoHikuKa } from './ne_wo_hiku.mjs';

const KOKO = path.dirname(new URL(import.meta.url).pathname);
const NE = neWoHikuKa(KOKO, 'repo');

let fuda = 0, maru = 0;
const ate = (na, yoi, ji = '') => {
  if (yoi) { maru++; console.log(`  ○ ${na}　${ji}`); }
  else { fuda = 2; console.log(`★NG ${na}　${ji}`); }
};

console.log('★記録（★これは門ではありません。★見たものを書き残すだけです）');
console.log(`   repo …… ${NE}`);

/** ★描きます。★年は**呼び出し側から**渡します（★既定値を作りません） */
async function egaku(nen) {
  const { createJiti } = await import(path.join(NE, 'node_modules/jiti/lib/jiti.mjs'))
    .catch(() => import('jiti'));
  const React = (await import(path.join(NE, 'node_modules/react/index.js'))).default;
  const { renderToStaticMarkup } =
    await import(path.join(NE, 'node_modules/react-dom/server.js')).then((m) => m.default ?? m);
  globalThis.React = React;
  const jiti = createJiti(NE + '/', { alias: { '@': NE }, interopDefault: true, jsx: true });
  const S = await jiti.import(path.join(NE, 'components/retirement/pro/Screen7.tsx'));
  const Screen7 = S.default ?? S;
  const { PAID_FIELDS } = await jiti.import(path.join(NE, 'components/retirement/pro/paidFields.ts'));
  const { paidKou } = await jiti.import(path.join(NE, 'lib/retirement/pro/paidRules.ts'));
  const ji = renderToStaticMarkup(React.createElement(Screen7, {
    genzaiNen: nen, hikitsugi: {}, onSubmit: () => {},
    ayamari: [], matteiru: false, matteiruBun: '', ayamariBun: null,
  }));
  return { ji, PAID_FIELDS, KOU: paidKou(nen) };
}

/** ★描いた字から、欄の見出しの番号を順に取り出します */
const MIDASHI = /<span class="block text-base font-bold text-slate-900">([^<]{0,40})/g;
const banGou = (ji) => [...ji.matchAll(MIDASHI)].map((m) => {
  const t = m[1].match(/^([①-⑳㉑-㊿](?:-\d+)?)/);
  return t ? t[1] : `（番号なし）${m[1].slice(0, 12)}`;
});

const a_ = await egaku(2026);
const a = a_;
const b = await egaku(2027);
const SAKI = path.join(os.tmpdir(), 'gamen7_egaita.html');
fs.writeFileSync(SAKI, a.ji);
console.log(`   描いた字 …… ${SAKI}（${Buffer.byteLength(a.ji)}バイト）`);
console.log('');

const no = banGou(a.ji);

// ---- (1) 欄の数
ate('(1) 欄の数が 34', no.length === 34, `　［数えた ${no.length}］`);

// ---- (2) ⑯-1〜⑯-7
const juroku = ['⑯-1', '⑯-2', '⑯-3', '⑯-4', '⑯-5', '⑯-6', '⑯-7'];
const kazu = juroku.map((k) => no.filter((x) => x === k).length);
ate('(2) ⑯-1〜⑯-7 が7つ・どれもちょうど1つ',
    kazu.length === 7 && kazu.every((n) => n === 1),
    `　［${juroku.map((k, i) => `${k}:${kazu[i]}`).join(' ')} ／ 足し算 ${kazu.reduce((x, y) => x + y, 0)}］`);

// ---- (3) `paidFields.ts` の並びと突き合わせ
const daicho = a.PAID_FIELDS.map((f) => f.no);
const chigau = no.map((x, i) => (x === daicho[i] ? null : `${i + 1}番目 描いた「${x}」／台帳「${daicho[i]}」`))
                 .filter(Boolean);
ate('(3) 描いた並びが `paidFields.ts` の `no` と1文字も違わない',
    chigau.length === 0,
    `　［母数 ${daicho.length} ／ 違い ${chigau.length}］` + (chigau.length ? `\n       ${chigau[0]}` : ''));

// ---- (4) 既定値を作っていない
const inp = a.ji.match(/<input\b[^>]*>/g) ?? [];
const ji_ran = inp.filter((t) => !/type="(radio|checkbox)"/.test(t));
const atai = ji_ran.filter((t) => /value="[^"]+"/.test(t));
const erabu = [...a.ji.matchAll(/<select\b[^>]*>([\s\S]*?)<\/select>/g)]
  .map((m) => (m[1].match(/<option value="([^"]*)"[^>]*selected/) ?? [, null])[1]);
const erande = erabu.filter((v) => v !== '');
const oshite = inp.filter((t) => /checked/.test(t));
ate('(4) 既定値を作っていない',
    atai.length === 0 && erande.length === 0 && oshite.length === 0,
    `　［字の欄 ${ji_ran.length}個のうち値の入ったもの ${atai.length}／`
    + `選ぶ欄 ${erabu.length}個のうち空でない札が選ばれたもの ${erande.length}／`
    + `押す欄 ${inp.length - ji_ran.length}個のうち押された姿 ${oshite.length}］`);

// ---- (5) 「現在の年」は呼び出し側から
const toshi = (ji) => [...new Set([...ji.matchAll(/>(\d{4})</g)].map((m) => Number(m[1])))].sort((x, y) => x - y);
const ta = toshi(a.ji), tb = toshi(b.ji);
const zure = ta.length === tb.length && ta.every((v, i) => tb[i] - v === 1);
ate('(5) 「現在の年」は呼び出し側から（2026→2027 で年の並びがちょうど1つずれる）',
    ta.length > 0 && zure,
    `　［2026 …… ${ta[0]}〜${ta[ta.length - 1]}（${ta.length}個）／`
    + `2027 …… ${tb[0]}〜${tb[tb.length - 1]}（${tb.length}個）］`);

// ---- (6) ⓘ の中身を先に出していない
const dlg = (a.ji.match(/role="dialog"/g) ?? []).length;
ate('(6) ⓘ の中身を、押す前に出していない', dlg === 0, `　［role="dialog" ${dlg}個 ／ ⓘ の押す所 ${(a.ji.match(/のくわしい説明"/g) ?? []).length}個］`);

// ---- (7) `required`・`min`・`max` を付けていない
const req = (a.ji.match(/\brequired\b/g) ?? []).length;
const mi = (a.ji.match(/\smin="/g) ?? []).length;
const ma = (a.ji.match(/\smax="/g) ?? []).length;
ate('(7) `required`・`min`・`max` を付けていない（検査は `paidRules` の1本）',
    req === 0 && mi === 0 && ma === 0, `　［required ${req} ／ min ${mi} ／ max ${ma}］`);

// ---- (8) `no` と `label` の先頭の番号が食い違わない
/**
 * ★★★【2026-09-07・この回の見つけもの】
 *   ★★**画面に出る番号は `no` ではなく `label` の先頭の字です**。
 *   ★写しで `no: "⑯-7"` を `"⑯-8"` に変えても、★**画面の見出しは「⑯-7」のまま**でした。
 *   ★★つまり ── ★**`no` と `label` は別の出どころ**で、★食い違っても誰も気づきません。
 *   ★★★ですので、★**2つが合っているか**を、ここで数えます。
 */
const chigauNo = a.PAID_FIELDS
  .map((f) => {
    const t = String(f.label).match(/^([①-⑳㉑-㊿](?:-\d+)?)/);
    return t && t[1] === f.no ? null : `\`no\` 「${f.no}」／\`label\` の先頭「${t ? t[1] : '（番号なし）'}」`;
  })
  .filter(Boolean);
ate('(8) `no` と `label` の先頭の番号が1つも食い違わない',
    chigauNo.length === 0,
    `　［母数 ${a.PAID_FIELDS.length} ／ 食い違い ${chigauNo.length}］` + (chigauNo.length ? `\n       ${chigauNo[0]}` : ''));

// ---- (9) `paidFields.ts` の `no` と `paidRules.ts` の `no` が、ぴったり同じ集合
/**
 * ★★★【2026-09-07・戦術Cowork `senjutsu_20260907c.md` 1番】
 *   ★★**3つ目の写しです** …… ★`paidRules.ts` の `no` は**手で書く本**です。
 *   ★★いまは合っていますが、★**それを当てている門が1つもありませんでした**。
 *   ★★★**数え方** …… ★正規表現で字を拾いません。★**`paidKou(年)` を呼んで、組を読みます**
 *     （★こちらは前に、字を400字まで見る形で数えて、★**次の欄の鍵を拾いました**）。
 */
{
  const a = a_.PAID_FIELDS.map((f) => f.no);
  const b = a_.KOU.map((k) => k.no);
  const aDake = a.filter((x) => !b.includes(x));
  const bDake = b.filter((x) => !a.includes(x));
  ate('(9) `paidFields.ts` の `no` と `paidRules.ts` の `no` が、ぴったり同じ集合',
      a.length === 34 && b.length === 34 && aDake.length === 0 && bDake.length === 0,
      `　［paidFields ${a.length} ／ paidRules ${b.length} ／`
      + ` paidFields だけ ${aDake.length}（${aDake.join(' ') || 'なし'}）／`
      + ` paidRules だけ ${bDake.length}（${bDake.join(' ') || 'なし'}）］`);
}

// ---- (10) 鍵は `no` と同じか、`no + '/'` で始まる
/**
 * ★★★【2026-09-07・戦術Cowork `senjutsu_20260907c.md` 1番の終わり】
 *   ★そちらの字 …「★`kagi` は `no` と、わざと違うものがあります（`⑥/hi`・`⑪/{n}/gaku`・`㉕/nai` など）。
 *     ★ですので『`no` と `kagi` が同じ』は当てになりません。★どういう形なら当てられるか1行ください」
 *   ★★★**答え …… `kagi` は `no` と同じか、`no + '/'` で始まります**（★母数65・例外0）。
 *   ★★**母数の中身** …… ★`ran` の鍵 ＋ `nai` の鍵 ＋ ★**`kikan`（⑫⑬）の「わからない」**。
 *     ★★「わからない」は `set(k.no, 'wakaranai')` で、★**`no` そのものを鍵にします**
 *       （★`Screen7.tsx` 362行）── ★**`ran` の中にはありませんので、ここで足します**。
 */
{
  const kagi = [];
  for (const k of a_.KOU) {
    for (const r of (k.katachi === 'tan' ? [k.ran] : k.ran)) kagi.push([k.no, r.kagi]);
    if (k.nai) kagi.push([k.no, k.nai.kagi]);
    if (k.wakaranai) kagi.push([k.no, k.no]);        // ★「わからない」は `no` そのもの
  }
  const soto = kagi.filter(([no, g]) => !(String(g) === no || String(g).startsWith(no + '/')));
  ate('(10) 鍵は `no` と同じか、`no + "/"` で始まる',
      kagi.length === 65 && soto.length === 0,
      `　［母数 ${kagi.length}（★\`ran\` と \`nai\` ${kagi.length - a_.KOU.filter((k) => k.wakaranai).length}`
      + ` ＋ 「わからない」${a_.KOU.filter((k) => k.wakaranai).length}）／ 外れ ${soto.length}］`
      + (soto.length ? `\n       \`no\`「${soto[0][0]}」／鍵「${soto[0][1]}」` : ''));
}

// ---- 数えるが、門にしないもの
console.log('');
console.log('★数えるだけ（★件数の門は置きません）');
console.log(`   ㉘ が描いた画面にあるか …… ${a.ji.includes('㉘') ? 'ある' : 'ない'}（★止め②の姿）`);
console.log(`   欄の並び …… ${no.join(' ')}`);
console.log(`   <input ${inp.length}個 ／ <select ${erabu.length}個 ／ <button ${(a.ji.match(/<button\b/g) ?? []).length}個`);

console.log('');
console.log(`★見た当て ${maru + (fuda ? 1 : 0)}個のうち ○ ${maru}`);
if (fuda) { console.log('★★終わりの札 2'); process.exit(2); }
console.log('★終わりの札 0');
