/**
 * lib/loan/excel.ts — 計算結果のExcel出力（2026-07-31 新設・v2.1）
 *
 * 絶対要件（指示書0）：出力するのは「値」ではなく **数式が生きているワークブック**。
 *   ユーザーが「入力」シートの残高・金利・年数・繰り上げ額を書き換えたら、
 *   他のシートがすべて再計算されなければならない。値を直書きした表は、
 *   開いた瞬間から更新できない死んだ表になるため不可。
 *
 * 設計方針：
 * - **このファイルは React にも DOM にもライブラリにも依存しない純関数**にする。
 *   ブラウザ（ボタン押下時に動的import した write-excel-file）と Node（検証スクリプト）の
 *   両方から同じロジックで生成でき、LibreOffice での再計算検証を自動で回せるため。
 * - **時変値を埋め込まない**（指示書2-3）。フラット35金利・借り換え先の想定金利・
 *   借り換え費用の定数は、将来変わるとファイルが古い前提のまま持ち歩かれるので入れない。
 *   したがって「借り換えとの比較（画面の出力D）」はワークブックに含めない。
 * - 名前定義（named range）は write-excel-file が非対応のため、すべて `入力!$B$2` 形式の
 *   セル参照で書く（2026-07-31 masato 承認）。読み手が追えるよう、入力シートのA列に項目名を置き、
 *   各シートに読み下し文を添える。
 *
 * 償還表の行数について（実装judgment・2026-07-31）：
 *   指示書は「残りの返済年数×12（最大420行＝35年まで）」だが、**常に420行を生成し、
 *   各行を IF で「回数 ≤ 年数×12」に制限**している。生成時の年数ぶんだけ行を作ると、
 *   ユーザーが入力シートの年数を**増やした**ときに表が足りず、絶対要件（入力を変えたら
 *   再計算される）を満たせなくなるため。年数を減らした場合も余った行は空欄になる。
 */

/** write-excel-file に渡すセル（ライブラリ型に依存しないよう最小限で定義する）。 */
export type XlsxCell = {
  value?: string | number | null;
  type?: 'Formula' | StringConstructor | NumberConstructor;
  format?: string;
  fontWeight?: 'bold';
  backgroundColor?: string;
  color?: string;
  align?: 'left' | 'center' | 'right';
  wrap?: boolean;
  span?: number;
} | null;

export interface XlsxSheet {
  data: XlsxCell[][];
  sheet: string;
  columns?: { width: number }[];
}

export interface LoanWorkbookInput {
  /** 'karikae'（借り換え・金利）か 'kuriage'（繰り上げ返済） */
  mode: string;
  /** 残高（円） */
  balance: number;
  /** 残りの返済年数 */
  years: number;
  /** 現在の金利（%） */
  rate: number;
  /** 金利タイプの画面ラベル（'変動' | '固定'）。計算には使わず、記録として残す */
  rateType: string;
  /** 繰り上げ額（円）。繰り上げ返済モードのみ */
  prepay?: number;
  /** 出力日（JST の 'YYYY-MM-DD'）。呼び出し側で作って渡す（この関数は時計を持たない） */
  dateJst: string;
}

/**
 * 償還表の行数（50年 × 12か月）。
 *
 * 2026-07-31 に 420行（35年）から 600行（50年）へ拡張した。
 * 理由：フラット50や一部の40年ローンが実在し、35年では実在する商品を取りこぼす。
 * 40年を入れると表が420行で切れ、最終行に残高が残ったまま閉じない一方で、
 * 総返済額・総利息は入力どおりの回数で計算されるため、表と合計欄が食い違っていた。
 * 600行あれば実在する商品はすべてカバーできる。
 * それでも足りない場合（50年超）は、シート上部の警告セルが出るようにしてある。
 */
export const SCHEDULE_ROWS = 600;

const SITE_URL = 'https://www.tsuginotenavi.jp/loan';
const POLICY_URL = 'https://www.tsuginotenavi.jp/policy';

