import type { TrendConfig, TrendResult } from './types';

/**
 * 波：セキュリティ対策評価制度（SCS評価制度）の準備度チェック（企業向け）。/check/scs
 *
 * 検知（2026-10-29）：「scs評価制度」は月18,100回・前年にはなかった新しい語（入札の低額帯 97円）。
 *   「セキュリティ対策評価制度」は月8,100回・前年比+83%（85円）。キーワードプランナー 2025/10〜2026/9。
 * 制度の事実（情報処理推進機構、2026-10-28 更新）：★3は専門家確認付き自己評価で要求項目26件、
 *   ★4は評価機関による第三者評価で43件。2027年3月の受付開始に向けて準備中。
 *   https://www.ipa.go.jp/security/scs/details.html
 *
 * 注意：このチェックの設問は「準備のよくある観点」で、制度の要求事項そのものではない。
 *   ★の取得を約束する書き方はしない。
 *
 * 紹介先（A8）：SiteLock（ホームページの脆弱性・改ざん対策）、SUIKA VPN（社員の固定IP）。
 *   承認と掲載条件の確認が済むまで href は空のまま（表示されない）。
 */

const judge = (a: Record<string, string>): TrendResult => {
  const gaps: TrendResult['gaps'] = [];
  const partners: string[] = [];

  if (a.it === 'none') gaps.push({ icon: 'userCog', t: '情報システムの担当者を決める（兼任でも可）' });
  if (a.it === 'part') gaps.push({ icon: 'userCog', t: '担当者が対策に使える時間を確保する' });
  if (a.remote === 'often' || a.remote === 'sometimes') {
    gaps.push({ icon: 'network', t: '社外からの接続（リモートアクセス）を許可する人と経路を限定する' });
    partners.push('suika');
  }
  if (a.web === 'self') {
    gaps.push({ icon: 'globe', t: 'Webサイトの脆弱性対策と改ざん検知を行う' });
    partners.push('sitelock');
  }
  if (a.patch !== 'rule') gaps.push({ icon: 'refresh', t: 'パソコンやサーバーのアップデートの社内ルールを決める' });
  if (a.backup !== 'offsite') gaps.push({ icon: 'hardDrive', t: 'バックアップを社外（クラウドなど）にも保管する' });

  const n = gaps.length;
  const urgent = a.demand === 'asked';
  if (n <= 1) {
    return {
      level: 'high', title: '準備は進んでいます',
      lead: urgent ? '取引先の期限に合わせて、公式の要求事項に沿った自己評価を始めましょう。' : '公式の要求事項に沿って自己評価すると、残りの課題がわかります。',
      gaps, partners,
    };
  }
  if (n <= 3) {
    return {
      level: 'mid', title: '一部の対策が不足しています',
      lead: urgent ? '取引先から求められている場合は、下記の対策を優先して進めましょう。' : '受付開始（2027年3月予定）までに下記の対策を整えておくと、申請をスムーズに進められます。',
      gaps, partners,
    };
  }
  return {
    level: 'low', title: 'これから準備が必要です',
    lead: 'まずは担当者を決め、下記の対策に一つずつ取り組みましょう。中小企業向けの支援サービスも活用できます。',
    gaps, partners,
  };
};

