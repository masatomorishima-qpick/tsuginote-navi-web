/**
 * lib/retirement/pro/gamen8.ts ── `v5/gamen8.py` の移植
 *
 * **画面8の数字と分岐は、すべてここにあります。**実装（`Screen8.tsx`）は並べるだけです（§2の3）。
 *
 * 【落としてはいけない2つ】（Python版の書き出しをそのまま）
 *  1 **同点のときの並び（`kagi()`）。**⑳を軸に入れたことで「税金も手取りも同じで⑳だけが違う案」が
 *    11〜15通りできます。ここを落とすと**列挙した順で先頭が決まり、根拠なく
 *    「公的年金を61歳から」（＝繰上げ）を画面のおすすめとして出します。**繰上げの減額は一生続きます。
 *  2 **保険料・医療費の判定は「その案の⑳」で行う**（§6の10・判断ログ23）。
 *    入力された⑳ではありません。**入れ違えると3,568通りと18,326通りのように5倍ずれます。**
 *
 * 【この画面で使わないもの】通り数の表示・図・一覧は画面9以降です。ここでは出しません。
 */
import * as E from './engine';
import * as S from './sakaime';

/**
 * 4つの見方。**「税金がいちばん少ない」は入れません**
 * （2026-08-12・判断ログ17。8ケース中7ケースで①と同じ受け取り方になり、
 *  違った1ケースでも差は333円でした）
 */
export const MIKATA = [
  '① 手取りがいちばん多い',
  '② 最初の年に多く受け取る',
  '③ いちばん早く受け取り終える',
  '④ 保険料が上がらない',
] as const;

/**
 * 保険料・医療費の境目を見る年齢の範囲。**55歳から100歳まで**
 * （`summary_data.py` の `AGES` と同じ。**ここを狭めると境目を見落とします**）
 */
const AGE_FROM = 55, AGE_TO = 100;

/**
 * 全通りの1行（画面8が見る形）。
 * ★2026-09-02（senjutsu_20260902x.md 4番の1・A-2a）── 一覧（上位7行）と Excel も同じ行を使うので `export` します。
 */
export type Row = {
  pl: E.Plan;
  lab: string;
  zei: number;
  tedori: number;
  owari: number;
  /** 最初の年（＝**受け取る年・退職の年**）に手元に入る額。★「今年」ではありません（ah.md 1番） */
  age0: number;
  h: S.Koeta[];
  nenkin_age: number | null;
};

export type KijunAn = {
  tedori: number; lab: string; ken: number; onaji: boolean;
  taishoku_age: number; kijun_age: number; saitan_age: number; kijun_nen: number;
  /** 入力の⑳のままで基準が取れたか。**false のとき、いちばん近い⑳にそろえています** */
  koteki_nyuryoku: boolean;
  koteki_age: number | null;
  /** 画面に出す言い方。**60歳で固定しないでください** */
  hyoji: string;
};

/**
 * 「あなたが選べる中で、いちばん早く両方を一時金で受け取る受け取り方」を1つ返す。
 *
 * 【なぜこれがあるか・E-23／2026-08-18】
 *   画面8とPDFの①結論は、「多くの方が選ぶ『同じ年にまとめて一時金』」を基準に差を出していました。
 *   その探し方が「受け取り年が同じ案」だったため、**⑤＜最短受給年齢の方では1件も見つからず**、
 *   「多くの方が選ぶ『同じ年にまとめて一時金』が、あなたにとってもいちばんでした。」に落ちていました。
 *   **その方には、その受け取り方が存在しません。**無料版の407人では200人（49%）が該当します。
 *
 * **見つからないときは null を返します。**
 * **呼び出し側は、null のときに「あなたにとってもいちばんでした」の側へ落ちてはいけません。**
 * それが E-23 です。`gamen8()` は null のとき例外で止めます。
 */
