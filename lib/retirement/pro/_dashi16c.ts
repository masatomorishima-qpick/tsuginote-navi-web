// ★★★この本は、アプリから1か所も呼ばれません。`paidRules.ts` と `engine.ts` の当てのためだけに在ります。
//   ★★**写しを当てても、当てているのは写しです**（★判断ログ761番）── ★ですので、
//     ★本物の `./paidRules`・`./engine` を読み込むために、この場所に置いています。
//   ★何をする本か …… ★⑯-6 の上限（50,000円）を、★**入口（`paidRules.ts`）と engine の両方で**
//     境目のまわりで叩いて、★その結果を書き出すだけ（★当てるのは Python 側の `jishin_jogen_ts.py`）。
//   ★★`_dashi16c` を読み込んでいる本は、repo に **0本**です（★`node_modules` を除く）。
//
// ★★【2026-09-06・戦術Cowork `senjutsu_20260906q.md` 止め(B) 当て①②】
//   ★★★**この本の中に「壊し」はありません**。★TypeScript の `const` は、外から置き換えられません
//     （★`_dashi16.ts` は表が配列でしたので中身を差し替えられましたが、★数の `const` はできません）。
//   ★★ですので**壊しは、この本を回す側（`jishin_jogen_ts.py`）が**、
//     ★`lib/retirement/pro/` を**まるごと写した仮の所**で `50_000` を `500_000` に置き換えて、
//     ★★もう一度この本を回します（★**本番の回しは、本物の本をそのまま読みます**）。
//   ★★★**壊しの目的は「門が鳴るか」を見ることだけ**です。★本物を当てるほうは、上の回しで見ています。
import { rawToPaidInput, paidKou } from './paidRules';
import { JISHIN_KOJO_JOGEN, Jinbutsu } from './engine';

const NEN = 2026;                       // ★★既定値を作らない …… 呼び出し側（この本）から渡します

/** ★①〜⑤・⑩・⑱⑳など「必須」の欄を埋めた、いちばん素直な1人分 */
function moto(): Record<string, string> {
  return {
    '①': '1000', '②': '30', '③': '0', '④': '0', '⑤': '60',
    '⑩-1': '1200000', '⑩-2': '780000',
    '⑱': '6', '⑳': '65',
    '㉕/nai': 'hai', '㉓/nai': 'hai', '⑪/kensu': '0', '⑲/kensu': '0',
  };
}

type Kekka = {
  jishin: number; kyuChouki: number;
  tometa: boolean;           // ★入口が止めたか
  no: string[];              // ★止めた欄の番号
  ji: string[];              // ★出した字
};

/** ★入口（`paidRules.ts`）を、本物のまま叩きます */
function tataku(jishin: number, kyuChouki: number): Kekka {
  const raw = moto();
  raw['⑯-6'] = String(jishin);
  raw['⑯-7'] = String(kyuChouki);
  const y = rawToPaidInput(raw, NEN);
  if (y.ok) return { jishin, kyuChouki, tometa: false, no: [], ji: [] };
  return {
    jishin, kyuChouki, tometa: true,
    no: y.ayamari.map((a) => a.no),
    ji: y.ayamari.map((a) => a.ji ?? ''),
  };
}

/** ★engine 側（`hokenKojoShotoku` / `hokenKojoJumin`）を、本物のまま叩きます */
function engineTataku(jishin: number, kyuChouki: number) {
  try {
    const p = new Jinbutsu({ seinen: 1963, jishin_kojo: jishin, kyu_chouki: kyuChouki });
    return { nageta: false, shotoku: p.hokenKojoShotoku(), jumin: p.hokenKojoJumin(), ji: '' };
  } catch (e) {
    return { nageta: true, shotoku: -1, jumin: -1, ji: e instanceof Error ? e.message : String(e) };
  }
}

const MIRU = [0, 1, 49_999, 50_000, 50_001, 60_000, 500_000, 500_001, 200_000_000];
const out: string[] = [];
out.push(JSON.stringify({
  na: '__sugata__',
  jogen_ts: JISHIN_KOJO_JOGEN,          // ★★読み込んだ `engine.ts` の上限（★写しで回すと 500,000 になります）
  kou_kazu: paidKou(NEN).length,
  nen: NEN,
}));
for (const x of MIRU) {
  for (const k of [0, 20_000]) {
    out.push(JSON.stringify({ na: 'iriguchi', ...tataku(x, k) }));
    out.push(JSON.stringify({ na: 'engine', jishin: x, kyuChouki: k, ...engineTataku(x, k) }));
  }
}
process.stdout.write(out.join('\n') + '\n');