export const SCS: TrendConfig = {
  id: 'scs',
  lpId: 'trend-scs',
  version: 'v4-2026-10-30',
  intro: [
    { icon: 'list', t: '8つの質問' },
    { icon: 'gauge', t: '準備状況' },
    { icon: 'clipboard', t: 'やるべきこと' },
  ],
  startLabel: '診断を始める（約1分）',
  steps: [
    {
      id: 'demand', q: '取引先から、この制度への対応を求められていますか？', cols: 3,
      opts: [
        { v: 'asked', t: '求められている', icon: 'alert' },
        { v: 'talk', t: '話が出ている', icon: 'mail' },
        { v: 'none', t: 'まだない', icon: 'help' },
      ],
    },
    {
      id: 'size', q: '従業員数は？',
      opts: [
        { v: 's', t: '〜20人' }, { v: 'm', t: '21〜100人' },
        { v: 'l', t: '101〜300人' }, { v: 'xl', t: '301人〜' },
      ],
    },
    {
      id: 'it', q: '情報システムの担当者はいますか？', cols: 3,
      opts: [
        { v: 'dedicated', t: '専任がいる', icon: 'userCog' },
        { v: 'part', t: '兼任がいる', icon: 'users' },
        { v: 'none', t: 'いない', icon: 'userX' },
      ],
    },
    {
      id: 'remote', q: '社外から社内のシステムに接続することはありますか？', hint: 'テレワーク、出張先、外部業者からの接続など', cols: 3,
      opts: [
        { v: 'often', t: 'よくある', icon: 'wifi' },
        { v: 'sometimes', t: 'たまにある', icon: 'laptop' },
        { v: 'no', t: 'ない', icon: 'building' },
      ],
    },
    {
      id: 'web', q: '自社のWebサイトの管理は？', cols: 3,
      opts: [
        { v: 'self', t: '自社で管理', icon: 'globe' },
        { v: 'vendor', t: '制作会社に委託', icon: 'briefcase' },
        { v: 'none', t: 'サイトはない', icon: 'x' },
      ],
    },
    {
      id: 'patch', q: 'パソコンやサーバーのアップデートは？', cols: 3,
      opts: [
        { v: 'rule', t: '社内ルールがある', icon: 'check' },
        { v: 'person', t: '各自にまかせている', icon: 'users' },
        { v: 'unknown', t: 'わからない', icon: 'help' },
      ],
    },
    {
      id: 'backup', q: 'データのバックアップは？', cols: 3,
      opts: [
        { v: 'offsite', t: '社外にも保管', icon: 'cloud' },
        { v: 'onsite', t: '社内のみ', icon: 'server' },
        { v: 'none', t: '取っていない', icon: 'x' },
      ],
    },
    {
      id: 'star', q: '目指すのは★3と★4のどちらですか？', cols: 3,
      opts: [
        { v: 's3', t: '★3', icon: 'star' },
        { v: 's4', t: '★4', icon: 'badge' },
        { v: 'unknown', t: 'まだ決めていない', icon: 'help' },
      ],
    },
  ],
  judge,
  partners: {
    suika: {
      key: 'suika', name: 'SUIKA VPN Team IP Service', asp: 'a8',
      reward: 39200, rewardPoint: '専属固定IPの初回利用（共用は契約800〜8,000円）',
      // 2026-10-29 提携。つぎの手ナビで提携していることをオーナーが確認済み
      href: 'https://px.a8.net/svt/ejp?a8mat=4BERA4+B3HWGQ+4R3G+BWVTE',
      beacon: 'https://www11.a8.net/0.gif?a8mat=4BERA4+B3HWGQ+4R3G+BWVTE',
      vetted: true,
      pitch: 'テレワークなど社外からの通信を専用のVPNでまとめ、接続元を1つの固定IPアドレスにするサービス。社内システムやクラウドへのアクセスを固定IPで制限できます。', cta: 'サービス内容を見る',
    },
    sitelock: {
      key: 'sitelock', name: 'SiteLock', asp: 'a8',
      reward: 3500, rewardPoint: '新規成約（プランにより500〜10,000円）',
      // 2026-10-29 即時提携。つぎの手ナビで提携していることをオーナーが確認済み
      href: 'https://px.a8.net/svt/ejp?a8mat=4BERA4+BD0U56+2KX0+1ZJG1U',
      beacon: 'https://www18.a8.net/0.gif?a8mat=4BERA4+BD0U56+2KX0+1ZJG1U',
      vetted: true,
      pitch: 'Webサイトの脆弱性診断、改ざん検知、マルウェアの検知・駆除を行うサービス。', cta: 'サービス内容を見る',
    },
  },
  nextSteps: [
    { icon: 'clipboard', h: '要求事項に沿って自己評価する', d: '要求項目は★3が26件、★4が43件', href: 'https://www.ipa.go.jp/security/scs/details.html' },
    { icon: 'signature', h: '確認を依頼する専門家を探す', d: '★3は専門家による確認付きの自己評価' },
    { icon: 'shieldCheck', h: '不足している対策を進める', d: '上記の診断結果をもとに' },
    { icon: 'calendar', h: '受付開始に向けて計画を立てる', d: '受付開始は2027年3月の予定' },
  ],
  fallback: {
    h: '中小企業向けの「サイバーセキュリティお助け隊サービス」',
    d: '情報処理推進機構（IPA）が、基準を満たすサービスを認定・公開しています',
    href: 'https://www.ipa.go.jp/security/sme/otasuketai/index.html',
    label: '認定サービスの一覧を見る',
  },
  disclaimer: 'この診断は一般的なセキュリティ対策の観点をもとにした目安で、制度の要求事項そのものではありません。評価・登録は制度の手続きに従って行われます。',
};
