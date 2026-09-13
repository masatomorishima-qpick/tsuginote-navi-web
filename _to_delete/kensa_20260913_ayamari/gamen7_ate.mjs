/**
 * kensa/gamen7_ate.mjs ── 段3の当て（`gamen7_chushutsu.mjs` を直したあとの受け入れ）
 *   （戦術Cowork `senjutsu_20260905i.md` 5番・判断ログ 510・514・527番／2026-09-05）
 *
 * 【何を当てるか】
 *   ★当て1（判断ログ 514番の(2)）…… 基準HTMLで回すと、
 *       `components/retirement/pro/paidFields.ts` と **1バイトも違わない**。
 *       ★★除くのは ★**11行目（「抜き出しもと:」の1行）だけ**です
 *         （★この1行には基準HTMLの名前・バイト・md5 が入りますので、もとが変われば必ず変わります）。
 *       ★★**除いた行の数も出します**（★黙って除きません）。★★**1行でなければ NG** です。
 *       ★★★【2026-09-06・戦術Cowork `senjutsu_20260906c.md` 1-3・`…e.md` 4番】
 *         ★以前ここには「**手で足した2行**（④A の注記）も除きます」と書いてありました。
 *         ★★その2行は `paidFields.ts` から**落ちました**ので、★`const TE` とその当ても消しました。
 *         ★★★**そのとき、この頭の字だけが古い姿で残りました**（★戦術Coworkが見つけてくださいました）。
 *         ★★決め …… ★**数を出したら、その1文を道具の中の字と突き合わせる。
 *           食い違ったら、便を出す前に止める**（★下の `atama_mon.mjs` が、これを門にしました）
 *   ★当て2（判断ログ 514番の(4)）…… **印を付けた本**で回すと、
 *       **足した列（`bangou`・`toi`・`deru`）と `no` の注記1行のほか、1バイトも違わない**
 *   ★当て3（判断ログ 527番の(2)）…… ★**門3つが、壊すと鳴る**
 *       ａ 項目の数（1つ消す → 27個 → 終わりの札 2）
 *       ｂ `data-kagi` の無い欄（1つ剥がす → 終わりの札 2）
 *       ｃ `data-kagi` の重なり（1つを別の欄と同じ名前にする → 終わりの札 2）
 *       ★★**壊しが本当に入ったことを、鳴らす前に確かめます**（判断ログ 585番の(2)）
 *
 * 【使い方】node kensa/gamen7_ate.mjs <基準HTML>
 * ★姿: bin/senjutsu/tsuginote_gamen_base.html（179,553バイト ／ md5 5be20ed2ded9e44c1ecdc9ec8ba817ce）
 *   ★★【2026-09-07・戦術Cowork `senjutsu_20260907b.md` 3番の決め】★この行の先頭を `★姿:` にしました
 *     ── ★★`atama_mon.mjs` が、★**この行の数を、いま置き場にある本と突き合わせます**。
 *   ★★【2026-09-07・戦術Cowork `senjutsu_20260906s.md` 3番】★この姿を直しました。
 *     ★前 …… 167,382 ／ `3d653d30…`（★⑯が1つの欄だったころ）→ 171,600 ／ `a27d9718…`（★⑯を7つに）
 *       → 171,913 ／ `7773afa3…`（★「ご用意いただくもの」に⑯と「年末調整」の1行）
 *       → 175,669 ／ `8ec8fbfd…`（★画面12の確定申告の節を差し替えた・2026-09-08）
 *       → 175,697 ／ `2dadb8e4…`（★画面9の一覧の表7行の `data-na` に番号を付けた・2026-09-09）
 *       → 175,691 ／ `f80523c2…`（★画面9の絞り込み①の `on` と `✓` を外した・2026-09-09）
 *       → 175,481 ／ `f5a48ea5…`（★画面9の一覧の `data-mada` を21個外した・2026-09-09）
 *       → ★176,066 ／ `52e44274…`（★戦術Cowork が906行の1文を差し替えた・決め986・2026-09-09）。
 *       → ★176,514 ／ `add010d1…`（★戦術Cowork が907行の `note` に2行足した・決め1002・2026-09-09）。
 *       → ★176,904 ／ `70fed4a7…`（★戦術Cowork が見出しと注と見本の7行を直した・決め1010〜1014・2026-09-09）。
 *       → ★176,854 ／ `08fa7c41…`（★戦術Cowork が一覧の4つの印から `data-mada` を外した・決め1019・2026-09-09）。
 *       → ★177,102 ／ `58c6e1e8…`（★戦術Cowork が画面12の1141行を直した・決め1023・2026-09-09）。
 *       → ★177,102 ／ `4fa96a82…`（★戦術Cowork が見本の4つの数を直した・決め1048・2026-09-11。★バイトは同じ）。
 *       → ★177,401 ／ `1fa37eae…`（★戦術Cowork が4か所＋1行直した・決め1050・2026-09-12）。
 *       → ★177,670 ／ `3400f604…`（★戦術Cowork が画面11の直し5つを入れた・決め1053・2026-09-12。★途中の姿）。
 *       → ★177,314 ／ `fd651c74…`（★戦術Cowork が見出しと975行と1115行を直した・決め1060・2026-09-12）。
 *       → ★177,221 ／ `8e3116d2…`（★戦術Cowork が回1の `data-mada` 10か所を外した・決め1067・2026-09-12。★途中の姿）。
 *       → ★177,233 ／ `873af5bb…`（★969行の名前と1108行の字を直した・決め1064／1070・2026-09-12）。
 *       → ★177,710 ／ `4713aed7…`（★退職所得の税2行を足し・1115行の見出しと1117行を直した・決め1078／1080・2026-09-12）。
 *       → ★179,643 ／ `007d735a…`（★★区分の1文を2つ足した・決め1107・2026-09-13）。
 *       → ★179,612 ／ `aa6573c6…`（★★回3の `data-mada` 19種類を外し、`tai_uchiwake_bun` を足した・決め1114・2026-09-13）。
 *       → ★180,120 ／ `3ce4353d…`（★★①②の見出しに印を入れ、`an_onaji_bun`・`sa_hajime_age` を足した・決め1119・2026-09-13）。
 *       → ★180,223 ／ `f758d906…`（★1086行の「何歳まで生きても変わらない額」を直した・決め1123・2026-09-13）。
 *       → ★いま **179,553 ／ `5be20ed2…`**（★★回4の `data-mada` 42種類を外した・決め1132・2026-09-13。★`data-mada` は **1か所**になりました）。
 *     ★★★**この行が前の姿で残っていたことは、`atama_mon.mjs` が鳴らして教えてくれました**
 *       （★★人の目ではありません ── ★これが門を直した効きです・2026-09-06）。
 *   ★★★【2026-09-06・戦術Cowork `senjutsu_20260906c.md` 6番】
 *     ★以前ここには「**印なしの基準HTML**（判断ログ 416番・**155,413** バイトのほう）」と書いてありました。
 *     ★★**155,413 は古い数**です（★系統の先頭が 167,382 に変わりました）。
 *     ★★★そして ── ★**印つきでも印なしでも、出るものは同じ**です
 *       （★戦術Coworkが測り、こちらも測りました。★「抜き出しもと:」の1行を除いて **0行の差**）。
 *       ★ですので、★**もとを「印なし」に限る理由は、もうありません**。
 */