export function kijunAn(p: E.Jinbutsu, D: Row[], taishokuNen: number, taishokuAge: number,
                        taiName: string, idecoName: string): KijunAn | null {
  const ide = p.gens.find((g) => g.name === idecoName);
  if (!ide) throw new Error(`iDeCo等の支給源「${idecoName}」がありません`);
  // 【E-14】月で数える。kikanNensu()（所得税法の切り上げ）を渡さないこと
  const saitanAge = E.idecoSaitanAge(ide.kikan[1] - ide.kikan[0] + 1);
  const kijunAge = Math.max(saitanAge, taishokuAge);
  const kijunNen = taishokuNen + (kijunAge - taishokuAge);

  // 一時金だけ・退職金は⑤の年・iDeCo等は基準の年
  let ko = D.filter((x) =>
    x.pl.nenkin_gen === null && x.pl.ichiji_wariai === 0
    && x.pl.uketori_nen[idecoName] === kijunNen
    && Object.entries(x.pl.uketori_nen)
        .every(([k, v]) => k === idecoName || v === taishokuNen));
  if (!ko.length) return null;

  // ⑳は入力のまま（E-12の直し）。⑳を選び直した案まで含めると、
  // **公的年金の影響をよけた案**が「何もしなかった場合」として並びます。
  const sonomama = ko.filter((x) =>
    x.pl.nenkin_kaishi_age === null || x.pl.nenkin_kaishi_age === p.koteki_kaishi_age);

  /** 入力の⑳にいちばん近いもの。同じ距離なら**繰上げでないほう** */
  const chikai = (x: Row): [number, number] => {
    const a = x.pl.nenkin_kaishi_age;
    if (a === null) return [0, 0];
    return [Math.abs(a - p.koteki_kaishi_age), a >= p.koteki_kaishi_age ? 0 : 1];
  };
  const cmp2 = (a: [number, number], b: [number, number]) => a[0] - b[0] || a[1] - b[1];

  if (sonomama.length) {
    ko = sonomama;
  } else {
    // **入力の⑳が選べない方**（すでに繰下げの上限年齢を過ぎている方など）。
    // 黙って別の⑳の案を基準にすると、比べているものが入れ替わるので、
    // **いちばん近い⑳にそろえたうえで、そうしたことを戻り値に残します。**
    const m = ko.map(chikai).reduce((a, b) => (cmp2(a, b) <= 0 ? a : b));
    ko = ko.filter((x) => cmp2(chikai(x), m) === 0);
  }
  const x = ko.reduce((a, b) =>
    (b.tedori - a.tedori || (a.pl.label <= b.pl.label ? -1 : 1)) > 0 ? b : a);

  return {
    tedori: x.tedori, lab: x.pl.label, ken: ko.length,
    onaji: kijunAge === taishokuAge,
    taishoku_age: taishokuAge, kijun_age: kijunAge,
    saitan_age: saitanAge, kijun_nen: kijunNen,
    koteki_nyuryoku: sonomama.length > 0,
    koteki_age: x.pl.nenkin_kaishi_age,
    // 画面に出す言い方（項目4・オーナー承認 2026-08-17／18）。
    // **同じ年とはかぎらないので「同じ年にまとめて」とは書きません。**
    hyoji: `${taiName}${taishokuAge}歳・${idecoName}${kijunAge}歳`,
  };
}

