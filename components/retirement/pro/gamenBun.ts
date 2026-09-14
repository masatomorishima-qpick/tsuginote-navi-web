/**
 * components/retirement/pro/gamenBun.ts
 *   ── 画面9〜12の**かたまりに、エンジンの値を入れる**（5画面で共通）
 *
 * 【ここは「見せ方」です。式は持ちません】
 *   戦術Coworkの決め（判断ログ82）「**エンジンは数を返し、見せ方は画面が作る**」。
 *   ここがするのは**基準HTMLから抜き出したかたまりに、エンジンが出した数を入れるだけ**です。
 *   **足し算も引き算も、条文の判定もしません。**
 *
 * ──────────────────────────────────────────────────────────
 * 【いちばん大事な決まり】**`data-mada` の付いた印は、1つも出しません**
 *
 *   `data-mada` は「**エンジンにまだ出口が無い**」という印です（判断ログ83②）。
 *   基準HTMLには、**見本の方（退職金2,000万円・60歳・5年）の値**が入っています。
 *   そのまま出すと、**別の方の画面に見本の方の金額が出ます。**
 *
 *   **ですので、`data-mada` を1つでも含むかたまりは、かたまりごと出しません。**
 *   空欄にもしません（空欄は利用者に見えます）。**出さないだけです。**
 *
 * 【なぜ「印ごと」ではなく「かたまりごと」なのか】
 *   1つの文の途中だけを抜くと、**残った文が別の意味になります。**
 *     「退職所得控除 ??? 20,600,000円」
 *   表も同じです。**3列のうち1列が空いた表**は、読めるようで読めません。
 *   ですので**文・表・箇条書きの単位で、まるごと出す／まるごと出さない**にしています。
 *
 * 【出せなかった数を、必ず返します】
 *   **黙って減らしません。**`ochita`（出せなかったかたまりの数）と
 *   `ochitaNa`（その理由になった名前）を返します。**0になるまで本番化しません。**
 * ──────────────────────────────────────────────────────────
 *
 * 【この主張が間違っていたら何が起きるか】
 *   19,800円をお支払いになった方の画面に、**別人（見本の方）の金額**が出ます。
 *   金額は本物らしく見えるので、**受け取った方には見分けられません。**
 */

/**
 * 表の1行。`cells` は左から順のセル
 *
 * ★★【2026-09-05・戦術Cowork `senjutsu_20260905u.md` 6番・森嶋さんの承認】
 *   ★`kazari` …… ★**セルごと・行ごとの名前**（`cells` を `\n` で割った順）。
 *     ★★**基準HTMLの `class` をそのまま**運びます（`tbls`／`up`／`same`）。★無い所は `null`。
 *     ★意味の名前に置き換えると**対応表**が要り、★「もと」が2つになります（609・613・617・636番）。
 *   ★`gyoKazari` …… ★**行そのものの名前**（`sum`／`shikiri`）。★無ければ入りません。
 *   ★★`cells` は **1文字も変えていません**（★門 `kensa/gyousu_mon.mjs` はそのまま動きます）。
 */
export type GyouKyotsu = {
  cells: readonly string[];
  na: readonly string[];
  kazari: readonly (readonly (string | null)[])[];
  gyoKazari?: string;
};

/**
 * かたまり。`kensa/gamen_chushutsu.mjs` が作る `BlockN` と**同じ形**です
 * （5画面ぶん同じなので、ここで1つだけ書いています）。
 */
export type BlockKyotsu =
  | { kind: 'midashi'; lv: 2 | 3; bun: string }
  | { kind: 'hon'; bun: string; na: readonly string[] }
  | { kind: 'hako'; bun: string; na: readonly string[] }
  | { kind: 'kousin'; bun: string }
  | { kind: 'ret'; koumoku: { bun: string; na: readonly string[] }[] }
  | { kind: 'hyo'; gyou: GyouKyotsu[] };