import { spawnSync } from 'node:child_process';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { kijunWoTashikameru } from './kijun_tashikame.mjs';
import { neWoHikuKa } from './ne_wo_hiku.mjs';
import { shirushiWoKazoeru } from './shirushi_kazoeru.mjs';

const MOTO = process.argv[2];
if (!MOTO) { console.error('★ 使い方: node kensa/gamen7_ate.mjs <印なしの基準HTML>'); process.exit(2); }
/**
 * ★★★【2026-09-07・戦術Cowork `senjutsu_20260906s.md` の決め】
 *   ★★**渡されたものが「印つき」か「印なし」かを、門の側が数えて1行出します**。
 *   ★この門が待っているのは …… ★**印なし**の基準HTMLです。
 *   ★★件数の門は置きません（★印の数はもとが変われば動きます）。★**出すだけ**です。
 */
shirushiWoKazoeru(MOTO);
/** ★道具は、まず**この本と同じ所**を見て、無ければ `kensa/` を見ます（★置き場が2つあるあいだの形） */
const KOKO = path.dirname(new URL(import.meta.url).pathname);
/**
 * ★★★【2026-09-06・戦術Cowork `senjutsu_20260906q.md` 5番「止め⑤ ＝ 案ア」条件④】
 *   ★前は `path.dirname(path.dirname(…))`（＝「置き場の1つ上が repo」）でした。
 *   ★★お使いの Mac では置き場が `~/Desktop/tsuginote/bin/build/kensa/` ですので、
 *     ★`NE` が `bin/build` になり、★★**`components/` がありませんでした**。
 *   ★★★いまは `kensa/ne.json`（★1行の設定・★置き場からの**相対**）から引きます。
 *     ★**設定が無い／根が見つからないときは、黙って飛ばさず、札2で止めます**。
 */
const NE = neWoHikuKa(KOKO, 'repo');
const DOUGU = [path.join(KOKO, 'gamen7_chushutsu.mjs'), path.join(NE, 'kensa/gamen7_chushutsu.mjs')]
  .find((x) => fs.existsSync(x)) ?? path.join(KOKO, 'gamen7_chushutsu.mjs');
const HON = path.join(NE, 'components/retirement/pro/paidFields.ts');
/**
 * ★もとの名前で書きます（★道具は「抜き出しもと」に**ファイル名だけ**を書くため）
 * ★★【2026-09-06・戦術Cowork `senjutsu_20260906b.md` 10番】★**名前を1つにしたので、直しました**
 *   ★前 …… `tsuginote_gamen_base_20260812.html`（★そのままだと、作り直した日に当てが鳴ります）
 */
const NA = 'tsuginote_gamen_base.html';
const SAGYO = fs.mkdtempSync(path.join(os.tmpdir(), 'g7ate-'));

let o = 0, ng = 0;
/** ★★「終わらなかった」もの（★捕まえた数に入れません・下の `SEN_BYOU`） */
const owaranai = [];
const ate = (na, ii, setsumei = '') => {
  if (ii) { o++; console.log(`  ○ ${na}${setsumei}`); }
  else { ng++; console.log(`  ★NG ${na}${setsumei}`); }
};