export type Houkou = {
  lab: string; mikata: string[]; tedori: number; zei: number;
  owari: number; age0: number; nenkin_age: number | null;
  /**
   * この案で**新たに**超える境目。
   *
   * 【E-27・2026-08-19／開発Coworkの指摘】**Python版より項目を増やしています。**
   *   `gamen8.py` は `key / name / age / koka / konkyo` の5つだけを返しますが、
   *   **画面に出す文には足りません。**基準HTMLはこう書いています。
   *     「介護保険料の段階（第1段階から第2段階へ）
   *       （**65歳・あなたの年金収入等1,000,000円／基準826,500円**）」
   *   ここに要るのは `age` のほかに **`shotoku`（所得の呼び名）・`shotoku_gaku`（その方の額）・
   *   `gaku`（国が定める基準額）** です。5つでは書けません。
   *   `summary_gen.py` は `gamen8()` の戻り値を使わず、内部の `houkou` を直に見て回避しています。
   *   **それだと、資料を作る道と実装の道が別々になります。E-23 と同じ形です。**
   *   ですので**こちらは8つ返します。**Python 側も8つに揃えていただきたく、投げています。
   */
  sakaime: { key: string; name: string; age: number; koka: string; konkyo: string;
             shotoku: string; shotoku_gaku: number; gaku: number }[];
  /** 手取りがいちばん多い案との差。**先頭の方向は必ず0円** */
  sa: number;
};

export type Gamen8 = {
  houkou: Houkou[];
  /** **カードの数。1つ／2つ／3つで文が変わります**（§5-2） */
  kado_su: number;
  mikata_zenbu: string[];
  yon_matomaru: boolean;
  /** ④が出せなかったか。**出せないことを黙って隠しません** */
  hoken_agaranai_nashi: boolean;
  hoken_agaranai_su: number;
  saidai: number; saisho: number; haba: number;
  /** 通り数（画面9以降で使う。**画面8には出しません**） */
  toorisu: number;
  /**
   * ④A その方が、**すでに公的年金を受け取り始めているか**
   * （＝ `p.year(p.koteki_kaishi_age) < genzaiNen`）
   *
   * ★**`kijun.koteki_nyuryoku` と混ぜないでください。名前が似ていますが、別のものです。**
   *   `koteki_nyuryoku` … 「①結論の基準の案が、入力の⑳のままで取れたか」（117行あたり）
   *   `koteki_sudeni`   … 「その方が、もう受け取り始めているか」（この行）
   *   （戦術Cowork `senjutsu_20260831g.md` 4番）
   *
   * ★**分岐はここに置きます。**`gamen8Bun()` にも `Screen8.tsx` にも式を持たせません（§2の3）。
   */
  koteki_sudeni: boolean;
  hoken_hantei: string;
  /** 【E-23】①結論の基準。**`gamen8()` は null では返しません**（見つからなければ例外で止まります） */
  kijun: KijunAn;
};

/**
 * ★全通りを、画面8が見る形（`Row[]`・保険料の判定つき）に並べ直す。
 *
 * 【2026-09-02・A-2a（senjutsu_20260902x.md 4番の1）】`gamen8()` の中にあったものを、そのまま関数に切り出しました。
 *   ★一覧（上位7行）と Excel（シート2）も同じ行を使います。★41,216通りで約6秒かかる部分ですので、
 *   ★口は1回だけ回して `gamen8(…, { d })` に渡します（二度作りません）。
 *   ★中身は1文字も変えていません（`gamen8()` の出力は同じ・golden もそのまま）。
 *
 * 【2026-09-02・A-2a（senjutsu_20260902ah.md 1番）】3つ目の引数の名前を `genzaiNen` から **`uketoriNen`** に変えました。
 *   ★★意味は「**受け取る年（＝退職の年）**」です。「今年」ではありません。
 *   ★`gamen8.py` 131行の注記は最初から「受け取る年」でした。TS 側が「今年」を渡していたので、
 *     ⑤が先の方（退職の年が今年より後）は `age0`（最初の年に入る額）が全案 0 になっていました。
 *   ★`gamen8()` の `genzaiNen`（今年）は ④A（`koteki_sudeni`）だけが使います。**2つを混ぜないでください。**
 *
 * @param uketoriNen **受け取る年（＝退職の年）**。★呼び出し側から渡します（既定値を作りません）
 */