export type Kumi = {
  /** 出せたかたまり。**`{名前}` はエンジンの値に置き換わっています** */
  dasu: BlockKyotsu[];
  /**
   * **出せなかったかたまりの数**。
   *
   * ★★★【2026-09-13・決め1146】**`ochitaMada` ＋ `ochitaNashiNazo`** です。
   *   ★`ochitaNashiKime`（★戦術Coworkが落とすと決めたもの）は**入りません**。
   *   ★★決め940と同じ理由です ── ★**数えると、その方の帯が永久に消えません。**
   *   ★★★**ただし「まるごと数えない」ではありません**（★決め1146）── ★**名簿で分けます。**
   *     ★種類で決めると、同じ種類に入っている「まだ決めていないもの」も、いっしょに消えます。
   */
  ochita: number;
  /** そのうち **`data-mada`（エンジンに出口が無い）** で落ちた数。**こちらの宿題ではありません**（戦術Cowork） */
  ochitaMada: number;
  /**
   * そのうち **エンジンが「その方には存在しない」（`null`）と返した**ので落ちた数。
   *
   * 【`data-mada` と分けている理由】**別のことだからです。**
   *   `data-mada` … 出口そのものが無い。**作れば埋まります**
   *   `null`　　　 … 出口はあるが、**その方には存在しない**
   *     例：確定拠出年金が無い方の「口座管理手数料 66円×48か月」の行。
   *         66円も48か月も**存在しません**。0と書くと「0か月かかった」に読めます。
   *
   * ★★★【2026-09-13・決め1146】**この数には、2つのものが混ざっています。**
   *   ★下の `ochitaNashiKime` ＋ `ochitaNashiNazo` ＝ この数です（★合わせて返します）。
   */
  ochitaNashi: number;
  /**
   * ★★★**戦術Coworkが「この方には出さない」と決めて落としたかたまり**の数（★決め1146）。
   *
   *   ★落ちた理由の名前が**ぜんぶ `ochiteYoi`（名簿）に在る**ものだけを、ここに数えます。
   *   ★★**`ochita` には入れません**（★本番の止めにも、利用者に見える帯にも使いません）。
   *   ★★★**それでも返します** …… ★止まったときに**全体が見える**ように
   *     （★`ScreenBlocks.tsx` の止めの文に、この数と名前も書きます・決め1146(4)）。
   *     ★**黙って減らさない**ためです。
   */
  ochitaNashiKime: number;
  /**
   * ★★★**まだ何を出すか決まっていない `null`** で落ちたかたまりの数（★決め1146）。
   *
   *   ★落ちた理由の名前に、**名簿に無いものが1つでも在る**ものを、ここに数えます。
   *   ★★★**`ochita` に入れます** ── ★これは**仕様の穴**で、★戦術Coworkに投げるものです。
   *   ★★まるごと数えないと、★**その方の画面から字が1つ減ったことに、誰も気づきません**（★決め1146）。
   */
  ochitaNashiNazo: number;
  /** ★`ochitaNashiKime` の理由になった名前（★決め1146(4)・止めの文に書きます） */
  kimeNa: string[];
  /** 出せなかった理由になった名前（`data-mada` のもの） */
  ochitaNa: string[];
  /** 出せなかった理由になった名前（エンジンが `null` を返したもの） */
  nashiNa: string[];
  /**
   * **その方にはその行が無い**ので落とした、表の行／箇条書きの項目の数。
   *
   * 【`ochita` に入れていません・2026-08-23。戦術Coworkのご指摘】
   *   `koza_gyou = false` は「**出せなかった**」ではありません。
   *   「**エンジンが、この方にはこの行は無い、と決めた**」です。ふつうの分岐です。
   *
   *   `ochita` に数えると、その方（実測で400人中41人・10.3%）は
   *   **`data-mada` が0になっても「まだお見せできないところが1か所あります」の帯が
   *   永久に消えません。**
   */
  gyouNashiKazu: number;
  /** その行を落とす理由になった名前 */
  gyouNashiNa: string[];
  /**
   * ★★★**空になったので出さなかったかたまりの数**（★決め940・2026-09-08）。
   *   ★行・項目が `gyouNashi` で全部落ちた `hyo` / `ret` です。
   *   ★★**`ochita` には数えません**（★`data-mada` でも `null` でもない、ふつうの分岐です）。
   */
  karaOchi: number;
  /** 入れた印の数（か所） */
  ireta: number;
  /**
   * ★★★【2026-09-14・決め1164 門C】**`dasu` の1つ1つが、`blocks` の何番目だったか。**
   *
   * *   ★`dasu` は値を入れたあとのものですので、★**もとのどのかたまりかが、あとから分かりません**
   *     （★`midashi` は `na` を持ちません）。
   * *   ★★門C（節ごとに、1つ残らず落ちたかを見る門）は、この番号で突き合わせます。
   * *   ★★★**字で見分けません**（★基準HTMLの文言を写さないためです）。
   */
  dasuIndex: number[];
};

