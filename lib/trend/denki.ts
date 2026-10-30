import type { TrendConfig, TrendResult } from './types';

/**
 * 波：電気代の冬の見通し（11月使用分が大手7社で過去最高 → 12月からの補助再開を首相が表明）。/check/denki
 *
 * 検知（2026-10-30）：トレンド速攻施策。キーワードプランナーにまだ出ない言葉
 *   「電気代 11月 過去最高」「電気 補助 12月 いつから」「電気代 値上がり なぜ」を押さえる。
 * 事実
 *   - 11月使用分の電気料金は、燃料費（LNG）の上昇で大手電力7社が値上がりし、2か月連続で過去最高（NHK 2026-10-29）。
 *     東京電力 9,738円（10月比 +177円）、中部電力 9,920円（+273円、上げ幅最大）。関西電力は横ばい、北海道・九州は小幅の値下がり
 *     （nippon.com 2026-10-29、セレクトラ 2026-10-24。標準家庭＝30A・260kWh）。
 *   - 10〜12月使用分は補助がない。首相が10/29に12月からの電気・ガス代支援の再開を表明（時事 2026-10-29）。金額は未定。
 *     前回の冬（2026年1〜2月使用分）は電気4.5円/kWh、3月は1.5円/kWh（セレクトラ 2026-10-21）。
 *
 * 計算は「目安」。各家庭の実額は検針票と各社の料金表で決まる。言い切りは書かない。
 *
 * 紹介先（A8、すべて検索広告は社名・サービス名・表記ゆれが不可）：
 *   オクトパスエナジー（6,349円、提携申請中）、東急でんき＆ガス（5,300円、1都6県）、東邦ガス（電気5,260円・ガス8,190円、中部）、
 *   アルカナエナジー（5,000円、即時提携）。承認と掲載条件の確認が済むまで href は空のまま（表示されない）。
 *   オクトパスエナジーはSNSでの掲載・投稿が禁止（検索広告のみで運用）。
 *   東急でんき＆ガスは 10/30 承認。バナーのみ使用可のため a8Banner で出す（関東を選んだ人だけ）。
 */

/** 先月の電気代の幅 → 計算に使う代表値（円） */
const BILL_MID: Record<string, number> = { b1: 4000, b2: 6500, b3: 10000, b4: 14000, b5: 19000 };

/** 11月使用分の大手の値上がり率（標準家庭、10月比）。関東＝東京電力 177/9,561、中部＝中部電力 273/9,647 */
const AREA: Record<string, { rate: number; note: string; partners: string[] }> = {
  kanto: { rate: 0.0185, note: '東京電力の標準家庭は+177円で9,738円', partners: ['octopus', 'tokyu'] },
  chubu: { rate: 0.0283, note: '中部電力の標準家庭は+273円で9,920円。上げ幅は大手で最大', partners: ['toho', 'octopus'] },
  kansai: { rate: 0, note: '関西電力の標準家庭は横ばい', partners: ['octopus', 'arcana'] },
  other: { rate: 0.01, note: '地域で差があります（北海道・九州は小幅の値下がり、ほかは値上がり）', partners: ['octopus', 'arcana'] },
};

/** 冬（12〜2月）の電気代が10月の何倍になるかの目安 */
const WINTER: Record<string, { x: number; note: string }> = {
  aircon: { x: 1.4, note: 'エアコン暖房の家庭は冬に約1.4倍が目安' },
  allelec: { x: 1.7, note: 'オール電化の家庭は冬に約1.7倍が目安' },
  nonelec: { x: 1.15, note: 'ガス・灯油の暖房なら冬の増え方は小さめ（約1.15倍が目安）' },
};

/** 電気代1円あたりの使用量（全国の標準家庭の平均的な単価 約37円/kWh の逆数） */
const KWH_PER_YEN = 1 / 37;
/** 前回の冬の補助（円/kWh）。今回の金額は未定なので「前回並みなら」と書く */
const SUBSIDY_LAST = 4.5;

const yen = (n: number) => `${(Math.round(n / 100) * 100).toLocaleString('ja-JP')}円`;