export function zenToori(R: [E.Plan, E.EvalResult][], p: E.Jinbutsu, uketoriNen: number,
                         idecoName = 'iDeCo等'): Row[] {
  /**
   * この受け取り方で、**新たに**超える境目があるか（§6の10）。
   * **その案の⑳で所得を組み立てます。入力された⑳ではありません。**
   */
  const hoken = (pl: E.Plan) => {
    const q = (pl.nenkin_kaishi_age === null || pl.nenkin_kaishi_age === p.koteki_kaishi_age)
      ? p : p.withKotekiKaishiAge(pl.nenkin_kaishi_age);
    const nen = E.nenkinByYear(q, pl);
    const ari: Record<number, E.Joukyou> = {}, nashi: Record<number, E.Joukyou> = {};
    for (let a = AGE_FROM; a <= AGE_TO; a++) {
      const y = q.year(a);
      ari[a] = E.shotokuJoukyou(q, y, nen[y] ?? 0);
      nashi[a] = E.shotokuJoukyou(q, y, 0);
    }
    return S.check(ari, nashi);
  };

  // --- 全通りを、画面8が見る形に並べ直す ---
  const D: Row[] = [];
  for (const [pl, r] of R) {
    const nen = E.nenkinByYear(p, pl);
    const years = [...Object.keys(nen).map(Number), ...r.keika.map((k) => k.year)];
    const owari = p.age(Math.max(...years));
    const age0 = r.keika.filter((k) => k.year === uketoriNen)
                        .reduce((a, k) => a + k.shunyu, 0)
                 + (nen[uketoriNen] ?? 0);
    D.push({
      pl, lab: pl.label.replace(`${idecoName}を`, ''),
      zei: r.zei, tedori: r.tedori, owari, age0,
      h: hoken(pl), nenkin_age: pl.nenkin_kaishi_age,
    });
  }
  return D;
}

/**
 * 画面8に出すものを全部返す。
 *
 * @param R **⑳を軸にして作った `build()` の戻り**を渡してください。
 *   ⑳を軸にしないで作ると答えが変わります（公的年金350万・⑳=60歳の方で、
 *   手取りの最大が 36,671,034円 ↔ 37,388,268円。差 717,234円）。
 *   **呼び出し側が作ったものを渡します。**ここで作り直すと待ち時間が2倍になります。
 * @param genzaiNen ★**今年**です。★この関数の中で使うのは **④A（`koteki_sudeni`）だけ**です
 *   （senjutsu_20260902ah.md 1番）。★`zenToori()` に渡すのは「受け取る年（＝`opts.taishokuNen`）」で、別のものです。
 * @param opts.d ★`zenToori(R, p, opts.taishokuNen)` の戻り。★渡せば中で作り直しません（A-2a・二度作らないため）。
 *   ★渡さなければ中で作ります（いままでと同じ動き・署名は変わりません）。
 */