/** 入力シートの黄色（ユーザーが書き換えてよいセルの目印）。 */
const INPUT_BG = '#FFF6CC';

const S = (value: string, opts: Partial<XlsxCell> = {}): XlsxCell => ({ value, type: String, ...opts });
const N = (value: number, format?: string, opts: Partial<XlsxCell> = {}): XlsxCell => ({ value, type: Number, format, ...opts });
const F = (formula: string, format?: string, opts: Partial<XlsxCell> = {}): XlsxCell => ({
  value: formula, type: 'Formula', format, ...opts,
});
const HEAD = (value: string): XlsxCell => S(value, { fontWeight: 'bold' });

const YEN = '#,##0"円"';
const NUM = '#,##0';
const PCT2 = '0.00"%"';
const MON1 = '0.0"か月"';

/* ===== 入力シートのセル位置（ここを変えたら全数式を見直すこと） ===== */
const IN = {
  balance: '入力!$B$2',
  years: '入力!$B$3',
  rate: '入力!$B$4',
  prepay: '入力!$B$6',
} as const;

/** 月利（年利% ÷ 100 ÷ 12）。 */
const R = `${IN.rate}/100/12`;
/** 残りの回数（年数 × 12）。 */
const NN = `${IN.years}*12`;
/** 毎月の返済額。PMT は金利0%でも P÷n を返すため、0%の場合分けは不要（LibreOffice で確認済み）。 */
const M = `PMT(${R},${NN},-${IN.balance})`;

/** 1枚目：入力（ユーザーが書き換える唯一のシート）。 */
function buildInputSheet(input: LoanWorkbookInput): XlsxSheet {
  const isKuriage = input.mode === 'kuriage';
  const rows: XlsxCell[][] = [
    [HEAD('項目'), HEAD('値'), HEAD('説明')],
    [S('住宅ローンの残高'), N(input.balance, YEN, { backgroundColor: INPUT_BG }), S('いま残っている元金です。利息は含みません。')],
    [S('残りの返済年数'), N(input.years, '0"年"', { backgroundColor: INPUT_BG }), S('完済までの残りの年数です。')],
    [S('現在の金利（%）'), N(input.rate, '0.000"%"', { backgroundColor: INPUT_BG }), S('年あたりの利率です。1.5%なら「1.5」と入れます。')],
    [S('金利タイプ'), S(input.rateType, { backgroundColor: INPUT_BG }), S('変動か固定か。記録用で、計算には使いません。')],
  ];
  if (isKuriage) {
    rows.push([
      S('繰り上げ返済する金額'),
      N(input.prepay ?? 0, YEN, { backgroundColor: INPUT_BG }),
      S('まとめて返す金額です。全額が元金に充てられます。'),
    ]);
  } else {
    // 借り換えモードでも行位置を揃える（繰り上げシートを作らないので値は空のまま）。
    rows.push([S('繰り上げ返済する金額'), S('（このファイルでは使いません）'), S('繰り上げ返済モードで出力すると使われます。')]);
  }
  rows.push([]);
  rows.push([S('この黄色いセルを書き換えると、すべてのシートが再計算されます。', { span: 3, wrap: true })]);
  return { data: rows, sheet: '入力', columns: [{ width: 22 }, { width: 18 }, { width: 46 }] };
}

