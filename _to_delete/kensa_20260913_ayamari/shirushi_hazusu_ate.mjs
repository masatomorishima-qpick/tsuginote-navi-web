/**
 * kensa/shirushi_hazusu_ate.mjs ── ★`kensa/shirushi_hazusu.mjs`（印を外す道具）の当て
 *
 * ★★道具を書いただけでは、★**外せているか**も、★**門が鳴るか**も分かりません（★判断ログ 649番）。
 *
 * ★当て1 …… ★★**期待する値で当てます**（★門は期待する値を持ち、比べて止める）
 *   ★164,868（印173）→ ★★**155,413 ／ md5 `b2353571818d78a669d6ea2ba6786679`**
 *     ── ★`hikiwatashi/tsuginote_gamen_base_20260812.html` と**1バイトも違わない**はず
 * ★姿: bin/senjutsu/tsuginote_gamen_base.html（179,553バイト ／ md5 5be20ed2ded9e44c1ecdc9ec8ba817ce）
 *   ★★【2026-09-07・戦術Cowork `senjutsu_20260907b.md` 3番・4番】
 *     ★★★**まず、この行の先頭を `★姿:` にして回しました ── 鳴りました**（★判断ログ638番）。
 *       `★NG shirushi_hazusu_ate.mjs …… \`★姿:\` 9行目「bin/senjutsu/tsuginote_gamen_base.html」を`
 *       `　測ると合う　［測った 175,669バイト ／ md5 8ec8fbfd　★頭 167,382バイト ／ md5 3d653d30］`
 *       ★★**書いてあったのは 167,382 ／ `3d653d30…`** ── ★**2つ前の姿**でした。
 *     ★★★そのうえで直しました。★★**この当ては、いま回っていませんでした**
 *       （★引数に古い数が書いてあり、★誰も渡していなかったためです）。
 * ★当て2 …… ★**壊して、門が鳴ることを見せます**（★3つ ＝ ★もとを壊す2つ ＋ ★★道具を壊す1つ）
 *   壊し1 …… ★もとから印を先に全部外して渡す → ★★「外した印の数が 0 でない」が鳴る
 *   壊し2 …… ★もとの印の中に `<span>` を1つ入れる …… → ★★「入れ子が無い」が鳴る
 *   ★★★壊し3 …… ★**道具そのものを壊す**（★中身を返す所を `=> ''` に）→ ★★「字が1文字も変わらない」が鳴る
 *     ★★はじめ「もとの印の中の字を消す」で書きましたが、★**鳴りませんでした**。
 *       ★★そして**鳴らないのが正しかった**のです（★もとが消えれば、出したものも同じだけ消えます）。
 *       ★★★**この門は「もとと出したもの」を比べる門ですので、もとを壊しても当たりません**
 * ★当て3 …… ★★**引数を渡さないと 札2**（★既定値を作っていないこと）
 *
 * ★★終わらないとき …… `SEN_BYOU` 秒で切り、★**「捕まえた」に数えません**（★別の札です）
 *   ★ふつうの時間 …… **0.09／0.10／0.10／0.13／0.10 秒**（★`shirushi_hazusu.mjs` を5回まわして測りました）
 *     ★いちばん遅い **0.13秒**
 *   ★線 …… **60秒**（★いちばん遅い時間の **461倍** ── ★桁が2つ違います）
 *
 * 使い方: node kensa/shirushi_hazusu_ate.mjs <もとの基準HTML> [<凍らせた本>]
 *   ★★★【2026-09-07・戦術Cowork `senjutsu_20260907b.md` 4番の決め】
 *     ★★**使い方の字から、古い数（167,382・164,868）を消しました**。
 *     ★★★**数そのものを、使い方の字に書きません**（★§「既定値を作らない」）
 *       ── ★数を書き換えるのではなく、★**書かない**ほうを採りました。
 *     ★★**期待する値は `kitai.json` の「もと」と「もと印なし」から引きます**
 *       ── ★★★**当ての中にも、数を書きません**。
 *     ★★`<凍らせた本>` は**なくても回ります**（★無ければ「母数の外」と1行出します・★判断ログ805番）。
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { kijunWoTashikameru } from './kijun_tashikame.mjs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const [IMA, TOSHI] = process.argv.slice(2);
if (!IMA) {
  console.error('★ 使い方: node kensa/shirushi_hazusu_ate.mjs <もとの基準HTML> [<凍らせた本>]');
  process.exit(2);
}

const KOKO = path.dirname(new URL(import.meta.url).pathname);

/**
 * ★★★【2026-09-07・戦術Cowork `senjutsu_20260907e.md` お願い(2) を追ううちに見つけました】
 *   ★★**この本は、渡された基準HTMLを確かめていませんでした**。
 *   ★★★**壊して測ると ── 違う基準HTMLを渡しても、★終わりの札が 0 のままでした**。
 *     ★前の便で「名指しして鳴る」と数えたのは**字だけ**で、★★**札は見ていませんでした**
 *     ── ★★★**「札で数える」と「字で数える」は別の母数**（★判断ログ838番）。★こちらの数え落としです。
 *   ★★ですので、★**渡されたものを、はじめに確かめます**（★`kijun_tashikame.mjs`・1か所に置いた形）。
 */
