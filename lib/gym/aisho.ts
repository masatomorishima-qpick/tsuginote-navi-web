/**
 * パーソナルジム「相性診断」（/gym/aisho）の判定ロジック・アンケート・紹介先の設定。
 *
 * 画面（AishoDiagnosis.tsx）はこのファイルを読むだけにして、改善で触る場所を1か所にまとめる。
 *
 * ★改善で触る場所（ほぼここだけ）
 *   1. PARTNERS …… 承認された案件のリンクを href に貼り、vetted を true にする。
 *      href が空、または vetted が false のあいだは送客ボタンを出さない（安全側）。
 *   2. typeOf / conditionsFor の文言 …… 結果画面のコピー。変えたら VERSION を上げる。
 *   3. SURVEY …… 結果のあとに出す任意アンケート。設問を変えたら VERSION を上げる。
 *
 * 送客先の選定基準（全部満たすジムだけ vetted: true にする）
 *   - 料金表（総額）を公式サイトで公開している
 *   - 解約・返金の条件を公式サイトで公開している
 *   - 体験・カウンセリング当日の契約を迫らない（口コミ・相談事例で確認）
 *   - 案件の掲載ルールで、ソーシャルメディア広告からの送客が許可されている
 *
 * 背景：国民生活センターに寄せられたパーソナルジムの相談は 2024年度 885件 → 2025年度 1,457件
 *   （2026-10-07 公表）。無料体験からの長時間勧誘、高額な解約料、予約が取れない、が中心。
 *
 * 2026-10-28 作成。
 */

export const LP_ID = 'gym-aisho';
/** 診断の文言・分岐・アンケートを変えたら上げる。GA4 と lp_event_logs に毎回送る。 */
export const VERSION = 'v1-2026-10-28';

export type Goal = 'lose' | 'tone' | 'fitness' | 'care';
export type Exp = 'none' | 'past' | 'now';
export type Style = 'praise' | 'strict' | 'logic' | 'leave';
export type Food = 'strict' | 'loose' | 'none';
export type Gender = 'female' | 'male' | 'any';
export type Freq = 'w1' | 'w2' | 'w3';
export type Budget = 'lt2' | '2to4' | 'gt4';
export type Area = 'tokyo' | 'kanagawa' | 'saitama_chiba' | 'kansai' | 'aichi' | 'fukuoka' | 'other';

export type Answers = {
  goal?: Goal;
  exp?: Exp;
  style?: Style;
  food?: Food;
  gender?: Gender;
  freq?: Freq;
  budget?: Budget;
  area?: Area;
};

export type StepId = 'goal' | 'exp' | 'style' | 'food' | 'gender' | 'plan' | 'area';
export type Option = { v: string; t: string; s?: string };
export type Step = {
  id: StepId;
  q: string;
  hint?: string;
  /** plan だけは「頻度」と「予算」の2つを1画面で選ぶ */
  opts?: Option[];
  pairs?: { key: 'freq' | 'budget'; label: string; opts: Option[] }[];
  grid?: boolean;
};

export const STEPS: Step[] = [
  {
    id: 'goal', q: 'いちばんの目的は？',
    opts: [
      { v: 'lose', t: '体重を落とす' },
      { v: 'tone', t: '引き締める' },
      { v: 'fitness', t: '体力・健康' },
      { v: 'care', t: '姿勢・不調ケア' },
    ],
  },
  {
    id: 'exp', q: '運動の経験は？',
    opts: [
      { v: 'none', t: 'ほぼない' },
      { v: 'past', t: '昔やっていた' },
      { v: 'now', t: '今もしている' },
    ],
  },
  {
    id: 'style', q: 'どんな教わり方が合う？',
    opts: [
      { v: 'praise', t: 'ほめて伸ばす' },
      { v: 'strict', t: 'しっかり厳しく' },
      { v: 'logic', t: '理屈で納得したい' },
      { v: 'leave', t: 'おまかせ' },
    ],
  },
  {
    id: 'food', q: '食事の指導は？',
    opts: [
      { v: 'strict', t: 'しっかり管理' },
      { v: 'loose', t: 'ゆるく' },
      { v: 'none', t: 'いらない' },
    ],
  },
  {
    id: 'gender', q: 'トレーナーの性別は？',
    opts: [
      { v: 'female', t: '女性がいい' },
      { v: 'male', t: '男性がいい' },
      { v: 'any', t: 'どちらでも' },
    ],
  },
  {
    id: 'plan', q: '通い方と予算は？',
    pairs: [
      { key: 'freq', label: '頻度', opts: [{ v: 'w1', t: '週1' }, { v: 'w2', t: '週2' }, { v: 'w3', t: '週3〜' }] },
      { key: 'budget', label: '月の予算', opts: [{ v: 'lt2', t: '〜2万' }, { v: '2to4', t: '2〜4万' }, { v: 'gt4', t: '4万〜' }] },
    ],
  },
  {
    id: 'area', q: '通う地域は？', grid: true,
    opts: [
      { v: 'tokyo', t: '東京' }, { v: 'kanagawa', t: '神奈川' },
      { v: 'saitama_chiba', t: '埼玉・千葉' }, { v: 'kansai', t: '大阪・京都・兵庫' },
      { v: 'aichi', t: '愛知' }, { v: 'fukuoka', t: '福岡' },
      { v: 'other', t: 'その他' },
    ],
  },
];