const judge = (a: Record<string, string>): TrendResult => {
  const bill = BILL_MID[a.bill] ?? 10000;
  const area = AREA[a.area] ?? AREA.other;
  const winter = WINTER[a.heat] ?? WINTER.aircon;

  const up = bill * area.rate;
  const winterBill = bill * winter.x;
  const subsidy = winterBill * KWH_PER_YEN * SUBSIDY_LAST;
  const big = a.contract === 'major';
  const saveLo = winterBill * (big ? 0.03 : 0.0);
  const saveHi = winterBill * (big ? 0.08 : 0.05);

  const gaps: TrendResult['gaps'] = [
    { icon: 'gauge', t: `11月の値上がり分：約${yen(up)}／月（${area.note}）` },
    { icon: 'house', t: `冬の電気代の目安：約${yen(winterBill)}／月（${winter.note}）` },
    { icon: 'calculator', t: `補助が前回並み（4.5円/kWh）なら：約${yen(subsidy)}／月 戻る見込み（12月からの再開を首相が表明。金額は未定）` },
    {
      icon: 'refresh',
      t: big
        ? `切り替えで縮められる差の目安：約${yen(saveLo)}〜${yen(saveHi)}／月（大手の標準プランから新電力へ、3〜8%）`
        : `すでに新電力なら、差は0〜5%（約${yen(saveHi)}／月まで）。今のプランの単価と比べて決めます`,
    },
  ];

  if (big && (a.area === 'kanto' || a.area === 'chubu') && bill >= 8000) {
    return {
      level: 'high', title: '切り替えで差が出やすい',
      lead: '値上がりした地域で、大手の標準プランのまま。補助は使用量で決まるので切り替えても減りません。差額は切り替えで縮められます。',
      gaps, partners: area.partners,
    };
  }
  if (big) {
    return {
      level: 'mid', title: '切り替えの差は中くらい',
      lead: '大手の標準プランのまま。電気代が大きい冬ほど差が出るので、12月の前に単価を比べておくと無駄がありません。',
      gaps, partners: area.partners,
    };
  }
  return {
    level: 'low', title: 'まず今のプランの単価を確認',
    lead: '新電力に切り替え済み（または不明）なら、差は小さいことが多いです。検針票の「電力量料金の単価」と比べてから判断してください。',
    gaps, partners: area.partners,
  };
};