kijunWoTashikameru(KOKO, IMA, 'もと');

const DOUGU = path.join(KOKO, 'shirushi_hazusu.mjs');
const SAGYO = fs.mkdtempSync(path.join(os.tmpdir(), 'hazusu-'));
const SEN_BYOU = 60;

let o = 0, ng = 0;
const owaranai = [];
const ate = (na, ii, setsumei = '') => {
  if (ii) { o++; console.log(`  ○ ${na}${setsumei}`); }
  else { ng++; console.log(`  ★NG ${na}${setsumei}`); }
};
function mawasu(hiki) {
  const r = spawnSync('node', hiki, { encoding: 'utf8', timeout: SEN_BYOU * 1000, killSignal: 'SIGKILL' });
  if ((r.error && r.error.code === 'ETIMEDOUT') || r.signal === 'SIGKILL' || r.signal === 'SIGTERM') {
    return { fuda: 'owaranai', dasu: '', err: r.stderr ?? '' };
  }
  return { fuda: r.status ?? -1, dasu: r.stdout ?? '', err: r.stderr ?? '' };
}
const md5 = (michi) => createHash('md5').update(fs.readFileSync(michi)).digest('hex');
const gyou = (err, na) => (err.split('\n').find((l) => l.includes(na)) ?? `★「${na}」の行がありません`).trim();

// ---------------------------------------------------------------- 当て1（★期待する値）
/**
 * ★★【期待する値】★★★**この本の中に、数を書きません**（★2026-09-07・戦術Cowork `senjutsu_20260907b.md` 4番）
 *   ★「いまの先頭」の期待する値は、★**`kitai.json` の「もと印なし」から引きます**。
 *     ★★そこは `shirushi_hazusu.mjs` を回して測って書いた所です（★手で写していません）。
 *   ★★★**なぜ本の中に書かないか** …… ★この本は、★**古い数（167,382・157,884）を書いたまま、
 *     ★誰にも渡されず、★回っていませんでした**。★★数を本の中に書くと、★**必ず古くなります**。
 *   ★「凍らせた本」の期待する値は、★**戦術Coworkの書き置き（`_furui_20260902/README.txt`）と
 *     `hikiwatashi/tsuginote_gamen_base_20260812.html` の md5** から来ています（★凍っているので動きません）。
 *     ★★**渡されなければ、母数の外**と1行出します（★判断ログ805番）。
 */
const KITAI_JSON = JSON.parse(fs.readFileSync(path.join(KOKO, 'kitai.json'), 'utf8'));
const MOTO_NASHI = KITAI_JSON['もと印なし'];
if (!MOTO_NASHI) {
  console.error('★ `kitai.json` に「もと印なし」がありません ── ★この当ては、期待する値を引けません');
  process.exit(2);
}
console.log(`★記録 …… 期待する値は \`kitai.json\` の「もと印なし」から引きました`
  + `　［${Number(MOTO_NASHI['バイト']).toLocaleString('en-US')}バイト ／ md5 ${MOTO_NASHI.md5}`
  + ` ／ 外した印 ${MOTO_NASHI['外した印の数']}個］`);
console.log(`   ★そのもと …… ${Number(MOTO_NASHI['もとのバイト']).toLocaleString('en-US')}バイト`
  + ` ／ md5 ${MOTO_NASHI['もとのmd5']}`);