/** その設問に答え終わったか（plan は頻度と予算の両方がそろったら完了） */
export function answered(step: Step, a: Answers): boolean {
  if (step.id === 'plan') return !!a.freq && !!a.budget;
  return !!a[step.id as keyof Answers];
}

/* ===== 判定：合うトレーナーのタイプ ===== */
export type TypeKey = 'bansou' | 'kanri' | 'riron' | 'hippari';
export type TrainerType = { key: TypeKey; name: string; h: string; why: string; traits: string[] };

export const TYPES: Record<TypeKey, TrainerType> = {
  bansou: {
    key: 'bansou', name: '伴走型', h: '一緒に続けてくれる人',
    why: '小さな前進をほめて、続ける仕組みを作ってくれるタイプ。',
    traits: ['できた所をほめる', 'ペースを合わせる', '休んだ時に声をかける'],
  },
  kanri: {
    key: 'kanri', name: '管理型', h: '数字で引っぱる人',
    why: '体重・食事・回数を記録して、はっきり指示するタイプ。',
    traits: ['毎回の記録', '食事のチェック', '目標と期限が明確'],
  },
  riron: {
    key: 'riron', name: '理論型', h: '理由から教えてくれる人',
    why: 'なぜその動きか、なぜその食事かを説明してくれるタイプ。',
    traits: ['理由の説明', '体の仕組みの話', '質問しやすい'],
  },
  hippari: {
    key: 'hippari', name: 'おまかせ型', h: '全部組んでくれる人',
    why: 'メニューを全部決めて、迷わせずに進めるタイプ。',
    traits: ['毎回メニューを用意', '考えなくていい', '手早く進む'],
  },
};

export function typeOf(a: Answers): TrainerType {
  if (a.style === 'strict' || (a.style === 'leave' && a.food === 'strict')) return TYPES.kanri;
  if (a.style === 'logic') return TYPES.riron;
  if (a.style === 'leave') return a.exp === 'none' ? TYPES.bansou : TYPES.hippari;
  return TYPES.bansou;
}

/** 合うジムの条件（3つまで）。結果画面に出す。 */
export function conditionsFor(a: Answers): string[] {
  const c: string[] = [];
  if (a.gender === 'female') c.push('女性トレーナーを指名できる');
  if (a.gender === 'male') c.push('男性トレーナーを指名できる');
  if (a.goal === 'care') c.push('姿勢・体の不調の相談に強い');
  if (a.food === 'strict') c.push('食事指導がコースに入っている');
  if (a.food === 'none') c.push('食事指導なしのコースがある');
  if (a.budget === 'lt2') c.push('月2万円までの回数制がある');
  if (a.budget === 'gt4' && a.goal === 'lose') c.push('短期集中のコースがある');
  if (a.freq === 'w1') c.push('月4回のコースがある');
  if (a.exp === 'none') c.push('体験でトレーナーを確かめられる');
  c.push('担当トレーナーを変えられる');
  return Array.from(new Set(c)).slice(0, 3);
}

/** 契約前のチェック（国民生活センターに寄せられている相談の中身から） */
export const CONTRACT_CHECKS: { key: string; h: string; d: string }[] = [
  { key: 'total', h: '総額', d: '入会金・コース代・食事指導の合計が先に出るか' },
  { key: 'cancel', h: '解約・返金', d: '途中でやめた時の返金と解約料' },
  { key: 'sameday', h: '当日契約', d: '体験当日に迫られたら、持ち帰って比べる' },
  { key: 'booking', h: '予約', d: '希望の曜日・時間に取れるか' },
];