/** かたまりに出てくる `{名前}` を、順番のまま全部拾う（重なりも数えます） */
function naWoHirou(b: BlockKyotsu): string[] {
  const out: string[] = [];
  const hirou = (s: string) => { for (const m of s.matchAll(/\{([a-zA-Z0-9_]+)\}/g)) out.push(m[1]); };
  if (b.kind === 'hyo') for (const g of b.gyou) hirou(g.cells.join('\u0000'));
  else if (b.kind === 'ret') for (const k of b.koumoku) hirou(k.bun);
  else if (b.kind !== 'midashi' && b.kind !== 'kousin') hirou(b.bun);
  else hirou(b.bun);
  return out;
}

/**
 * かたまりに値を入れる。
 *
 * @param ochiteYoi
 *   ★★★**落としてよい名前の名簿**（★決め1146・2026-09-13・森嶋さんの承認）。
 *
 *   ★★`null` で落ちたかたまりには、**2つのもの**が混ざっていました ──
 *     (ア) 戦術Coworkが「この方には出さない」と**決めて**落としたもの（★決め1101・決め1141(3) ほか）
 *     (イ) ★**まだ何を出すか決めていない `null`** ＝ 仕様の穴
 *   ★★★**(ア)だけを `ochita` から外します。**★(イ)は、いままでどおり止めます
 *     ── ★まるごと外すと、★**(イ)が黙って消え、その方の画面から字が1つ減ったことに誰も気づきません**。
 *
 * @param blocks 基準HTMLから抜き出したかたまり（`GAMEN9` など）
 * @param mada   `data-mada` の名前（`MADA_NA`）。**ここに載っている印は1つも出しません**
 * @param atai   エンジンから取った値。**すべて文字列**（見せ方は呼ぶ側が決めます）
 *
 * @throws 出すかたまりの中に、値の渡されていない `{名前}` があったとき。
 *         **黙って `{名前}` を画面に出しません。**
 * @throws `atai` に `data-mada` の名前が入っていたとき。
 *         **出口が無いはずのものに、どこかで値を作っています。**
 *
 * @param gyouNashi
 *   **その方にはその行が無い**、とエンジンが決めた名前
 *   （画面11の口座管理手数料なら `koza_tanka` `koza_tsuki` `koza_kei`）。
 *
 *   **表の行／箇条書きの項目だけを落とします。かたまりごとではありません。**
 *   表ごと落とすと、給付事務手数料と合計まで消えます（戦術Cowork・2026-08-23）。
 *
 *   **段落や囲みの中に出てきたときは、例外で止めます。**
 *   そこで何を出すかは決まっていないので、**こちらで決めません。**
 */
