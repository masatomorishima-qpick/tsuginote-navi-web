/**
 * kensa/atama_ate.mjs ── ★`kensa/atama_mon.mjs` の当て（★門が、壊すと鳴るか）
 *
 * ★★【なぜ要るか】★門を足しただけでは、★**その門が本当に鳴るか**は分かりません（★585番）。
 *   ★★とくにこの門は、★**「食い違いが無いこと」を言う門**です。
 *     ★★★**何も見ていなくても ○ が並びます**ので、★壊して鳴らさないと信じられません（★620番）。
 *
 * ★★【やり方】★`/tmp` に**作業の写し**を作ります（★もとの `kensa/` と本には1バイトも書きません）
 *   ・`kensa/` …………… **写し**（★壊すのはこちら）
 *   ・`components/…` … **写し**（★本を壊す壊しがあるためです）
 *   ・`bin/` ……………… **つなぎ**（★読むだけ・壊しません）
 *
 * ★★【壊し・6つ】（★見るもの(1)〜(6) に1つずつ）
 *   ★どの壊しも (ｱ)**壊す前の字が1つだけあること** → (ｲ)**壊しが入ったこと** →
 *     (ｳ)**その門の `★NG` が出たこと** の順に数えます（★札2になっただけ、を通しません）
 *
 * 使い方: node kensa/atama_ate.mjs
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { neWoHikuKa } from './ne_wo_hiku.mjs';

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
/** ★基準HTMLの置いてある所（★`atama_mon.mjs` の (4) が見ます） */
const KIJUN = neWoHikuKa(KOKO, 'kijun');

let fuda = 0, mita = 0;
const ate = (na, yoi, ji = '') => {
  mita++;
  if (yoi) console.log(`  ○ ${na}　${ji}`);
  else { fuda = 2; console.log(`★NG ${na}　${ji}`); }
};

/** ★作業の写しを作ります */
const SAGYO = fs.mkdtempSync(path.join(os.tmpdir(), 'atama-'));
fs.cpSync(KOKO, path.join(SAGYO, 'kensa'), { recursive: true });
fs.cpSync(path.join(NE, 'components/retirement/pro'), path.join(SAGYO, 'components/retirement/pro'),
          { recursive: true });
/**
 * ★★★【2026-09-07・戦術Cowork `senjutsu_20260907d.md` 4番】★**`bin` のつなぎを外しました**
 *   ★前は `fs.symlinkSync(NE/bin, SAGYO/bin)` でした。★★**その先には基準HTML（175,669バイト）と、
 *     便ぜんぶ（`bin/senjutsu/`・`bin/kaihatsu/`）があります**。
 *   ★★こちらで数えました …… ★**壊し6つの行き先は `kensa/` 5つ ＋ `components/…/gamen13.ts` 1つ ＝ 6つ**。
 *     ★★★**`bin/` に書くものは 0 です** ── ★いまは安全でしたが、★**仕組みとしては、
 *     開発が踏んだ「つなぎを通って本物に書く」と同じ形**でした。
 *   ★★★ですので ── ★**そもそも `bin` を写しに入れません**（★どの壊しも見ていません）。
 *     ★基準HTML は、写しの `ne.json` の `kijun` が**本物の置き場**を指しますので、これで足ります。
 */
/**
 * ★★★【2026-09-06・戦術Cowork `senjutsu_20260906q.md` 5番「止め⑤ ＝ 案ア」】
 *   ★`atama_mon.mjs` が `ne.json`（★置き場からの**相対**）で根を引くようになりました。
 *   ★★写しを `/tmp` に作りますので、★**写しの中の相対は、そのままでは解けません**。
 *   ★★★ですので ── ★**写しの `ne.json` を、写しの置き場からの相対に書き直します**
 *     （★`repo` は写しの根、★`kijun` は**本物の基準HTMLの置き場**を指させます）。
 *     ★★書き直すのは**写しの中だけ**です（★もとの `kensa/ne.json` には1バイトも書きません）。
 *   ★★これは「壊し」ではありません。★**写しをもとと同じ姿にそろえるための、置き直し**です。
 */
const UTSU_KENSA = path.join(SAGYO, 'kensa');
const UTSU_NE = { repo: '..', kijun: path.relative(UTSU_KENSA, KIJUN) };
fs.writeFileSync(path.join(UTSU_KENSA, 'ne.json'), JSON.stringify(UTSU_NE, null, 2) + '\n');

