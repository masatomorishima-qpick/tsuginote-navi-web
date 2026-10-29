/**
 * トレンド速攻ページ（/check/*）の共通の型。
 *
 * 1つの波 = 設定ファイル1つ（lib/trend/<id>.ts）＋ページ1枚（app/check/<id>/page.tsx）。
 * 画面と計測は components/trend/TrendCheck.tsx が共通で受け持つ。
 * 改善で触るのは設定ファイルだけにする（文言・設問・判定・紹介先）。変えたら version を上げる。
 */

/** 選択肢や見出しに使えるアイコンの名前（components/trend/TrendCheck.tsx の ICONS と対応） */
export type IconName =
  | 'building' | 'users' | 'userCog' | 'laptop' | 'globe' | 'refresh' | 'hardDrive' | 'star'
  | 'shieldCheck' | 'shieldAlert' | 'network' | 'help' | 'check' | 'alert' | 'clipboard'
  | 'signature' | 'badge' | 'handshake' | 'userX' | 'store' | 'server' | 'cloud' | 'mail'
  | 'key' | 'fuel' | 'car' | 'card' | 'calculator' | 'lock' | 'scan' | 'list' | 'hourglass'
  | 'calendar' | 'gauge' | 'briefcase' | 'house' | 'wifi' | 'device' | 'x';

export type TrendOption = { v: string; t: string; icon?: IconName };
export type TrendStep = { id: string; q: string; hint?: string; opts: TrendOption[]; cols?: 2 | 3 };

export type TrendPartner = {
  key: string;
  name: string;
  asp: 'a8' | 'rentracks' | 'direct';
  /** 報酬（円）と成果地点。試算と記録に使う。管理画面の値をそのまま書く。 */
  reward: number;
  rewardPoint: string;
  /** 空のあいだは表示しない */
  href: string;
  /** 案件の掲載条件（検索広告の可否・禁止語）を確かめたら true */
  vetted: boolean;
  /** 結果画面での一言（事実だけ。言い切りは書かない） */
  pitch: string;
  cta: string;
};

export type TrendLevel = 'high' | 'mid' | 'low';

export type TrendResult = {
  level: TrendLevel;
  /** 結果の見出し（短く） */
  title: string;
  /** 補足の1文 */
  lead: string;
  /** 足りない可能性がある点 */
  gaps: { icon: IconName; t: string }[];
  /** 表示する紹介先のキー（順番どおり、href と vetted がそろったものだけ出る） */
  partners: string[];
};

export type TrendConfig = {
  id: string;
  /** lp_event_logs と GA4 の lp_name に入る */
  lpId: string;
  version: string;
  /** 開始画面の3つの手順 */
  intro: { icon: IconName; t: string }[];
  startLabel: string;
  steps: TrendStep[];
  judge: (a: Record<string, string>) => TrendResult;
  partners: Record<string, TrendPartner>;
  /** 結果の下に出す「次にやること」 */
  nextSteps: { icon: IconName; h: string; d: string; href?: string }[];
  /** 紹介先が1つも出ないときに案内する、中立の窓口 */
  fallback: { h: string; d: string; href: string; label: string };
  /** 結果画面の注意書き */
  disclaimer: string;
};