/**
 * ★★【2026-09-05・戦術Cowork `senjutsu_20260905o.md` 4番】
 *   ★★**「終わらなかった」を「捕まえた」に数えません**。
 *     ★同じ札にすると、「壊しが鳴った」と「道具が固まった」が同じ札になり、
 *     ★★**「9つとも鳴りました」と書けてしまいます** ── ★1つは、実は固まっていたのに。
 *
 * ★★線の引き方（★条件1）── ★**桁で選びます。「だいたい大きい」では選びません**
 *   ★ふつうの時間 …… `kensa/gamen7_chushutsu.mjs` を、今日の基準HTMLで 5回まわして測りました
 *     1回目（2026-09-05）0.36 / 0.09 / 0.09 / 0.05 / 0.04 秒 …… 平均 0.13秒・いちばん遅い **0.36秒**
 *     2回目（2026-09-05）0.07 / 0.07 / 0.06 / 0.06 / 0.07 秒 …… 平均 0.07秒・いちばん遅い 0.07秒
 *     ★1回目の 0.36秒 は**冷えた1回目**です。★★線は、★**そちら（遅いほう）で引きます**
 *   ★線 …… ★**30秒**（★0.36秒の **83倍**・★桁が2つ違います）
 *   ★★遅い日でも、83倍は空きません。★**空鳴りが起きない線**です（★判断ログ 568番の逆）
 */
const SEN_BYOU = 30;

/**
 * 道具を回す。★終わりの札と、書き出したものを返す。
 * ★★**時間を切ります**（`SEN_BYOU` 秒）。★切れたときは `fuda: 'owaranai'` を返します
 *   （★**数ではありません**。★★「捕まえた」と混ざらないように、★わざと札の形を変えています）
 */
function mawasu(htmlMichi) {
  /**
   * ★★【2026-09-05・こちらの誤り。★先に書きます】★`execFileSync` は
   *   ★**うまくいったときの言ったこと（標準エラー）を返しません**。
   *   ★★道具が ○ で終わった回の数を読もうとして、★**何も読めませんでした**。
   *   ★`spawnSync` にして、★うまくいっても言ったことを読みます。
   */
  const r = spawnSync('node', [DOUGU, htmlMichi],
    { encoding: 'utf8', timeout: SEN_BYOU * 1000, killSignal: 'SIGKILL' });
  if ((r.error && r.error.code === 'ETIMEDOUT') || r.signal === 'SIGKILL' || r.signal === 'SIGTERM') {
    return { fuda: 'owaranai', dasu: '', err: r.stderr ?? '' };
  }
  return { fuda: r.status ?? -1, dasu: r.stdout ?? '', err: r.stderr ?? '' };
}

/**
 * ★★壊しではない所（当て1・当て2）で道具が終わらなかったときは、★**そこで止めます**。
 *   ★★ここで固まったら、その先の当ては**比べるものが無い**ので、何も言えません（★終わりの札 2）。
 */
function tomeru(r, doko) {
  if (r.fuda !== 'owaranai') return;
  console.log(`★★終わらなかった ${doko} …… ★**${SEN_BYOU}秒**で切りました`);
  console.log('★★終わりの札 2 ── 道具が終わらないので、この当ては何も言えません');
  process.exit(2);
}

/** 印を28個ぜんぶに付けた本を作る（★当てのためだけの本です） */
function shirushiTsukeru(moto, dasu, kowasu = '') {
  const h = fs.readFileSync(moto, 'utf8');
  const i = h.indexOf('<b>画面7</b>'), j = h.indexOf('<b>画面8</b>', i);
  let sec = h.slice(i, j);
  const ba = [];
  for (const m of sec.matchAll(/<div class="field">/g)) {
    const lab = /<label>([\s\S]*?)<\/label>/.exec(sec.slice(m.index, m.index + 3000));
    const ji = lab ? lab[1].replace(/<[^>]*>/g, '').trim() : '';
    const no = /^([①-⑳㉑-㉗]+(?:-\d)?)/.exec(ji);
    ba.push({ at: m.index, kagi: no ? no[1] : '' });
  }
  const TOI = new Set(['㉕', '㉗']);
  const DERU = { '㉖': '㉕/iru', '⑭': '㉕/iru', '㉔': '㉗/iru', '⑰': '㉗/iru' };
  let tsuketa = 0, kesita = 0, kasaneta = 0;
  for (let n = ba.length - 1; n >= 0; n--) {
    const { at, kagi } = ba[n];
    let z = '';
    if (kowasu === 'ｂ' && n === 3) { kesita++; }               // ★1つだけ印を付けない
    else {
      const k = (kowasu === 'ｃ' && n === 3) ? ba[0].kagi : kagi; // ★1つだけ別の欄と同じ名前
      if (kowasu === 'ｃ' && n === 3) kasaneta++;
      z = ` data-kagi="${k}"`;
      if (TOI.has(kagi)) z += ` data-toi="${kagi}/iru"`;
      if (DERU[kagi]) z += ` data-deru="${DERU[kagi]}"`;
      tsuketa++;
    }
    sec = sec.slice(0, at) + `<div class="field"${z}>` + sec.slice(at + '<div class="field">'.length);
  }
  if (kowasu === 'ａ') {                                          // ★欄を1つ消す（27個にする）
    const m = /<div class="field"[^>]*>/g; let hit = null, c = 0;
    for (const x of sec.matchAll(/<div class="field"[^>]*>/g)) { if (c++ === 5) { hit = x; break; } }
    const s = hit.index; let k = s, depth = 0;
    for (;;) {
      const open = sec.indexOf('<div', k), close = sec.indexOf('</div>', k);
      if (close < 0) break;
      if (open >= 0 && open < close) { depth++; k = open + 4; }
      else { depth--; k = close + 6; if (depth === 0) break; }
    }
    sec = sec.slice(0, s) + sec.slice(k);
  }
  fs.writeFileSync(dasu, h.slice(0, i) + sec + h.slice(j), 'utf8');
  return { tsuketa, kesita, kasaneta };
}