const KITAI = [
  ...(TOSHI
    ? [['凍らせた本（印173）', TOSHI, 155413, 'b2353571818d78a669d6ea2ba6786679', 173]]
    : []),
  ['いまの先頭', IMA, MOTO_NASHI['バイト'], MOTO_NASHI.md5, MOTO_NASHI['外した印の数']],
];
if (!TOSHI) {
  console.log('  ・凍らせた本 …… 渡されていません（★母数の外'
    + '　［この当ての母数 …… 0本 ／ 見る本 1本中'
    + '　★★0 が正しい姿です（凍らせた本は、渡したときだけ当てます）］）');
}
console.log('★当て1 …… ★★期待する値で当てます');
for (const [na, moto, kitaiByte, kitaiMd5, kitaiKazu] of KITAI) {
  const dasu = path.join(SAGYO, `${path.basename(moto)}.nashi.html`);
  const r = mawasu([DOUGU, moto, dasu]);
  if (r.fuda === 'owaranai') {
    owaranai.push(`★当て1（${na}）`);
    console.log(`  ★★終わらなかった 当て1（${na}） …… ★**${SEN_BYOU}秒**で切りました`);
    continue;
  }
  ate(`${na} …… 終わりの札が 0`, r.fuda === 0, `　［札 ${r.fuda}］`);
  if (!fs.existsSync(dasu)) { ate(`${na} …… 出したものがある`, false, '　［★ありません］'); continue; }
  const b = fs.statSync(dasu).size, m = md5(dasu);
  ate(`${na} …… バイトが期待どおり`, b === kitaiByte, `　［${b.toLocaleString('en-US')} ／ 期待 ${kitaiByte.toLocaleString('en-US')}］`);
  ate(`${na} …… md5 が期待どおり`, m === kitaiMd5, `　［${m} ／ 期待 ${kitaiMd5}］`);
  const hazu = Number(/外した (\d+)個/.exec(r.err)?.[1] ?? -1);
  ate(`${na} …… 外した印の数が期待どおり`, hazu === kitaiKazu, `　［${hazu}個 ／ 期待 ${kitaiKazu}個］`);
  ate(`${na} …… 出したものに印が 0個`, (fs.readFileSync(dasu, 'utf8').match(/class="hito"|data-na=/g) || []).length === 0,
      `　［${(fs.readFileSync(dasu, 'utf8').match(/class="hito"|data-na=/g) || []).length}個］`);
}

// ---------------------------------------------------------------- 当て2（★壊し3つ）
console.log('★当て2 …… ★★壊して、門が鳴ることを見せます');
const kowashi = [
  {
    na: '壊し1 印を先に全部外して渡す',
    naosu: (s) => s.replace(/<span class="hito"[^>]*>([\s\S]*?)<\/span>/g, (z, n) => n),
    kazu: (s) => (s.match(/class="hito"/g) || []).length,
    kime: 0,
    monNa: '外した印の数が 0 でない',
  },
  {
    na: '壊し2 印の中に `<span>` を1つ入れる',
    naosu: (s) => s.replace(/<span class="hito"([^>]*)>([\s\S]*?)<\/span>/, (z, a, n) => `<span class="hito"${a}><span>${n}</span></span>`),
    kazu: (s) => (s.match(/<span class="hito"[^>]*><span>/g) || []).length,
    kime: 1,
    monNa: '入れ子が無い',
  },
];
for (const k of kowashi) {
  const kijun = path.join(SAGYO, `${k.na.replace(/[^0-9]/g, '')}.html`);
  const kowareta = k.naosu(fs.readFileSync(IMA, 'utf8'));
  fs.writeFileSync(kijun, kowareta, 'utf8');
  ate(`${k.na} …… ★壊しが入った`, k.kazu(kowareta) === k.kime, `　［数えた ${k.kazu(kowareta)}／決め ${k.kime}］`);
  const dasu = path.join(SAGYO, `${k.na.replace(/[^0-9]/g, '')}.nashi.html`);
  const r = mawasu([DOUGU, kijun, dasu]);
  if (r.fuda === 'owaranai') {
    owaranai.push(k.na);
    console.log(`  ★★終わらなかった ${k.na} …… ★**${SEN_BYOU}秒**で切りました`);
    continue;
  }
  const g = gyou(r.err, k.monNa);
  ate(`${k.na} …… ★「${k.monNa}」が鳴る`, g.startsWith('★NG') && r.fuda === 2, `\n       ${g}`);
  ate(`${k.na} …… ★★書き出していない（★黙って出しません）`, !fs.existsSync(dasu),
      `　［出したもの ${fs.existsSync(dasu) ? 'あります' : 'ありません'}］`);
}