export function kumitate(
  blocks: readonly BlockKyotsu[],
  mada: readonly string[],
  atai: Readonly<Record<string, string | null>>,
  gyouNashi: readonly string[] = [],
  ochiteYoi: Readonly<Record<string, number>> = {},
): Kumi {
  const madaSet = new Set(mada);
  /**
   * ★★★【2026-09-13・決め1146／★2026-09-14・決め1155 で形が変わりました】**落としてよい名前の名簿**。
   *
   * *   ★★★**名前だけではなく、「その名前で落とすかたまりの数」もいっしょに書きます**（★決め1155）。
   *     ★例 …… `{ kurisage_age: 2 }` ＝「`kurisage_age` で**2つ**落とす」。
   * *   ★★この名簿に在る名前だけで落ちたかたまりは、`ochitaNashiKime` に数え、★`ochita` に入れません。
   * *   ★★★**名簿に入れてよいのは、判断ログに決めが在る名前だけ**です（★決め1147(2)）。
   * *   ★★★**開発Coworkが勝手に増やしません**（★決め1147(3)）── ★増やす要りが出たら、そこで止めて投げます。
   */
  const yoiSet = new Set(Object.keys(ochiteYoi));

  for (const na of Object.keys(atai)) {
    if (madaSet.has(na)) {
      throw new Error(
        `「${na}」は \`data-mada\`（エンジンにまだ出口が無い）ですが、値が渡されています。`
        + '**出口が無いはずのものに、どこかで値を作っています。**渡さないでください。',
      );
    }
  }

  /**
   * ★★★【2026-09-13・決め1148 門B ／ ★2026-09-14・決め1155 で中身が変わりました】
   *   **名簿に書いた「落とすかたまりの数」と、実際に出てくる数が合っていること。**
   *
   * *   ★★前は「2つ以上なら止める」でした。★★★**それは決めの読み違いでした** ──
   *     ★`kurisage_age`・`sa_hajime_age`（決め1118(5)）と `ichiji_gen`（決め1101）は、
   *     ★★**見出しにも印を入れて、見出しごと落とすのが決め**でした。
   * *   ★ですので**数そのものを名簿に書き**、★★**書いた数と実際の数が違ったら止めます**。
   * *   ★★これで、基準HTMLを直してかたまりの数が動いたときに、★**機械が鳴ります**。
   * *   ★名簿が空のあいだは、1度も鳴りません。
   */
  if (yoiSet.size) {
    const kazoe = new Map<string, number>();
    for (const x of yoiSet) kazoe.set(x, 0);
    for (const b of blocks) {
      for (const x of new Set(naWoHirou(b))) {
        if (yoiSet.has(x)) kazoe.set(x, (kazoe.get(x) ?? 0) + 1);
      }
    }
    const chigau = [...kazoe].filter(([x, n]) => n !== ochiteYoi[x]);
    if (chigau.length) {
      throw new Error(
        `名簿に書いた「落とすかたまりの数」と、この画面の実際の数が違います： `
        + `${chigau.map(([x, n]) => `${x}（名簿 ${ochiteYoi[x]}／実際 ${n}）`).join('・')}。`
        + '**基準HTMLか名簿のどちらかが動いています。**'
        + 'こちらでは決めません。戦術Coworkに投げてください（決め1155 門B）。',
      );
    }
  }

  const gyouNashiSet = new Set(gyouNashi);
  const dasu: BlockKyotsu[] = [];
  /** ★`dasu` に入れたかたまりが、`blocks` の何番目だったか（★決め1164 門C） */
  const dasuIndex: number[] = [];
  const ochitaNa = new Set<string>();
  const nashiNa = new Set<string>();
  const gyouNashiNa = new Set<string>();
  const kimeNa = new Set<string>();
  let ochitaMada = 0;
  let ochitaNashi = 0;
  let ochitaNashiKime = 0;
  let ochitaNashiNazo = 0;
  let gyouNashiKazu = 0;
  let karaOchi = 0;
  let ireta = 0;

  /** 1つの文の中に、行を落とす名前があるか */
  const gyouOchiru = (s2: string) =>
    [...s2.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((m) => m[1]).filter((x) => gyouNashiSet.has(x));

  for (let bi = 0; bi < blocks.length; bi++) {
    let b = blocks[bi];
    // **先に、その方には無い行／項目を落とします**（かたまりごとではありません）
    if (b.kind === 'hyo') {
      const nokosu = b.gyou.filter((g) => {
        const o = gyouOchiru(g.cells.join(' '));
        if (o.length) { gyouNashiKazu++; for (const x of o) gyouNashiNa.add(x); return false; }
        return true;
      });
      if (nokosu.length !== b.gyou.length) b = { kind: 'hyo', gyou: nokosu };
      /**
       * ★★★【2026-09-08・戦術Cowork `senjutsu_20260908f.md` 決め940（道ア）】
       *   **行が1つも残らなかった表は、出しません。**
       *
       *   ★★前は、空のまま `dasu` に入れていました。★`ScreenBlocks` はそれを
       *     `<table><tbody></tbody></table>` と描きます（★**空の箱**が画面に出ます）。
       *   ★実測（`golden_light_20260906`・代表案10,000・画面12）……
       *     ・空の `<table>` が出る案 …… **6案（0.1%）**
       *     ・空の `<ul>` が出る案 …… ★★**4,417案（44.2%）**
       *   ★★開発Coworkが**描いて目で見て**見つけました（★読みでは出ませんでした・判断ログ938番）。
       *
       *   ★★**`ochita` には数えません。**★これは `gyouNashi` と同じ「ふつうの分岐」で、
       *     ★`data-mada`（出口が無い）でも `null`（その方に存在しない）でもありません。
       *     ★★数えると、その方の帯が永久に消えません（★`gyouNashi` と同じ理由）。
       *   ★★★別に **`karaOchi`** で数えます。
       */
      if (b.gyou.length === 0) { karaOchi++; continue; }
    } else if (b.kind === 'ret') {
      const nokosu = b.koumoku.filter((k) => {
        const o = gyouOchiru(k.bun);
        if (o.length) { gyouNashiKazu++; for (const x of o) gyouNashiNa.add(x); return false; }
        return true;
      });
      if (nokosu.length !== b.koumoku.length) b = { kind: 'ret', koumoku: nokosu };
      // ★★項目が1つも残らなかった箇条書きは、出しません（★上と同じ・決め940）
      if (b.koumoku.length === 0) { karaOchi++; continue; }
    } else {
      const o = gyouOchiru(b.bun);
      if (o.length) {
        throw new Error(
          `「${o.join(' ')}」は「その方にはこの行が無い」名前ですが、表や箇条書きの外`
          + `（${b.kind}）に出てきました。**そこで何を出すかは決まっていません。**`
          + 'こちらでは決めません。戦術Coworkに投げてください。',
        );
      }
    }
    const na = naWoHirou(b);
    const ng = na.filter((x) => madaSet.has(x));
    if (ng.length) {
      // **かたまりごと出しません。**空欄にもしません
      ochitaMada++;
      for (const x of ng) ochitaNa.add(x);
      continue;
    }
    // エンジンが「その方には存在しない」と返したもの（`null`）も、かたまりごと出しません
    const nashi = na.filter((x) => atai[x] === null);
    if (nashi.length) {
      ochitaNashi++;
      /**
       * ★★★決め1146(2) …… **落ちた理由の名前が、ぜんぶ名簿に在るか**で分けます。
       *   ★1つでも名簿に無い名前が在れば `ochitaNashiNazo`（★まだ決まっていない `null`）。
       *   ★★**「1つでも」**にしています ── ★かたまりは**まるごと**落ちますので、
       *     ★決めた名前と決めていない名前が混ざったら、★**決めていないほうが勝ちます**（★黙って消さない）。
       */
      if (nashi.every((x) => yoiSet.has(x))) {
        ochitaNashiKime++;
        for (const x of nashi) kimeNa.add(x);
      } else {
        ochitaNashiNazo++;
      }
      for (const x of nashi) nashiNa.add(x);
      continue;
    }
    for (const x of na) {
      if (atai[x] === undefined || atai[x] === '') {
        throw new Error(
          `かたまりに {${x}} が入っていません。エンジンが出した値を渡してください。`
          + `（このかたまりに出てくる名前： ${[...new Set(na)].join(' ')}）`,
        );
      }
    }
    ireta += na.length;

    const ire = (s: string) => {
      let t = s;
      for (const x of new Set(na)) t = t.split(`{${x}}`).join(atai[x] as string);
      const nokori = t.match(/\{[a-zA-Z0-9_]+\}/g);
      if (nokori) throw new Error(`入れ残しがあります： ${nokori.join(' ')}`);
      return t;
    };

    if (b.kind === 'hyo') {
      // ★`kazari`・`gyoKazari` は、**そのまま**運びます（★値を入れるのは `cells` だけです）
      dasu.push({ kind: 'hyo', gyou: b.gyou.map((g) => ({ cells: g.cells.map(ire), na: g.na, kazari: g.kazari, gyoKazari: g.gyoKazari })) });
      dasuIndex.push(bi);
    } else if (b.kind === 'ret') {
      dasu.push({ kind: 'ret', koumoku: b.koumoku.map((k) => ({ bun: ire(k.bun), na: k.na })) });
      dasuIndex.push(bi);
    } else if (b.kind === 'midashi') {
      dasu.push({ kind: 'midashi', lv: b.lv, bun: ire(b.bun) });
      dasuIndex.push(bi);
    } else if (b.kind === 'kousin') {
      dasu.push({ kind: 'kousin', bun: ire(b.bun) });
      dasuIndex.push(bi);
    } else {
      dasu.push({ kind: b.kind, bun: ire(b.bun), na: b.na });
      dasuIndex.push(bi);
    }
  }

  return { dasu, dasuIndex,
           // ★★★決め1146(3) …… `ochitaNashiKime` は入れません
           ochita: ochitaMada + ochitaNashiNazo,
           ochitaMada, ochitaNashi, ochitaNashiKime, ochitaNashiNazo,
           ochitaNa: [...ochitaNa], nashiNa: [...nashiNa], kimeNa: [...kimeNa],
           gyouNashiKazu, gyouNashiNa: [...gyouNashiNa], karaOchi, ireta };
}

/** 円の表記。**エンジンは数を返し、コンマはここで付けます** */
export const en = (v: number): string => `${v.toLocaleString('en-US')}円`;
/** 符号つきの円（マイナスは全角の − ＝基準HTMLと同じ字） */
export const enFu = (v: number): string =>
  v < 0 ? `−${Math.abs(v).toLocaleString('en-US')}円` : en(v);