/**
 * ★その本の「いまの姿」…… バイト数と MD5。
 *
 * ★★【2026-09-05・戦術Cowork `senjutsu_20260905j.md` 2番・判断ログ 617番】
 *   ★この当ては「道具を直しても出るものが同じ」と言いますが、
 *   ★★**どの道具で回したかを、いままで1行も書いていませんでした**。
 *   ★道具が入れ替われば、★★**当ては同じ字のまま通り、本番の本が変わります**。
 */
const sugata = (michi) => {
  const b = fs.readFileSync(michi);
  return { n: b.length, m: crypto.createHash('md5').update(b).digest('hex') };
};
const ji = (michi) => {
  const { n, m } = sugata(michi);
  return `${n.toLocaleString()} バイト ／ md5 ${m}`;
};

/**
 * ★★道具の門 ── `kitai.json` の数と**比べて、違えば止めます**。
 *
 * ★★【2026-09-05・戦術Cowork `senjutsu_20260905m.md` 6番・判断ログ 412・634番】
 *   ★前は「呼んだ道具の MD5 を**出す**」だけでした。★★**出すだけでは止まりません**。
 *   ★★**門は、期待する値を持ち、比べて止める。「出す」だけのものは門と呼びません**
 *
 * ★`kitai.json` は**この本と同じ所**から読みます。
 * ★★載っていない道具・無い道具・違う道具は、★**終わりの札 2**
 */
const douguNoMon = (michi) => {
  const koko = path.dirname(new URL(import.meta.url).pathname);
  const kitaiMichi = path.join(koko, 'kitai.json');
  const na = path.basename(michi);
  if (!fs.existsSync(kitaiMichi)) return [false, `★★\`kitai.json\` がありません（${kitaiMichi}）── この当ては何も言えません`];
  if (!fs.existsSync(michi)) return [false, `★★道具がありません（${michi}）── この当ては何も言えません`];
  const kitai = JSON.parse(fs.readFileSync(kitaiMichi, 'utf8'))['道具'] ?? {};
  if (!(na in kitai)) return [false, `★★\`kitai.json\` に「${na}」がありません ── 知らない道具では、この当ては何も言えません`];
  const { n, m } = sugata(michi); const k = kitai[na];
  if (n !== k['バイト'] || m !== k.md5) {
    return [false, '★★道具が、期待する姿と違います\n'
      + `       いま …… ${n.toLocaleString()} バイト ／ md5 ${m}\n`
      + `       期待 …… ${k['バイト'].toLocaleString()} バイト ／ md5 ${k.md5}\n`
      + `       （${k['書いた日'] ?? ''}・${k['誰が'] ?? ''}）`];
  }
  return [true, `${n.toLocaleString()} バイト ／ md5 ${m}　★\`kitai.json\` と一致`];
};

console.log('★記録（★これは門ではありません。★見たものを書き残すだけです・判断ログ 634番）');
console.log(`   基準HTML …… ${MOTO}`);
console.log(`                ${ji(MOTO)}`);
console.log(`   比べる本 … ${HON}`);
console.log(`                ${fs.existsSync(HON) ? ji(HON) : '★★NG 本がありません'}`);
console.log('');
console.log('★★道具の門（★`kitai.json` と比べて、違えば止めます）');
console.log(`   道具 ……… ${DOUGU}`);
const [douguOk, douguJi] = douguNoMon(DOUGU);
ate('道具が `kitai.json` と一致', douguOk, `\n                ${douguJi}`);
if (!douguOk || !fs.existsSync(HON)) {
  console.log('★★終わりの札 2 ── 道具か比べる本が確かめられないので、この当ては何も言えません');
  process.exit(2);
}

/**
 * ★★★【2026-09-07・この回の見つけもの】★**渡された「印なしの基準HTML」を、確かめていませんでした**
 *   ★★段の⑨を、お使いの Mac で回したとき、★`/tmp/base_nashi.html` が**2つ前の姿**（162,415バイト ／
 *     md5 `cc26d905…`）でした。★★★**それでもこの当ては ○36 ／ NG 0 で通りました**。
 *   ★★**判断ログ797番（「NG 17」）と同じ形**です ── ★**どの本を渡されたのかを確かめていない**。
 *   ★★★**いまは `kitai.json` の「もと印なし」と突き合わせます**。★違えば、ここで止めます。
 */
