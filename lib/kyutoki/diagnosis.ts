/**
 * 給湯器「お湯が出ない」診断（/kyutoki/oyu-ga-denai）の判定ロジックと紹介先の設定。
 *
 * ここは「画面に依存しない純粋な関数とデータ」だけを置く。
 * 画面（OyuDiagnosis.tsx）はこのファイルを読むだけにして、PDCAで変える場所を1か所にまとめる。
 *
 * ★PDCAで触る場所（ほぼここだけ）
 *   1. PARTNERS の href …… A8 で発行された広告リンクを貼る。空文字のあいだは送客ボタンを出さない（安全側）。
 *   2. PARTNERS の areas …… 案件の成果対象地域。A8 のプログラム詳細の「成果条件」と一致させる。
 *   3. verdictOf の文言 …… 結果画面のコピー。変えたら VERDICT_VERSION を上げる（計測で版を見分けるため）。
 *
 * 2026-10-28 作成。案件の条件は A8 のプログラム詳細（同日閲覧）による。
 */

export const LP_ID = 'kyutoki-oyu-ga-denai';
/** 診断の文言・分岐を変えたら上げる。GA4 と lp_event_logs に毎回送るので、版ごとの成績を比べられる。 */
export const VERDICT_VERSION = 'v1-2026-10-28';

export type Area =
  | 'tokyo' | 'kanagawa' | 'chiba' | 'saitama' | 'aichi' | 'shizuoka'
  | 'ng' | 'other';
export type HeaterType = 'gas' | 'eco' | 'elec';
export type Symptom = 'none' | 'lukewarm' | 'error' | 'leak' | 'gas';
export type Cold = 'freeze' | 'nowater' | 'no';
export type Home = 'own' | 'rent';
export type Age = 'lt7' | '7to10' | 'gt10' | 'unknown';

export type Answers = {
  symptom?: Symptom;
  type?: HeaterType;
  cold?: Cold;
  home?: Home;
  age?: Age;
  area?: Area;
};

export type StepId = keyof Answers;

export type Option = { v: string; t: string; s?: string; danger?: boolean };
export type Step = {
  id: StepId;
  lcd: string;
  q: string;
  hint?: string;
  grid?: boolean;
  howto?: boolean;
  when?: (a: Answers) => boolean;
  opts: Option[];
};

export const STEPS: Step[] = [
  {
    id: 'symptom', lcd: 'どうしましたか', q: 'いま、どんな症状ですか？',
    opts: [
      { v: 'none', t: 'お湯がまったく出ない' },
      { v: 'lukewarm', t: 'ぬるい・途中で水になる' },
      { v: 'error', t: 'リモコンにエラー番号が出ている' },
      { v: 'leak', t: '水漏れ・異音・煙がある' },
      { v: 'gas', t: 'ガスのにおいがする', danger: true },
    ],
  },
  {
    id: 'type', lcd: '機種', q: '給湯器の種類は？', howto: true,
    opts: [
      { v: 'gas', t: 'ガス給湯器', s: '屋外の壁などに付いた箱形。ガスでお湯を沸かす' },
      { v: 'eco', t: 'エコキュート', s: '屋外に大きなタンクと、エアコンの室外機のような機械がある' },
      { v: 'elec', t: '電気温水器', s: '大きなタンクだけで、室外機のような機械はない' },
    ],
  },
  {
    id: 'cold', lcd: '凍結チェック', q: '当てはまるものは？',
    when: (a) => a.symptom === 'none',
    opts: [
      { v: 'freeze', t: '冷え込んだ朝で、水は出るのにお湯だけ出ない' },
      { v: 'nowater', t: '水も出ない' },
      { v: 'no', t: 'どちらでもない' },
    ],
  },
  {
    id: 'home', lcd: '住まい', q: 'お住まいは？',
    opts: [
      { v: 'own', t: '持ち家（戸建て・分譲マンション）' },
      { v: 'rent', t: '賃貸' },
    ],
  },
  {
    id: 'age', lcd: '使用年数', q: '使い始めて何年ですか？',
    hint: '本体のラベルに製造年が書いてあります。だいたいで大丈夫です。',
    opts: [
      { v: 'lt7', t: '7年未満' },
      { v: '7to10', t: '7〜10年' },
      { v: 'gt10', t: '10年以上' },
      { v: 'unknown', t: 'わからない' },
    ],
  },
  {
    id: 'area', lcd: '地域', q: 'お住まいの地域は？', grid: true,
    opts: [
      { v: 'tokyo', t: '東京都' }, { v: 'kanagawa', t: '神奈川県' },
      { v: 'chiba', t: '千葉県' }, { v: 'saitama', t: '埼玉県' },
      { v: 'aichi', t: '愛知県' }, { v: 'shizuoka', t: '静岡県' },
      { v: 'ng', t: '北海道・青森・秋田・新潟・沖縄' }, { v: 'other', t: 'それ以外の府県' },
    ],
  },
];

export function activeSteps(a: Answers): Step[] {
  return STEPS.filter((s) => !s.when || s.when(a));
}

/* ===== 途中で止める案内（送客しない） ===== */
export type StopKey = 'gas' | 'freeze' | 'nowater' | 'rent';

export function stopFor(stepId: StepId, value: string): StopKey | null {
  if (stepId === 'symptom' && value === 'gas') return 'gas';
  if (stepId === 'cold' && value === 'freeze') return 'freeze';
  if (stepId === 'cold' && value === 'nowater') return 'nowater';
  if (stepId === 'home' && value === 'rent') return 'rent';
  return null;
}

/* ===== 判定 ===== */
export type Mode = 'replace' | 'both' | 'repair';
export type Verdict = { mode: Mode; label: string; h: string; why: string };