/**
 * ★★★【2026-09-08・戦術Cowork `senjutsu_20260908e.md` お願い(2)】
 *   ★**`★姿:` の行が指す本を、機械で集めて写します。**
 *
 *   ★★**なぜ手で並べないか** …… ★前は `kensa/` と `components/retirement/pro/` の2つだけを
 *     手で並べていました（★`fs.cpSync` を2回）。
 *   ★★★ところが `keisoku_mon.mjs` の `★姿:` は **`app/layout.tsx`** と
 *     **`components/ClarityScript.tsx`** を指しており、★**どちらも写しに入っていませんでした。**
 *     ★`atama_mon` の (5) は「その本がある」を確かめますので、★★**写しの中で 札2 になります。**
 *   ★★**実測（2026-09-08・戦術Cowork `senjutsu_20260908e.md` 1節）** ……
 *     ★写しの中で鳴っていた `★NG` は **2行**（★上の2本）。★本物の `atama_mon` は **札0**。
 *     ★★★**`keisoku_mon.mjs` がその2本を `★姿:` に書いた日から、`atama_ate` は札2 でした。**
 *   ★★★ですので ── ★**手で並べるのをやめ、`★姿:` の行から機械で集めます。**
 *     ★（★「見張りを壊しの行き先から機械で作る」のと、同じ形です。）
 *
 *   ★★**集めた本は、写しの中の同じ道に置きます**（★`app/layout.tsx` は `<写し>/app/layout.tsx`）。
 *   ★★★**もとの本には1バイトも書きません。**★写しに読み取り専用の写しを作るだけです。
 */