// ---------------------------------------------------------------- 当て2の3（★★道具そのものを壊す）
/**
 * ★★★【2026-09-05・こちらの誤り。★先に書きます】
 *   ★はじめ、壊し3 を「★**もと**の印の中の字を消す」で書きました。★★**鳴りませんでした**。
 *   ★★そして ── ★**鳴らないのが正しかった**のです。★もとの字が消えれば、出したものの字も同じだけ消えます。
 *     ★★**もとを壊しても、この門は「もとと出したもの」を比べる門ですので、当たりません**。
 *   ★★★ですので ── ★**道具そのものを壊します**（★判断ログ・「壊しは道具そのものの穴も出す」）。
 *     ★中身を返すところ（`(zenbu, naka) => naka`）を `=> ''` に変え、★**字を落とす道具**にします。
 */
console.log('★当て2の3 …… ★★★道具そのものを壊す（★中身を落とす道具にする）');
{
  const kowareta = path.join(SAGYO, 'kowareta_dougu.mjs');
  const t = fs.readFileSync(DOUGU, 'utf8');
  const MAE = 'const dasu = moto.replace(HITO_SPAN, (zenbu, naka) => naka);';
  const ATO = "const dasu = moto.replace(HITO_SPAN, () => '');";
  ate('★壊しが入った（道具の1行）', t.includes(MAE) && (t.match(new RegExp(MAE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length === 1,
      `　［その行 ${(t.match(new RegExp(MAE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length}か所／決め 1］`);
  fs.writeFileSync(kowareta, t.replace(MAE, ATO), 'utf8');
  const dasu = path.join(SAGYO, 'kowareta.nashi.html');
  const r = mawasu([kowareta, IMA, dasu]);
  if (r.fuda === 'owaranai') {
    owaranai.push('★当て2の3（道具を壊す）');
    console.log(`  ★★終わらなかった 当て2の3 …… ★**${SEN_BYOU}秒**で切りました`);
  } else {
    const g = gyou(r.err, '字が1文字も変わらない');
    ate('★★★「字が1文字も変わらない」が鳴る', g.startsWith('★NG') && r.fuda === 2, `\n       ${g}`);
    ate('★★書き出していない（★黙って出しません）', !fs.existsSync(dasu),
        `　［出したもの ${fs.existsSync(dasu) ? 'あります' : 'ありません'}］`);
  }
}

// ---------------------------------------------------------------- 当て3（★既定値を作っていないこと）
console.log('★当て3 …… ★★引数を渡さないと 札2（★既定値を作っていない）');
{
  const r0 = mawasu([DOUGU]);
  ate('引数なし …… 札2', r0.fuda === 2, `　［札 ${r0.fuda}］`);
  const r1 = mawasu([DOUGU, IMA]);
  ate('出す先だけ渡さない …… 札2', r1.fuda === 2, `　［札 ${r1.fuda}］`);
  const r2 = mawasu([DOUGU, path.join(SAGYO, 'ないほん.html'), path.join(SAGYO, 'x.html')]);
  ate('無いもとを渡す …… 札2', r2.fuda === 2, `　［札 ${r2.fuda}］`);
}

fs.rmSync(SAGYO, { recursive: true, force: true });
console.log('');
console.log(`★壊し ${kowashi.length + 1}つ（★もとを壊す ${kowashi.length}つ ＋ ★★道具を壊す 1つ）。`
  + `★捕まえた ${kowashi.length + 1 - owaranai.length}`
  + `／★★終わらなかった ${owaranai.length}` + (owaranai.length ? `（${owaranai.join(' / ')}）` : ''));
console.log(`★○ ${o} ／ NG ${ng}`);
if (owaranai.length) console.log('★★終わらなかったものは ○ ではありません。★止めです（★捕まえた数に入れていません）');
/**
 * ★★★【2026-09-07・戦術Cowork `senjutsu_20260907e.md` お願い(2)】★**終わりの札を 2 にそろえました**
 *   ★前は `? 0 : 1` で、★**NG のとき札1**でした。★門（`*_mon.mjs`）は**札2**です。
 *   ★★そちらが `gamen_ate.mjs` で見つけてくださいましたが、★★★**こちらで数えたら 7本ありました**
 *     （`gamen_ate`・`gamen13_ate`・`gamen1_ate`・`gamen7_ate`・`gyousu_ate`・`iro_ate`・`shirushi_hazusu_ate`）。
 *   ★★**札1 に意味を持たせている所は、1つもありませんでした**（★`grep` で数えて 0件）。
 *   ★★★ですので ── ★**NG も「終わらなかった」も、札2 でそろえます**。
 */
process.exit(ng === 0 && owaranai.length === 0 ? 0 : 2);