/** 2枚目：返済予定表（償還表）。すべて入力シート参照の数式。 */
function buildScheduleSheet(): XlsxSheet {
  const rows: XlsxCell[][] = [
    /* 1行目：行数を超えたときだけ出る警告（2026-07-31 追加）。
       表が途中で切れているのに合計欄は入力どおりの回数で計算されるため、
       気づかないまま食い違った数字を読むことになる。条件を満たすときだけ文言を出し、
       通常時は空欄にする（枠線・見出しを付けず、空のときは目立たせない）。 */
    [F(`IF(${NN}>${SCHEDULE_ROWS},"※返済期間が50年を超えています。この表は50年分までしか計算できません。","")`,
      undefined, { span: 6, wrap: true, fontWeight: 'bold', color: '#B91C1C' })],
    [],
    [S('毎月の返済額'), F(M, YEN, { fontWeight: 'bold' }), S('元金と利息を合わせて、毎月払う金額です。')],
    [S('総返済額'), F(`B3*${NN}`, YEN), S('毎月の返済額 × 回数です。')],
    [S('総利息'), F(`B4-${IN.balance}`, YEN), S('総返済額から元金を引いた、利息の合計です。')],
    [],
    [S('この表は元利均等返済（毎月の返済額が最後まで一定になる返し方）で計算しています。毎月の返済額は Excel の PMT 関数（ローンの毎月の返済額を求める関数）で求めています。', { span: 6, wrap: true })],
    [S('入力シートの年数を変えると、この表の対象範囲も自動で変わります（50年・600回まで対応）。', { span: 6, wrap: true })],
    [],
    [HEAD('回数'), HEAD('返済年月'), HEAD('毎月の返済額'), HEAD('うち利息'), HEAD('うち元金'), HEAD('返済後の残高')],
  ];
  const HEADER_ROWS = rows.length; // 10行目までがヘッダ。データは11行目から
  for (let i = 1; i <= SCHEDULE_ROWS; i++) {
    const r = HEADER_ROWS + i; // このデータ行の実際の行番号
    const guard = `A${r}>${NN}`; // 残り回数を超えた行は空欄にする
    const prevBalance = i === 1 ? IN.balance : `F${r - 1}`;
    rows.push([
      N(i, NUM),
      F(`IF(${guard},"",INT((A${r}-1)/12)+1&"年目")`),
      F(`IF(${guard},"",$B$3)`, YEN),
      F(`IF(${guard},"",${prevBalance}*${R})`, YEN),
      F(`IF(${guard},"",C${r}-D${r})`, YEN),
      F(`IF(${guard},"",${prevBalance}-E${r})`, YEN),
    ]);
  }
  return {
    data: rows,
    sheet: '返済予定表',
    columns: [{ width: 8 }, { width: 12 }, { width: 16 }, { width: 14 }, { width: 14 }, { width: 18 }],
  };
}

/** 3枚目：繰り上げ返済（繰り上げモードのときだけ作る）。すべて数式。 */
function buildPrepaySheet(): XlsxSheet {
  const P = IN.balance;
  const A = IN.prepay;
  /** 繰り上げ後の残高 */
  const PA = `(${P}-${A})`;
  /** 基準の総利息（繰り上げなし） */
  const I0 = `(${M}*${NN}-${P})`;
  /** 期間短縮型の残り回数 n'（対数で「返済額と利息が釣り合う回数」を逆算する） */
  const NAFTER = `(-LN(1-${PA}*${R}/${M})/LN(1+${R}))`;
  /** 返済額軽減型の毎月返済額 */
  const MAFTER = `PMT(${R},${NN},-${PA})`;
  /** 金利0%のときは対数が使えないので分岐する（利息は元々発生しないので軽減は0円） */
  const zero = `${IN.rate}=0`;

  const rows: XlsxCell[][] = [
    [HEAD('A. 期間短縮型（毎月の返済額はそのまま、返済期間を短くする）')],
    [S('減る利息'), F(`IF(${zero},0,${I0}-(${M}*${NAFTER}-${PA}))`, YEN, { fontWeight: 'bold' })],
    [S('短縮される期間'), F(`IF(${zero},${A}/${M},${NN}-${NAFTER})`, MON1, { fontWeight: 'bold' })],
    [S('残高だけが減って毎月の返済額は変わらないため、返済の回数が減ります。回数は「返済額と利息が釣り合うところまで何回で返し終わるか」を逆算して求めています。', { span: 3, wrap: true })],
    [],
    [HEAD('B. 返済額軽減型（返済期間はそのまま、毎月の返済額を下げる）')],
    [S('減る利息'), F(`IF(${zero},0,${I0}-(${MAFTER}*${NN}-${PA}))`, YEN, { fontWeight: 'bold' })],
    [S('毎月の返済額の軽減'), F(`${M}-${MAFTER}`, YEN, { fontWeight: 'bold' })],
    [S('回数は変えずに、減った残高で毎月の返済額を計算し直します。', { span: 3, wrap: true })],
    [],
    [S('利息の軽減は期間短縮型が大きく、返済額軽減型は毎月の余力が増えます。目的で選んでください。', { span: 3, wrap: true })],
    [],
    [HEAD('C. 未払利息が発生する金利のライン')],
    [S('繰り上げ前'), F(`${M}*12/${P}*100`, PCT2)],
    [S('期間短縮型で繰り上げた後'), F(`${M}*12/${PA}*100`, PCT2)],
    [S('未払利息とは、毎月の返済額で利息をまかないきれなくなったときに、不足分が残高に上乗せされることです。「毎月の返済額×12÷残高」で、その発生し始める金利の目安が出ます。', { span: 3, wrap: true })],
    [S('返済額軽減型では、毎月の返済額と残高が同じ割合で減るため、このラインは変わりません。', { span: 3, wrap: true })],
  ];
  return { data: rows, sheet: '繰り上げ返済', columns: [{ width: 26 }, { width: 18 }, { width: 40 }] };
}

