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
  /** **出せなかったかたまりの数**（下の2つの合計） */
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
   *   **その方に何と出すかは、決まっていません。**仕様の穴として戦術Coworkに投げます。
   */
  ochitaNashi: number;
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
  /** 入れた印の数（か所） */
  ireta: number;
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
): Kumi {
  const madaSet = new Set(mada);

  for (const na of Object.keys(atai)) {
    if (madaSet.has(na)) {
      throw new Error(
        `「${na}」は \`data-mada\`（エンジンにまだ出口が無い）ですが、値が渡されています。`
        + '**出口が無いはずのものに、どこかで値を作っています。**渡さないでください。',
      );
    }
  }

  const gyouNashiSet = new Set(gyouNashi);
  const dasu: BlockKyotsu[] = [];
  const ochitaNa = new Set<string>();
  const nashiNa = new Set<string>();
  const gyouNashiNa = new Set<string>();
  let ochitaMada = 0;
  let ochitaNashi = 0;
  let gyouNashiKazu = 0;
  let ireta = 0;

  /** 1つの文の中に、行を落とす名前があるか */
  const gyouOchiru = (s2: string) =>
    [...s2.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((m) => m[1]).filter((x) => gyouNashiSet.has(x));

  for (let b of blocks) {
    // **先に、その方には無い行／項目を落とします**（かたまりごとではありません）
    if (b.kind === 'hyo') {
      const nokosu = b.gyou.filter((g) => {
        const o = gyouOchiru(g.cells.join(' '));
        if (o.length) { gyouNashiKazu++; for (const x of o) gyouNashiNa.add(x); return false; }
        return true;
      });
      if (nokosu.length !== b.gyou.length) b = { kind: 'hyo', gyou: nokosu };
    } else if (b.kind === 'ret') {
      const nokosu = b.koumoku.filter((k) => {
        const o = gyouOchiru(k.bun);
        if (o.length) { gyouNashiKazu++; for (const x of o) gyouNashiNa.add(x); return false; }
        return true;
      });
      if (nokosu.length !== b.koumoku.length) b = { kind: 'ret', koumoku: nokosu };
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
    } else if (b.kind === 'ret') {
      dasu.push({ kind: 'ret', koumoku: b.koumoku.map((k) => ({ bun: ire(k.bun), na: k.na })) });
    } else if (b.kind === 'midashi') {
      dasu.push({ kind: 'midashi', lv: b.lv, bun: ire(b.bun) });
    } else if (b.kind === 'kousin') {
      dasu.push({ kind: 'kousin', bun: ire(b.bun) });
    } else {
      dasu.push({ kind: b.kind, bun: ire(b.bun), na: b.na });
    }
  }

  return { dasu, ochita: ochitaMada + ochitaNashi, ochitaMada, ochitaNashi,
           ochitaNa: [...ochitaNa], nashiNa: [...nashiNa],
           gyouNashiKazu, gyouNashiNa: [...gyouNashiNa], ireta };
}

/** 円の表記。**エンジンは数を返し、コンマはここで付けます** */
export const en = (v: number): string => `${v.toLocaleString('en-US')}円`;
/** 符号つきの円（マイナスは全角の − ＝基準HTMLと同じ字） */
export const enFu = (v: number): string =>
  v < 0 ? `−${Math.abs(v).toLocaleString('en-US')}円` : en(v);