export function gamen8(p: E.Jinbutsu, genzaiNen: number,
                       R: [E.Plan, E.EvalResult][],
                       opts: { taishokuNen: number; taishokuAge: number;
                               taiName: string; idecoName?: string; d?: Row[] }): Gamen8 {
  const idecoName = opts.idecoName ?? 'iDeCo等';

  // ★3つ目は「受け取る年」です（今年ではありません・senjutsu_20260902ah.md 1番）
  const D: Row[] = opts.d ?? zenToori(R, p, opts.taishokuNen, idecoName);
  if (!D.length) throw new Error('受け取り方が1つもありません。build() の呼び方を確かめてください');

  const hayai = Math.min(...D.map((x) => x.owari));
  const cl = D.filter((x) => x.h.length === 0);   // 保険料・医療費が上がらない案

  /**
   * 同点のときの並び（③④⑤）。**小さいほど上位**
   *   ③ ⑳が、入力された年齢に近い順
   *   ④ 差が同じなら、繰上げでないほう
   *   ⑤ ラベルの文字順（**ここまで入れると、列挙の順に依存しません**）
   */
  const kagi = (x: Row): [number, number, string] => {
    const a = x.nenkin_age;
    return [a === null ? 0 : Math.abs(a - p.koteki_kaishi_age),
            (a === null || a >= p.koteki_kaishi_age) ? 0 : 1,
            x.pl.label];
  };
  /** 数値の並びを先頭に足して、最小のものを1つ選ぶ（Python の min(key=…) と同じ） */
  const erabu = (xs: Row[], atama: (x: Row) => number[]): Row => {
    const key = (x: Row) => [...atama(x), ...kagi(x)] as (number | string)[];
    return xs.reduce((a, b) => {
      const ka = key(a), kb = key(b);
      for (let i = 0; i < ka.length; i++) {
        if (ka[i] === kb[i]) continue;
        return (ka[i] as number) < (kb[i] as number) ? a : b;
      }
      return a;
    });
  };

  // --- 4つの見方（①②は全通りから、③は「いちばん早い」の中から、④は上がらない案の中から）---
  const erabi: (Row | null)[] = [
    erabu(D, (x) => [-x.tedori]),
    erabu(D, (x) => [-x.age0, -x.tedori]),
    erabu(D.filter((x) => x.owari === hayai), (x) => [-x.tedori]),
    cl.length ? erabu(cl, (x) => [-x.tedori]) : null,
  ];

  // --- 同じ受け取り方に落ちる見方をまとめる（＝方向）---
  const houkou: { x: Row; mikata: string[] }[] = [];
  erabi.forEach((x, i) => {
    if (x === null) return;                       // ④が出せない方
    const g = houkou.find((h) => h.x.lab === x.lab);
    if (g) g.mikata.push(MIKATA[i]);
    else houkou.push({ x, mikata: [MIKATA[i]] });
  });

  const saidai = Math.max(...D.map((x) => x.tedori));
  const saisho = Math.min(...D.map((x) => x.tedori));

  // 【E-23・実装側でやること2】**null なら止めます。**
  // 「あなたにとってもいちばんでした」の文へ落としてはいけません。
  const kijun = kijunAn(p, D, opts.taishokuNen, opts.taishokuAge, opts.taiName, idecoName);
  if (kijun === null) {
    throw new Error(
      '【E-23】①結論の基準になる受け取り方が1件も見つかりませんでした。'
      + 'この方の画面8は出せません。**「あなたにとってもいちばんでした」に落とさないでください。**'
      + `（⑤=${opts.taishokuAge}歳／退職の年=${opts.taishokuNen}／通り数=${D.length}）`);
  }

  return {
    houkou: houkou.map((g) => ({
      lab: g.x.lab, mikata: [...g.mikata],
      tedori: g.x.tedori, zei: g.x.zei, owari: g.x.owari, age0: g.x.age0,
      nenkin_age: g.x.nenkin_age,
      sakaime: g.x.h.map((s) => ({
        key: s.key, name: s.name, age: s.age, koka: s.koka, konkyo: s.konkyo,
        // 【E-27】画面の文に要る3つ。Python版には無い（上のコメント）
        shotoku: s.shotoku, shotoku_gaku: s.shotoku_gaku, gaku: s.gaku,
      })),
      sa: saidai - g.x.tedori,
    })),
    kado_su: houkou.length,
    mikata_zenbu: [...MIKATA],
    yon_matomaru: houkou.length === 1,
    hoken_agaranai_nashi: erabi[3] === null,
    hoken_agaranai_su: cl.length,
    saidai, saisho, haba: saidai - saisho,
    toorisu: D.length,
    // ④A **現在の年は、呼び出し側から渡された `genzaiNen` です。既定値を作りません**
    koteki_sudeni: p.year(p.koteki_kaishi_age) < genzaiNen,
    hoken_hantei: 'その案の公的年金を受け取り始める年齢で判定',
    kijun,
  };
}