/** 4枚目：この計算について（テキストのみ）。 */
function buildAboutSheet(input: LoanWorkbookInput): XlsxSheet {
  const rows: XlsxCell[][] = [
    [HEAD('この計算について')],
    [],
    [HEAD('計算の前提')],
    [S('・元利均等返済（毎月の返済額が最後まで一定になる返し方）で計算しています。', { span: 3, wrap: true })],
    [S('・ボーナス払いは含みません。', { span: 3, wrap: true })],
    [S('・繰り上げ返済の手数料は含みません。金融機関によって有無と金額が異なります。', { span: 3, wrap: true })],
    [S('・金利は完済まで変わらないものと仮定しています。変動金利の場合、実際には見直しがあります。', { span: 3, wrap: true })],
    [S('・借り換えの試算は含みません。借り換え先の金利や費用は時期によって変わるため、このファイルには入れていません。', { span: 3, wrap: true })],
    [],
    [HEAD('免責')],
    [S('・このファイルは、入力された数字にもとづく試算を提供するものです。投資助言や金融商品の販売勧誘ではありません。', { span: 3, wrap: true })],
    [S('・特定の金融機関・金融商品を推奨するものではありません。', { span: 3, wrap: true })],
    [S('・実際の返済額・手数料・適用条件は、借入先の金融機関にご確認ください。', { span: 3, wrap: true })],
    [],
    [S('出力日'), S(input.dateJst)],
    [S('つぎの手ナビ（住宅ローン）'), S(SITE_URL)],
    [S('中立性ポリシー'), S(POLICY_URL)],
  ];
  return { data: rows, sheet: 'この計算について', columns: [{ width: 26 }, { width: 46 }, { width: 20 }] };
}

/**
 * ワークブックのシート配列を組み立てる（純関数）。
 * 返り値をそのまま write-excel-file に渡す。
 */
export function buildLoanWorkbook(input: LoanWorkbookInput): XlsxSheet[] {
  const sheets: XlsxSheet[] = [buildInputSheet(input), buildScheduleSheet()];
  // 繰り上げ返済シートは繰り上げモードのときだけ作る（指示書2-2）。
  if (input.mode === 'kuriage') sheets.push(buildPrepaySheet());
  sheets.push(buildAboutSheet(input));
  return sheets;
}

/**
 * 出力日を JST の 'YYYY-MM-DD' で返す。
 * ブラウザのローカル時刻ではなく JST に固定する（サイトの日付表記がすべてJSTのため。
 * 海外からのアクセスで1日ずれると、後から「いつの試算か」を照合するときに混乱する）。
 */
export function todayJst(now: Date): string {
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

/** ファイル名（tsuginotenavi_loan_YYYYMMDD.xlsx）。 */
export function workbookFileName(dateJst: string): string {
  return `tsuginotenavi_loan_${dateJst.replace(/-/g, '')}.xlsx`;
}