kijunWoTashikameru(KOKO, MOTO, 'もと印なし');

// ---------------------------------------------------------------- 当て1
console.log('★当て1 …… 印がまだ1つも無い基準HTMLで、`paidFields.ts` と1バイトも違わない');
const nashiMichi = path.join(SAGYO, NA);
fs.copyFileSync(MOTO, nashiMichi);
const r1 = mawasu(nashiMichi);
tomeru(r1, '当て1（印なしの本）');
ate('終わりの札が 0', r1.fuda === 0, `　［札 ${r1.fuda}］`);
/**
 * ★★【2026-09-06・戦術Cowork `senjutsu_20260906c.md` 1-3・`…d.md` 4番】
 *   ★★★**手で足した2行（`const TE`）と、その当てを消しました**。
 *   ★理由 …… ★`paidFields.ts` を作り直したときに、★**その2行が落ちました**（★判断ログ 415番(2)）。
 *     ★★残したままだと `0 === 2` で NG になります。
 *   ★★これで `gamen13_ate.mjs`・`gamen1_ate.mjs`・`gamen_ate.mjs` と**同じ形**（★除くのは11行目だけ）です。
 *
 * ★★【2026-09-05・戦術Cowork `senjutsu_20260905y.md` 3-2】★「抜き出しもと:」の行に **md5** が入りました。
 *   ★★md5 は**もとが変わると変わります**ので、★この1行だけは比べません（★ほかの3本の当てと同じ形）。
 *   ★★**除いた数を出します**（★黙って除きません）。★★**1行でなければ NG** です。
 */
const honGyo = fs.readFileSync(HON, 'utf8').split('\n');
const MOTO_GYO = /^ \* 抜き出しもと: /;
const motoNuki = (a) => a.filter((g) => !MOTO_GYO.test(g));
const nokosu2 = motoNuki(honGyo);
const dasu1 = motoNuki(r1.dasu.split('\n'));
ate('「抜き出しもと:」の行を1本ずつ除いた',
    honGyo.length - nokosu2.length === 1 && r1.dasu.split('\n').length - dasu1.length === 1,
    `　［本から ${honGyo.length - nokosu2.length}行 ／ 道具から ${r1.dasu.split('\n').length - dasu1.length}行］`);
/**
 * ★★★【2026-09-06・戦術Cowork `senjutsu_20260906r.md` ②の決め】
 *   ★★門が「違う」と言うときは、★(1) **どの本を（バイトと md5 で）読んだか**、
 *     ★(2) **最初に違った行の中身（両側・80字まで）** ── ★この2つを必ず出します。
 */
const kuwashiku1 = () => {
  const hb = fs.readFileSync(HON);
  const tb = Buffer.from(r1.dasu, 'utf8');
  let i = 0;
  while (i < Math.max(nokosu2.length, dasu1.length) && nokosu2[i] === dasu1[i]) i++;
  const kiru = (x) => (x === undefined ? '（行がありません）' : x.slice(0, 80));
  return `\n       ★読んだ本 …… ${HON}`
    + `\n                   ${hb.length.toLocaleString()} バイト ／ md5 ${crypto.createHash('md5').update(hb).digest('hex')} ／ ${honGyo.length} 行`
    + `\n       ★作り直したもの …… ${tb.length.toLocaleString()} バイト ／ md5 ${crypto.createHash('md5').update(tb).digest('hex')} ／ ${r1.dasu.split('\n').length} 行`
    + `\n       ★最初に違った行（「抜き出しもと:」を除いたあとの数え方）…… ${i + 1}行目`
    + `\n         本   ： ${kiru(nokosu2[i])}`
    + `\n         作り ： ${kiru(dasu1[i])}`;
};
{
  const onaji = nokosu2.join('\n') === dasu1.join('\n');
  ate('1バイトも違わない', onaji,
      `　［道具 ${Buffer.byteLength(dasu1.join('\n')).toLocaleString()} バイト ／ 本−1行 ${Buffer.byteLength(nokosu2.join('\n')).toLocaleString()} バイト］`
      + (onaji ? '' : kuwashiku1()));
}

/**
 * ★★★【2026-09-06・戦術Cowork `senjutsu_20260906r.md`「同じ穴が2か所」の決め】
 *   ★★**比べるときに「除く行」があるなら、その除く行に対して別の当てを1つ置きます**。
 *   ★★★**除く行は「比べない」と決めた行**で、★決めたその瞬間から**誰も見ていない行**になります。
 *     ★★誰も見ていない行に、姿（バイト・md5）を書いてはいけません。
 *   ★ここで見るのは …… ★`paidFields.ts` の11行目に書いてある**バイトと md5** が、
 *     ★**いま置き場にある基準HTMLのそれと同じ**であること。
 */