export const DENKI: TrendConfig = {
  id: 'denki',
  lpId: 'trend-denki',
  version: 'v2-2026-10-30',
  intro: [
    { icon: 'list', t: '4つの質問' },
    { icon: 'calculator', t: '冬の電気代' },
    { icon: 'refresh', t: '戻る分と差' },
  ],
  startLabel: '計算を始める（30秒）',
  steps: [
    {
      id: 'area', q: 'お住まいの地域は？', hint: '11月の値上がり幅が地域で違います',
      opts: [
        { v: 'kanto', t: '関東（東京電力エリア）' }, { v: 'chubu', t: '中部（中部電力エリア）' },
        { v: 'kansai', t: '関西（関西電力エリア）' }, { v: 'other', t: 'それ以外の地域' },
      ],
    },
    {
      id: 'bill', q: '先月（10月分）の電気代は？', hint: '検針票や請求のメールのおおよその金額で',
      opts: [
        { v: 'b1', t: '5,000円未満' }, { v: 'b2', t: '5,000〜8,000円' },
        { v: 'b3', t: '8,000〜12,000円' }, { v: 'b4', t: '12,000〜16,000円' },
        { v: 'b5', t: '16,000円以上' },
      ],
    },
    {
      id: 'contract', q: '今の電気の契約は？', cols: 3,
      opts: [
        { v: 'major', t: '大手電力の標準プラン', icon: 'building' },
        { v: 'new', t: '新電力に切り替え済み', icon: 'refresh' },
        { v: 'unknown', t: 'わからない', icon: 'help' },
      ],
    },
    {
      id: 'heat', q: '冬の暖房は？', cols: 3,
      opts: [
        { v: 'aircon', t: 'エアコンが中心', icon: 'wifi' },
        { v: 'allelec', t: 'オール電化', icon: 'house' },
        { v: 'nonelec', t: 'ガス・灯油が中心', icon: 'fuel' },
      ],
    },
  ],
  judge,
  partners: {
    octopus: {
      key: 'octopus', name: 'オクトパスエナジー', asp: 'a8',
      reward: 6349, rewardPoint: '電気の新規申し込み（審査あり）',
      // 2026-10-30 提携申請中。承認後にリンクを入れる
      href: '',
      vetted: true,
      pitch: '全国規模の新電力。申し込みは公式サイトで5分ほど、工事や立ち会いはなく、切り替え日まで今の電気がそのまま使えます。供給エリアは公式サイトで確認できます。',
      cta: '料金プランを見る',
    },
    tokyu: {
      key: 'tokyu', name: '東急でんき＆ガス', asp: 'a8',
      reward: 5300, rewardPoint: '電気の新規申し込み',
      // 2026-10-30 14:25 提携承認（オーナー確認）。対象は東京・神奈川・千葉・埼玉・茨城・栃木・群馬（市区町村で一部対象外）
      // 掲載条件：バナータイプの広告リンクのみ使用可（文字リンクは A8 へ問い合わせが必要）。検索広告は会社名・商標名・キャラクター名・ブランド関連語が不可。
      // 成果条件：広告主新規、申込後90日以内の利用開始、「でんき」「でんき＆ガス」のコース、対象エリア内。ガス単体は否認。
      href: 'https://px.a8.net/svt/ejp?a8mat=4BES25+9N3R8A+4P4C+HVV0H',
      a8Banner: { site: '1734', article: '2311', link: '10776', image: '11483', mid: 's00000021918003', token: '261030029583', a8mat: '4BES25+9N3R8A+4P4C+HVV0H' },
      vetted: true,
      pitch: '東京・神奈川・千葉・埼玉・茨城・栃木・群馬が対象（市区町村で一部対象外あり）。電気だけでも、電気とガスをまとめても申し込めます。',
      cta: '料金プランを見る',
    },
    toho: {
      key: 'toho', name: '東邦ガスの電気', asp: 'a8',
      reward: 5260, rewardPoint: '電気の新規申し込み（ガスは8,190円）',
      // 2026-10-30 提携申請中
      href: '',
      vetted: false,
      pitch: '中部地方向け。ガスとまとめると割引があります。',
      cta: '料金プランを見る',
    },
    arcana: {
      key: 'arcana', name: 'アルカナエナジー', asp: 'a8',
      reward: 5000, rewardPoint: '電気の新規申し込み',
      // 2026-10-30 即時提携を申請。リンク発行後に入れる
      href: '',
      vetted: false,
      pitch: '基本料金0円のプラン。使った分だけの料金で、供給エリアは公式サイトで確認できます。',
      cta: '料金プランを見る',
    },
  },
  nextSteps: [
    { icon: 'clipboard', h: '検針票で単価を見る', d: '切り替えの差は「電力量料金」の単価の比較で決まります' },
    { icon: 'calendar', h: '補助の正式な発表を待つ', d: '12月からの再開を首相が表明。金額は今後の発表で', href: 'https://www.enecho.meti.go.jp/' },
    { icon: 'alert', h: '今の契約の解約金を確かめる', d: '大手の標準プランは原則なし。新電力は契約により異なります' },
    { icon: 'refresh', h: '切り替えは申し込みだけ', d: '工事・立ち会いは不要。今の会社への連絡も不要です' },
  ],
  fallback: {
    h: '電力会社の切り替えの基本（国の案内）',
    d: '資源エネルギー庁が、切り替えの手順と注意点をまとめています',
    href: 'https://www.enecho.meti.go.jp/category/electricity_and_gas/electric/electricity_liberalization/',
    label: '国の案内を見る',
  },
  disclaimer: 'この計算は、大手電力の標準家庭の公表値と一般的な冬の使用量の増え方をもとにした目安です。各家庭の実額は、検針票の使用量と各社の料金表で決まります。補助の金額と期間は政府の正式な発表で確定します。',
  labels: {
    score: '切り替えの効き目',
    gaps: '計算の内訳（目安）',
    partner: '切り替え先の候補',
    next: '次にやること',
    resume: '計算の続きへ',
  },
};