const SUGATA_MICHI = /^\s*\*?\s*★姿:\s*([^（(]+?)\s*[（(]/;
const utsusuMichi = new Set();
const binMichi = new Set();
for (const na of fs.readdirSync(KOKO).filter((x) => x.endsWith('.mjs'))) {
  const atama = fs.readFileSync(path.join(KOKO, na), 'utf8').split('\n').slice(0, 120);
  for (const g of atama) {
    const m = SUGATA_MICHI.exec(g);
    if (!m) continue;
    const michi = m[1].trim();
    // ★`kensa/` と `components/retirement/pro/` は、もう写しに入っています（★上の `cpSync`）
    if (michi.startsWith('kensa/') || michi.startsWith('components/retirement/pro/')) continue;
    // ★★`bin/` は**わざと写しに入れません**（★上の覚え書き・便ぜんぶと基準HTMLがあるため）。
    //   ★基準HTMLは、写しの `ne.json` の `kijun` が**本物の置き場**を指しますので、これで足ります。
    if (michi.startsWith('bin/')) { binMichi.add(michi); continue; }
    utsusuMichi.add(michi);
  }
}
let utsushita = 0, nakatta = 0;
for (const michi of [...utsusuMichi].sort()) {
  // ★★`bin/…` は repo ではなく置き場の側です（★`bin` は写しに入れません・下の覚え書き）
  const moto = path.join(NE, michi);
  if (!fs.existsSync(moto)) { nakatta++; continue; }
  const saki = path.join(SAGYO, michi);
  fs.mkdirSync(path.dirname(saki), { recursive: true });
  fs.copyFileSync(moto, saki);
  utsushita++;
}
console.log(`★記録 …… \`★姿:\` の行から集めて写した本 …… **${utsushita}本**`
  + `（★見つからなかった道 ${nakatta}本 ／ 集めた道 ${utsusuMichi.size}本`
  + ` ／ ★\`bin/\` なので写さなかった道 ${binMichi.size}本）`);
if (utsusuMichi.size) console.log(`       ★写した道 …… ${[...utsusuMichi].sort().join(' ／ ')}`);
if (binMichi.size) console.log(`       ★\`bin/\` の道 …… ${[...binMichi].sort().join(' ／ ')}`);

/**
 * ★★★【2026-09-07・戦術Cowork `senjutsu_20260907d.md` 4番】★**見張りを、壊しの行き先から機械で作ります**
 *   ★★**なぜ手で並べないか** …… ★手で並べると、★**壊しを1つ足した日に、見張りの母数がずれます**。
 *     ★★★**そちらの字** ──「壊しの行き先から機械で作れば、壊しを足したときに見張りが自動でついてきます」。
 *   ★★**見張るのは「本物」です**（★写しではありません）。★写しの中の道を、本物の道に直します ──
 *     ・`kensa/…`  → ★この置き場（`KOKO`）の下
 *     ・それ以外   → ★repo（`NE`）の下
 *   ★★★**開発が 2026-09-07 に踏んだ落ち**（★つなぎを通って本物の `paidRules.ts` に書いた）を、
 *     ★**この当てでも、二度と黙って起こさないため**です（★判断ログ830番）。
 */
const honmonoNoMichi = (michi) =>
  michi.startsWith('kensa/') ? path.join(KOKO, michi.slice('kensa/'.length)) : path.join(NE, michi);
const sugataHitotsu = (m) =>
  `${fs.readFileSync(m).length} ${createHash('md5').update(fs.readFileSync(m)).digest('hex')}`;

const mawasu = () => {
  const r = spawnSync('node', [path.join(SAGYO, 'kensa/atama_mon.mjs')], { encoding: 'utf8' });
  return { fuda: r.status ?? 9, ji: (r.stdout ?? '') + (r.stderr ?? '') };
};

console.log('★記録（★これは門ではありません。★見たものを書き残すだけです）');
console.log(`   作業の写し …… ${SAGYO}`);
console.log(`   ★もとの \`kensa/\` と本には、★**1バイトも書きません**`);
console.log(`   ★写しの \`ne.json\` …… ${JSON.stringify(UTSU_NE)}`);
console.log('');

// ---------------------------------------------------------------- もとの姿
const moto = mawasu();
ate('壊す前は、終わりの札が 0', moto.fuda === 0, `　［札 ${moto.fuda}］`);
const maruMoto = (moto.ji.match(/^ {2}○ /gm) ?? []).length;
ate('壊す前の ○ が1つ以上', maruMoto > 0, `　［○ ${maruMoto}］`);

/**
 * ★1つ壊して、鳴るかを見ます
 *   michi … 壊すファイル（作業の写しの中）
 *   mae   … 壊す前の字（★1つだけあること）
 *   ato   … 壊したあとの字
 *   naru  … 鳴ってほしい門の名前（★その字を含む `★NG` の行があること）
 */
/** ★★壊しの行き先（★機械で集めます。★手で並べません） */
const IKISAKI = new Set();
/** ★★見張りの、壊す前の姿（★1つ目の壊しの前に測ります） */
let MIHARI = null;

const kowasu = (na, michi, mae, ato, naru) => {
  console.log(`★壊し「${na}」`);
  IKISAKI.add(michi);
  if (MIHARI === null) {
    MIHARI = new Map();
  }
  const honmono = honmonoNoMichi(michi);
  if (!MIHARI.has(michi)) MIHARI.set(michi, sugataHitotsu(honmono));
  const m = path.join(SAGYO, michi);
  const motoJi = fs.readFileSync(m, 'utf8');
  const kazu = motoJi.split(mae).length - 1;
  ate(`  ａ 壊す前の字が1つだけある`, kazu === 1, `　［数えた ${kazu}個 ／ ${michi}］`);
  if (kazu !== 1) return;
  fs.writeFileSync(m, motoJi.replace(mae, ato));
  const ima = fs.readFileSync(m, 'utf8');
  ate(`  ｂ 壊しが入った`, ima !== motoJi && ima.includes(ato), `　［${motoJi.length} → ${ima.length} 字（★バイトではなく字数です）］`);
  const r = mawasu();
  const ng = (r.ji.match(/^★NG .*$/gm) ?? []).filter((x) => x.includes(naru));
  ate(`  ｃ その門が鳴る`, r.fuda === 2 && ng.length > 0,
      `　［札 ${r.fuda} ／ その門の ★NG ${ng.length}行］`
      + (ng.length ? `\n       ${ng[0].slice(0, 96)}` : `\n       ★★その門の ★NG がありません（鳴った門 ${(r.ji.match(/^★NG /gm) ?? []).length}）`));
  fs.writeFileSync(m, motoJi);      // ★もどします（★次の壊しに混ざらないように）
  const modoshi = mawasu();
  ate(`  ｄ もどすと、また 0 になる`, modoshi.fuda === 0, `　［札 ${modoshi.fuda}］`);
  /** ★★★ｅ …… **本物が1バイトも変わっていない**（★見張り・上の説明） */
  const ugoita = [...MIHARI.entries()].filter(([mi, sug]) => sugataHitotsu(honmonoNoMichi(mi)) !== sug);
  ate(`  ｅ 本物の本が1バイトも変わっていない`, ugoita.length === 0,
      `　［見張り ${MIHARI.size}本（★壊しの行き先から機械で作りました）／ 動いた ${ugoita.length}］`
      + (ugoita.length ? `\n       ★★★${ugoita[0][0]} …… もと ${ugoita[0][1]} ／ いま ${sugataHitotsu(honmonoNoMichi(ugoita[0][0]))}` : ''));
};

// ---- (1) 頭の1行目の名前
kowasu('(1) 頭の1行目の名前を、別の道具の名前にする',
       'kensa/gamen13_ate.mjs',
       ' * kensa/gamen13_ate.mjs ──',
       ' * kensa/gamen1_ate.mjs ──',
       '頭の1行目が自分の名前を言っている');

// ---- (2) 中身の `i === M`
kowasu('(2) 中身の `i === 10` を `i === 9` にする（★頭は「11行目」のまま）',
       'kensa/gamen13_ate.mjs',
       'if (i === 10) continue;',
       'if (i === 9) continue;',
       '中身の `i === 10` と合う');

// ---- (3) 本の N行目
kowasu('(3) 本（`gamen13.ts`）の 11行目を、「もと:」でない字にする',
       'components/retirement/pro/gamen13.ts',
       ' * もと: bin/senjutsu/tsuginote_gamen_base.html',
       ' * つくり: bin/senjutsu/tsuginote_gamen_base.html',
       '11行目が「もと:」');

// ---- (4) 頭に書いた姿
kowasu('(4) 頭に書いた姿のバイト数を、1つ増やす',
       'kensa/gamen7_ate.mjs',
       // ★★★2026-09-07 …… ★`gamen7_ate.mjs` の頭を **`★姿:` の印**にしましたので、★壊す字も直しました
       //   （★戦術Cowork `senjutsu_20260907b.md` 3番の決め ── ★「いま」ではなく決まった印で当てる）
       //   ★これで壊すのは (4) ではなく **(5) `★姿:` の当て**になります。★鳴る門の名前も直しました。
       '★姿: bin/senjutsu/tsuginote_gamen_base.html（179,553バイト ／ md5 5be20ed2ded9e44c1ecdc9ec8ba817ce）',
       '★姿: bin/senjutsu/tsuginote_gamen_base.html（179,554バイト ／ md5 5be20ed2ded9e44c1ecdc9ec8ba817ce）',
       '`★姿:` 26行目「bin/senjutsu/tsuginote_gamen_base.html」を測ると合う');

// ---- (5) 頭の「いま」に添えた日付・姿
/**
 * ★★★【2026-09-07・戦術Cowork `senjutsu_20260907b.md` 3番の決め】★**壊し(5) を差し替えました**
 *   ★前は「頭の**『いま』**に添えた日付と姿を、外す」でした。
 *   ★★`atama_mon.mjs` の (5) が **「いま」という言葉 → `★姿:` の印**に変わりましたので、
 *     ★**壊す字も、印のある行に変えました**（★2本目の本で鳴らします）。
 *
 * ★★★**気になる所を1つ（★戦術Coworkにうかがいます・★止めではありません）**
 *   ★★`★姿:` の**印そのものを外す**と、★★★**この当ては黙って「母数の外」になります**
 *     （★`★姿:` の行が 0行 → 「0 が正しい姿です」と出て、★**鳴りません**）。
 *   ★★これは**判断ログ798番（除く行が、除かれたまま古くなる）と同じ形**です ──
 *     ★**印を外せば、その行は誰も見なくなります**。
 *   ★★こちらの案 …… ★**`kitai.json` に「`★姿:` を持つ本の一覧と、その行数」を持たせ、
 *     ★減ったら鳴らす**。★★ですが、★**新しい台帳を増やすことになります**ので、
 *     ★★★**入れずに、うかがいます**（★勝手に決めません）。
 */
kowasu('(5) `★姿:` の行のバイト数を、1つ増やす',
       'kensa/shirushi_hazusu_ate.mjs',
       '★姿: bin/senjutsu/tsuginote_gamen_base.html（179,553バイト ／ md5 5be20ed2ded9e44c1ecdc9ec8ba817ce）',
       '★姿: bin/senjutsu/tsuginote_gamen_base.html（179,554バイト ／ md5 5be20ed2ded9e44c1ecdc9ec8ba817ce）',
       '「bin/senjutsu/tsuginote_gamen_base.html」を測ると合う');

// ---- (6) `★姿:` の印そのものを外す
/**
 * ★★★【2026-09-07・戦術Cowork `senjutsu_20260907c.md` 5番(1)】
 *   ★★**印そのものを外したときに鳴るか**を見ます。
 *   ★★★**これが、この当ての中でいちばん大事な壊しです** ── ★前は、
 *     ★**印を外すと黙って「母数の外」になり、★誰も鳴りませんでした**（★798番と同じ形）。
 *   ★★いまは `kitai.json` の「★姿を持つ本」が台帳になり、★**数が減ると鳴ります**。
 */
kowasu('(6) `★姿:` の印そのものを外す（★印を別の字にする）',
       'kensa/obi_hakari.mjs',
       ' * ★姿: bin/senjutsu/',
       ' * すがた: bin/senjutsu/',
       '(6) obi_hakari.mjs …… `★姿:` の印が減っていない');


console.log('');
console.log(`★壊し 6つ。★見た当て ${mita}個`);
console.log(`★★見張り …… **${MIHARI ? MIHARI.size : 0}本**（★壊しの行き先 ${IKISAKI.size}本から機械で作りました`
  + `　★手で並べていません）`);
console.log(`   ${[...IKISAKI].join(' ／ ')}`);
fs.rmSync(SAGYO, { recursive: true, force: true });
console.log('');
if (fuda) { console.log('★★終わりの札 2'); process.exit(2); }
console.log('★終わりの札 0 ── ★6つの壊しは、どれもその門を鳴らしました');