console.log('★当て1-2 …… ★★除いた11行目（「抜き出しもと:」）の姿が、いまの基準HTMLと合う');
{
  const moto = honGyo.find((g) => MOTO_GYO.test(g)) ?? '';
  const m = /（\s*([\d,]+)\s*バイト\s*[／/]\s*md5\s*([0-9a-f]{32})\s*）/.exec(moto);
  ate('11行目が「名前（Nバイト ／ md5 X）」の形', m !== null, `　［${moto.slice(0, 70)}…］`);
  if (m) {
    /**
     * ★★★**なぜ「渡されたもの」と比べないのか**（★2026-09-07・戦術Cowork `senjutsu_20260906s.md` 4番）
     *
     *   ★この門には **印なし**の基準HTMLが渡ります（★`shirushi_hazusu.mjs` を通したもの）。
     *   ★★ですが `paidFields.ts` の11行目に書いてあるのは、★**その本を作ったときに渡したもと**、
     *     つまり **印つき**の基準HTMLの姿です。
     *   ★★★**渡されたもの（印なし）と比べると、いつも違ってしまいます** ── ★空鳴りになります。
     *
     *   ★ですので、比べる先は `kitai.json` の **「もと」**にします。
     *   ★★**なぜそれでよいか（★つながりが切れないこと）**
     *     基準HTML（本物）
     *       ⟷ `kitai.json` の「もと」（★抽出の道具が毎回照合し、違えば札2・`kitai.json` 15〜16行目）
     *       ⟷ `paidFields.ts` の11行目（★この当てが照合）
     *     ── ★★**古いものどうしで通ってしまう道はありません**（★戦術Coworkが数えて確かめました）。
     *   ★★★**もし将来「もと」の照合が抽出の道具から外れたら、この当ては意味を失います**。
     *     ★そのときは、ここも一緒に見直してください。
     */
    const kitaiMoto = JSON.parse(fs.readFileSync(path.join(KOKO, 'kitai.json'), 'utf8'))['もと'] ?? {};
    const kaita = [Number(m[1].replace(/,/g, '')), m[2]];
    const ima = [kitaiMoto['バイト'], kitaiMoto.md5];
    ate('★★11行目に書いた姿が、`kitai.json` の「もと」と同じ', kaita[0] === ima[0] && kaita[1] === ima[1],
        `　［書いてある ${kaita[0].toLocaleString()} バイト ／ md5 ${kaita[1]}`
        + `　いま ${Number(ima[0] ?? 0).toLocaleString()} バイト ／ md5 ${ima[1]}］`);
  }
}

// ---------------------------------------------------------------- 当て1の2（★`no` と `label` の写し）
/**
 * ★★★【2026-09-07・戦術Cowork `senjutsu_20260907c.md` 1番】
 *   ★★**出どころは1つです** ── ★基準HTMLの `<label>⑯-1 あなたの新生命保険料の金額<small>…</small></label>`。
 *   ★`gamen7_chushutsu.mjs` は、★**この1つの字から `no` と `label` の両方を作っています**。
 *   ★★ですので `paidFields.ts` が持っているのは、★**同じ出どころからの2つの写し**です。
 *   ★★★**「1つにする道」は採りません**（★`label` から番号を落とすと、★基準HTMLの字を変えることになり、
 *     ★★見本の紙と画面がずれます）。★**要るのは「2つの写しが同じであること」を当てることです**。
 *   ★★★**ここは、いちばん早い所（★機械が作った直後）です**。
 *     ★★いちばん遅い所（★描いた画面）は `gamen7_egaku_mon.mjs` の当て(8) が見ています。
 *     ★**2つは違うものを見ています** ── ★前者は「機械が作った本が正しいか」、
 *       ★後者は「その本から画面が正しく出るか」。★★**片方では足りません**。
 */
{
  const t = fs.readFileSync(HON, 'utf8');
  const kumi = [...t.matchAll(/no: "([^"]+)", label: "([^"]+)"/g)].map((m) => [m[1], m[2]]);
  const chigau = kumi.filter(([no, lb]) => !lb.startsWith(no + ' ') && lb !== no);
  ate('★★`label` が `no` で始まる（★`no` と `label` は同じ出どころの2つの写し）',
      kumi.length === 34 && chigau.length === 0,
      `　［母数 ${kumi.length} ／ 食い違い ${chigau.length}］`
      + (chigau.length ? `\n       \`no\`「${chigau[0][0]}」／\`label\`「${chigau[0][1].slice(0, 30)}」` : ''));
}

// ---------------------------------------------------------------- 当て2
console.log('★当て2 …… 印を付けた本で、足した列と `no` の注記1行のほか1バイトも違わない');
const ariMichi = path.join(SAGYO, 'ari', NA);
fs.mkdirSync(path.dirname(ariMichi), { recursive: true });
const tsuke = shirushiTsukeru(MOTO, ariMichi);
// ★2026-09-06 …… ⑯が1つの欄から7つになり、28 → **34**（★足し算 5＋21＋8 ＝ 34）
ate('印を付けた数', tsuke.tsuketa === 34, `　［data-kagi ${tsuke.tsuketa}個］`);
const r2 = mawasu(ariMichi);
tomeru(r2, '当て2（印つきの本）');
ate('終わりの札が 0', r2.fuda === 0, `　［札 ${r2.fuda}］`);
/** ★足した列の行（★この形の行だけを除きます。★除いた数も出します） */
const TASHITA = /^(    bangou: |  bangou: string;|  toi: string;|  deru: string;|  \/\*\* 見える番号|  \/\*\* この欄が問い|  \/\*\* その問いに)/;
const NO_CHU = /^  \/\*\* (○数字。基準HTML|鍵の名前)/;
// ★「抜き出しもと:」も除きます（★md5 が入り、印を付けたもとでは変わるため）
const kezuru = (s) => s.split('\n').filter((g) => !TASHITA.test(g) && !NO_CHU.test(g) && !MOTO_GYO.test(g));
const a = kezuru(r1.dasu), b = kezuru(r2.dasu);
const kezutta = r2.dasu.split('\n').length - b.length;
// ★2026-09-06 …… 一覧 28 → **34**
ate('除いた行の数（足した列＋`no` の注記＋「抜き出しもと:」）', kezutta === 34 + 6 + 1 + 1,
    `　［${kezutta}行 ＝ 一覧 34 ＋ 型 6 ＋ 注記 1 ＋ ★もと 1］`);