/* ===== 任意アンケート（結果のあとに表示） ===== */
export type SurveyQ = {
  id: 'quit' | 'reasons' | 'wish' | 'want';
  q: string;
  multi?: boolean;
  /** quit で yes と答えた人にだけ出す */
  onlyIfQuit?: boolean;
  opts: Option[];
};

export const SURVEY: SurveyQ[] = [
  {
    id: 'quit', q: 'ジムを辞めた・合わなかった経験は？',
    opts: [
      { v: 'yes', t: 'ある' },
      { v: 'no', t: 'ない' },
      { v: 'never', t: '通ったことがない' },
    ],
  },
  {
    id: 'reasons', q: '辞めた理由は？（いくつでも）', multi: true, onlyIfQuit: true,
    opts: [
      { v: 'price', t: '料金' },
      { v: 'pushy', t: '勧誘' },
      { v: 'booking', t: '予約が取れない' },
      { v: 'trainer', t: 'トレーナーと合わない' },
      { v: 'result', t: '効果が出ない' },
      { v: 'busy', t: '忙しくなった' },
    ],
  },
  {
    id: 'wish', q: '契約前に知りたかったことは？', onlyIfQuit: true,
    opts: [
      { v: 'total', t: '総額' },
      { v: 'cancel', t: '解約の条件' },
      { v: 'trainer', t: 'トレーナーの人柄' },
      { v: 'booking', t: '予約の取りやすさ' },
      { v: 'pushy', t: '勧誘の有無' },
    ],
  },
  {
    id: 'want', q: 'トレーナーに一番求めることは？',
    opts: [
      { v: 'knowledge', t: '知識' },
      { v: 'fit', t: '人柄・相性' },
      { v: 'cheer', t: '励まし' },
      { v: 'strict', t: '厳しさ' },
      { v: 'explain', t: '説明のわかりやすさ' },
    ],
  },
];

export type SurveyAnswers = Partial<Record<SurveyQ['id'], string | string[]>>;

export function activeSurvey(s: SurveyAnswers): SurveyQ[] {
  return SURVEY.filter((q) => !q.onlyIfQuit || s.quit === 'yes');
}

/* ===== 紹介先 =====
 * href が空、または vetted が false のあいだは表示しない（承認前・基準の確認前に送客しないため）。
 * points には、承認後に広告主の公式情報で確認できた事実だけを書く。 */
export type PartnerKey = 'bodyaxis' | 'gyms';
export type Partner = {
  key: PartnerKey;
  name: string;
  asp: 'a8' | 'rentracks';
  /** 報酬（円）と成果地点。粗利の試算に使う。承認後に管理画面の値で確かめる。 */
  reward: number;
  rewardPoint: string;
  href: string;
  /** 選定基準（ファイル冒頭）を全部確認したら true */
  vetted: boolean;
  /** 女性専用なら female */
  only?: Gender;
  /** 対応地域。'all' は全国 */
  areas: Area[] | 'all';
  goals: Goal[];
  points: string[];
};

/* 承認されたA8案件は、ここに同じ形で足す（報酬・成果地点は管理画面の値をそのまま書く）。 */
export const PARTNERS: Record<PartnerKey, Partner> = {
  bodyaxis: {
    key: 'bodyaxis', name: 'ボディアクシス', asp: 'rentracks',
    reward: 44000, rewardPoint: '入会（提携中）', href: '', vetted: false,
    areas: 'all', goals: ['fitness', 'care', 'tone'], points: [],
  },
  gyms: {
    key: 'gyms', name: 'GYMS', asp: 'a8',
    reward: 10600, rewardPoint: '無料体験か店舗カウンセリング', href: '', vetted: false,
    only: 'female', areas: 'all', goals: ['lose', 'tone'], points: [],
  },
};

function serves(p: Partner, a: Answers): boolean {
  if (!p.href || !p.vetted) return false;
  // 女性専用ジムは「女性トレーナーがいい」と答えた人にだけ出し、カードに「女性専用」と明記する
  if (p.only && a.gender !== p.only) return false;
  if (p.areas !== 'all' && (!a.area || !p.areas.includes(a.area))) return false;
  if (a.goal && !p.goals.includes(a.goal)) return false;
  return true;
}

/** 表示順。報酬ではなく「目的に合うか」で並べ、最大2件。 */
const ORDER: PartnerKey[] = ['bodyaxis', 'gyms'];

export function pickPartners(a: Answers): Partner[] {
  return ORDER.map((k) => PARTNERS[k]).filter((p) => serves(p, a)).slice(0, 2);
}