export function verdictOf(a: Answers): Verdict {
  switch (a.age) {
    case 'gt10':
      return {
        mode: 'replace', label: '交換を考える時期', h: '交換の見積もりを取りましょう',
        why: '10年以上使った給湯器は、修理部品が手に入らないことがあります。直しても別の部品が続けて傷みやすい時期です。',
      };
    case '7to10':
      return {
        mode: 'both', label: '修理と交換の分かれ目', h: '修理と交換、両方の見積もりを取りましょう',
        why: '修理で直ることもありますが、数年以内に別の故障が出やすい時期です。修理代が高くつくなら、交換の見積もりと並べて決めましょう。',
      };
    case 'lt7':
      return {
        mode: 'repair', label: '修理で直る可能性が高い', h: 'まず修理の見積もりを取りましょう',
        why: '7年未満なら部品があり、修理で直ることが多いです。メーカー保証の期間内かもしれないので、先に保証書を確かめてください。',
      };
    default:
      return {
        mode: 'both', label: '年数が分かると判断しやすい', h: '見積もりのときに製造年を見てもらいましょう',
        why: '本体ラベルの製造年で、修理か交換かの目安が変わります。業者に見てもらうときに一緒に確かめるのが確実です。',
      };
  }
}

export function selfCheck(a: Answers): string[] {
  if (a.type === 'eco') {
    return [
      'リモコンの残湯量がゼロになっていないか（お湯の使い切り）',
      'エコキュート専用のブレーカーが落ちていないか',
      'リモコンにエラー番号が出ていれば、番号を控えておく',
    ];
  }
  if (a.type === 'elec') {
    return [
      'お湯を使い切っていないか（タンクの湯切れ）',
      '専用のブレーカーが落ちていないか',
      'リモコンにエラー番号が出ていれば、番号を控えておく',
    ];
  }
  return [
    'リモコンの運転スイッチが入っているか',
    'ガスメーターの赤いランプが点滅していたら、復帰ボタンを押して3分待つ',
    'ガスコンロなど、ほかのガス機器が使えるか（使えなければガスの供給側の問題）',
  ];
}

/* ===== 紹介先 =====
 * href が空文字のあいだは「紹介先なし」として扱う（A8 の提携承認前に本番に出しても、
 * 壊れたリンクや提携前のリンクを踏ませないため）。
 * areas は A8 プログラム詳細の「成果条件」の対象地域。 */
export type PartnerKey = 'oyu' | 'kyutto' | 'cools';
export type Partner = {
  key: PartnerKey;
  name: string;
  who: string;
  points: string[];
  href: string;
  a8ProgramId: string;
  /** 報酬（税抜・円）。粗利の試算に使う。 */
  reward: number;
  heater: HeaterType;
  /** 修理だけの問い合わせも成果になるか（Cools は交換のみ）。 */
  acceptsRepair: boolean;
  areas: Area[];
};

const SIX: Area[] = ['tokyo', 'kanagawa', 'chiba', 'saitama', 'aichi', 'shizuoka'];

export const PARTNERS: Record<PartnerKey, Partner> = {
  oyu: {
    key: 'oyu', name: 'お湯が出ない.com', who: 'ガス給湯器の修理・交換',
    points: ['東京都・神奈川県に対応', '最短即日（各社公表）', '見積もり無料'],
    href: '', // ★A8 承認後に広告リンクを貼る（s00000015892034）
    a8ProgramId: 's00000015892034', reward: 2500, heater: 'gas', acceptsRepair: true,
    areas: ['tokyo', 'kanagawa'],
  },
  kyutto: {
    key: 'kyutto', name: 'きゅっと', who: 'エコキュートの修理・交換',
    points: ['東京・神奈川・千葉・埼玉・愛知・静岡に対応', '最短即日（各社公表）', '見積もり無料'],
    href: '', // ★A8 承認後に広告リンクを貼る（s00000015892033）
    a8ProgramId: 's00000015892033', reward: 5500, heater: 'eco', acceptsRepair: true,
    areas: SIX,
  },
  cools: {
    key: 'cools', name: 'Cools', who: 'エコキュートの交換',
    points: ['全国45都府県に対応（各社公表）', '商品・工事とも10年保証（各社公表）', '交換の現地見積もり'],
    href: '', // ★A8 承認後に広告リンクを貼る（s00000027639001）
    a8ProgramId: 's00000027639001', reward: 6000, heater: 'eco', acceptsRepair: false,
    areas: [...SIX, 'other'],
  },
};

function serves(p: Partner, a: Answers, mode: Mode): boolean {
  if (!p.href) return false;
  if (p.heater !== a.type) return false;
  if (!a.area || !p.areas.includes(a.area)) return false;
  if (mode === 'repair' && !p.acceptsRepair) return false;
  return true;
}

/** 送客先は1つに絞る（main）。交換寄りで、別の交換先もあれば控えめに sub を出す。 */
export function pickPartners(a: Answers, v: Verdict): { main: Partner; sub: Partner | null } | null {
  const order: PartnerKey[] = a.type === 'gas' ? ['oyu'] : ['kyutto', 'cools'];
  const candidates = order.map((k) => PARTNERS[k]).filter((p) => serves(p, a, v.mode));
  if (candidates.length === 0) return null;
  const [main, ...rest] = candidates;
  const sub = v.mode !== 'repair' ? rest[0] ?? null : null;
  return { main, sub };
}

export function noPartnerReason(a: Answers, v: Verdict): string {
  if (a.type === 'elec') return '電気温水器に対応する紹介先は、いまはありません。';
  if (a.type === 'eco' && v.mode === 'repair') return 'お住まいの地域でエコキュートの修理に対応する紹介先は、いまはありません。';
  return 'お住まいの地域に対応する紹介先は、いまはありません。';
}