ate('残りが1バイトも違わない', a.join('\n') === b.join('\n'),
    `　［印なし ${a.length}行 ／ 印つき ${b.length}行］`);
/** ★足した列の中身も見ます（★空でないこと ── 判断ログ 410番「空は静かに通してよい値ではない」） */
const toi = [...r2.dasu.matchAll(/toi: "([^"]+)"/g)].length;
const deru = [...r2.dasu.matchAll(/deru: "([^"]+)"/g)].length;
ate('`toi` が 2個・`deru` が 4個', toi === 2 && deru === 4, `　［toi ${toi}個 ／ deru ${deru}個］`);

// ---------------------------------------------------------------- 当て3（★壊し）
console.log('★当て3 …… 門3つが、壊すと鳴る（★壊しが入ったことを先に確かめます）');
/** ★★数えるのは**画面7の中だけ**です（★ほかの画面にも `<div class="field">` があります） */
const gamen7 = (h) => h.slice(h.indexOf('<b>画面7</b>'), h.indexOf('<b>画面8</b>', h.indexOf('<b>画面7</b>')));
for (const [na, kowasu, tashikame] of [
  // ★2026-09-06 …… 1つ消したあとの数が 27 → **33**（★34 − 1）
  ['ａ 項目の数', 'ａ', (m) => [(gamen7(m).match(/<div class="field"/g) || []).length, 33]],
  ['ｂ 印の無い欄', 'ｂ', (m) => [(gamen7(m).match(/data-kagi=/g) || []).length, 33]],
  ['ｃ 印の重なり', 'ｃ', (m) => [new Set([...gamen7(m).matchAll(/data-kagi="([^"]*)"/g)].map((x) => x[1])).size, 33]],
]) {
  const michi = path.join(SAGYO, `kowashi_${kowasu}`, NA);
  fs.mkdirSync(path.dirname(michi), { recursive: true });
  shirushiTsukeru(MOTO, michi, kowasu);
  const [deta, kime] = tashikame(fs.readFileSync(michi, 'utf8'));
  ate(`${na} …… ★壊しが入った`, deta === kime, `　［数えた ${deta}／決め ${kime}］`);
  const r = mawasu(michi);
  if (r.fuda === 'owaranai') {                                   // ★★捕まえた数に入れません（戦術 `senjutsu_20260905o.md` 4番・条件2）
    owaranai.push(na);
    console.log(`  ★★終わらなかった ${na} …… ★**${SEN_BYOU}秒**で切りました（★○でも NG でもありません・止めです）`);
    continue;
  }
  ate(`${na} …… ★門が鳴る`, r.fuda === 2, `　［札 ${r.fuda}］`);
}

// ---------------------------------------------------------------- 当て4（★C-5a・素通り9つ）
/**
 * ★★【C-5a・判断ログ 410番の(2)】★**終わりの札 0 で通ってしまう道 9つ**を、1つずつ壊して鳴らします。
 *   ★★どの壊しも「**壊しが本当に入ったこと**」を先に数えます（★判断ログ 585番の(2)）。
 *   ★★そして「**その門が鳴ったこと**」も見ます（★ほかの門が鳴って札2になっただけ、を通しません）
 */
console.log('★当て4 …… ★C-5a・素通り9つを、1つずつ壊して鳴らす');
/** ★画面7の中だけを切り出して直す（★ほかの画面を巻き込まないため） */
const g7naosu = (h, naosu) => {
  const i = h.indexOf('<b>画面7</b>'), j = h.indexOf('<b>画面8</b>', i);
  return h.slice(0, i) + naosu(h.slice(i, j)) + h.slice(j);
};
const KOWASHI = [
  ['(1) 項目0個', '(1) 項目の数が', (x) => x.replace(/<div class="field">/g, '<div class="fieldX">'),
   (x) => [(x.match(/<div class="field">/g) || []).length, 0]],
  ['(2) 組0個', '(2) 組が1つ以上', (x) => x.replace(/<div class="field">/g, '<div class="fieldX">'),
   (x) => [(x.match(/<div class="field">/g) || []).length, 0]],
  ['(3) 見出し（h2）空', '(3) 見出し（h2）が空でない', (x) => x.replace(/<h2>[\s\S]*?<\/h2>/, '<h2></h2>'),
   (x) => [(x.match(/<h2><\/h2>/g) || []).length, 1]],
  ['(4) 引き継ぎの説明 空', '(4) 引き継ぎの説明が空でない', (x) => x.replace(/<p class="hon">[\s\S]*?<\/p>/, '<p class="hon"></p>'),
   (x) => [(x.match(/<p class="hon"><\/p>/g) || []).length, 1]],
  ['(5) 詳細の見出し 0行', '(5) 詳細の見出しが1行以上', (x) => x.replace(/<summary>[\s\S]*?<\/summary>/, '<summary></summary>'),
   (x) => [(x.match(/<summary><\/summary>/g) || []).length, 1]],
  ['(6) 赤い注意書き 空', '(6) 赤い注意書きが空でない', (x) => x.replace(/<b class="warn">[\s\S]*?<\/b>/, '<b class="warn"></b>'),
   (x) => [(x.match(/<b class="warn"><\/b>/g) || []).length, 1]],
  ['(7) ボタンの字 空', '(7) ボタンの字が空でない', (x) => x.replace(/<div class="btn">[\s\S]*?<\/div>/, '<div class="btn"></div>'),
   (x) => [(x.match(/<div class="btn"><\/div>/g) || []).length, 1]],
  ['(8) ○数字が読めない', '(8) ○数字が読めない項目が0個', (x) => x.replace('<label>⑥', '<label>'),
   (x) => [(x.match(/<label>⑥/g) || []).length, 0]],
  /**
   * ★画面7のいちばん後ろに、★**閉じていない欄**を1つ足します。
   *   ★★`</div>` が1つも残っていない所で `fields()` が走るので、★**閉じ不足**になります。
   *   ★この欄には `<label>` がありませんので、★**項目の数は 28 のまま**です
   *   （★ですので (1) の門は鳴らず、★**(9) だけが鳴ります** ── ★狙った門が鳴ることを見られます）
   */
  ['(9) `</div>` の閉じ不足', '(9) `</div>` の閉じ不足が0個',
   (x) => x + '<div class="field">',
   // ★2026-09-06 …… 29 → **35**（★`<div class="field">`（属性なし）の数。★34 ＋ ⑫⑬の1つ）
   (x) => [(x.match(/<div class="field">/g) || []).length, 35]],
];
for (const [na, monNa, naosu, tashikame] of KOWASHI) {
  const michi = path.join(SAGYO, `c5a_${na.slice(1, 2)}`, NA);
  fs.mkdirSync(path.dirname(michi), { recursive: true });
  const h = g7naosu(fs.readFileSync(MOTO, 'utf8'), naosu);
  fs.writeFileSync(michi, h, 'utf8');
  const i = h.indexOf('<b>画面7</b>'), j = h.indexOf('<b>画面8</b>', i);
  const [deta, kime] = tashikame(h.slice(i, j));
  ate(`${na} …… ★壊しが入った`, deta === kime, `　［数えた ${deta}／決め ${kime}］`);
  const r = mawasu(michi);
  if (r.fuda === 'owaranai') {
    /** ★★**捕まえた数に入れません**。★別の行で数えます */
    owaranai.push(na);
    console.log(`  ★★終わらなかった ${na} …… ★**${SEN_BYOU}秒**で切りました（★○でも NG でもありません・止めです）`);
    continue;
  }
  /** ★★その門が鳴ったことも見ます（★ほかの門が鳴って札2、を通しません） */
  const nari = (r.err ?? '').includes(`★NG ${monNa}`);
  ate(`${na} …… ★門が鳴る`, r.fuda === 2 && nari, `　［札 ${r.fuda}／その門の NG ${nari ? 'あり' : '★なし'}］`);
}

fs.rmSync(SAGYO, { recursive: true, force: true });
console.log('');
/** ★壊しの数 …… 当て3 の 3つ ＋ 当て4（C-5a）の 9つ ＝ 12つ（★数えて書きます・判断ログ 628番） */
const KOWASHI_KAZU = 3 + KOWASHI.length;
console.log(`★壊し ${KOWASHI_KAZU}つ（★当て3 の 3つ ＋ 当て4 の ${KOWASHI.length}つ）。`
  + `★捕まえた ${KOWASHI_KAZU - owaranai.length}`
  + `／★★終わらなかった ${owaranai.length}`
  + (owaranai.length ? `（${owaranai.join(' / ')}）` : ''));
console.log(`★○ ${o} ／ NG ${ng}`);
if (owaranai.length) {
  console.log('★★終わらなかったものは ○ ではありません。★止めです（★捕まえた数に入れていません）');
}
/**
 * ★★★【2026-09-07・戦術Cowork `senjutsu_20260907e.md` お願い(2)】★**終わりの札を 2 にそろえました**
 *   ★前は `? 0 : 1` で、★**NG のとき札1**でした。★門（`*_mon.mjs`）は**札2**です。
 *   ★★そちらが `gamen_ate.mjs` で見つけてくださいましたが、★★★**こちらで数えたら 7本ありました**
 *     （`gamen_ate`・`gamen13_ate`・`gamen1_ate`・`gamen7_ate`・`gyousu_ate`・`iro_ate`・`shirushi_hazusu_ate`）。
 *   ★★**札1 に意味を持たせている所は、1つもありませんでした**（★`grep` で数えて 0件）。
 *   ★★★ですので ── ★**NG も「終わらなかった」も、札2 でそろえます**。
 */
process.exit(ng === 0 && owaranai.length === 0 ? 0 : 2);
