/**
 * 相続のページの出口（1ページに1つ）。2026-11-05 新設。
 * href が空のあいだはボタンを出さない（提携前・リンク未発行のリンクを踏ませないため）。
 * 紹介先の一覧と判断：docs/haifu-plan.md（枝 docs/listing-rules）の「レントラックスの紹介先」。
 */
export type SouzokuPartnerKey = 'iisouzoku' | 'souzokuAssist' | 'akiyaHonpo' | 'rakuuru' | 'zeirishiDotcom';

export type SouzokuPartner = {
  key: SouzokuPartnerKey;
  name: string;
  /** ボタンの文言（成果地点に合わせる） */
  cta: string;
  /** 売り。紹介先の公式サイトの記載だけ。確かめた日を checkedAt に */
  points: string[];
  checkedAt: string;
  href: string;
  beacon?: string;
  asp: 'rentracks' | 'a8';
  programId: string;
  reward: number;
};

export const SOUZOKU_PARTNERS: Record<SouzokuPartnerKey, SouzokuPartner> = {
  // レントラックス 14647（クローズド、11/5 申請中）。成果＝新規申込後のアポイントの設定完了、22,000円。
  iisouzoku: {
    key: 'iisouzoku', name: 'いい相続', cta: '相続の専門家に無料で相談する',
    points: [], checkedAt: '', href: '', asp: 'rentracks', programId: '14647', reward: 22000,
  },
  // レントラックス 15468（提携中）。成果＝新規申込完了、13,200円。
  souzokuAssist: {
    key: 'souzokuAssist', name: '相続アシスト', cta: '相続税の申告をまとめて頼む',
    // 公式 swats.or.jp/service/sozoku の記載（2026-11-05 確認、11-10・11-12 再確認）。対応は東京・神奈川・大阪・京都・兵庫の案件。
    points: ['戸籍集めから申告まで代行。こちらはサインと面談だけ', '税理士・弁護士・司法書士が連携', '対象：東京・神奈川・大阪・京都・兵庫'],
    checkedAt: '2026年11月12日',
    href: 'https://www.rentracks.jp/adx/r.html?idx=0.75552.390675.10832.15468&dna=175712',
    beacon: 'https://www.rentracks.jp/adx/p.gifx?idx=0.75552.390675.10832.15468&dna=175712',
    asp: 'rentracks', programId: '15468', reward: 13200,
  },
  // レントラックス 15882（提携中）。成果＝新規申込完了、16,000円。ラクウル（13857）の承認までのつなぎ。
  akiyaHonpo: {
    key: 'akiyaHonpo', name: '空き家買取本舗', cta: '実家の買い取り額を無料で聞く',
    // 公式 lp.akiyakaitorihonpo.com/af の記載（2026-11-05 確認）。
    points: ['相続した家も、荷物ごとそのまま買い取る（解体も不要）', '仲介ではないので、仲介手数料がない', '全国対応。断ってもよく、営業電話もない'],
    checkedAt: '2026年11月5日',
    href: 'https://www.rentracks.jp/adx/r.html?idx=0.75552.390675.11107.15882&dna=185106',
    beacon: 'https://www.rentracks.jp/adx/p.gifx?idx=0.75552.390675.11107.15882&dna=185106',
    asp: 'rentracks', programId: '15882', reward: 16000,
  },
  // レントラックス 13857（クローズド、11/5 申請中）。成果＝問い合わせ後30日以内に相続人と確認できた時点、11,440円。
  // 却下条件：「複数社へ見積もりを出す相見積もりを推奨する文言」。このページでは相見積もりをすすめない。
  rakuuru: {
    key: 'rakuuru', name: 'ラクウル', cta: '相続した家の売り方を無料で相談する',
    points: [], checkedAt: '', href: '', asp: 'rentracks', programId: '13857', reward: 11440,
  },
  // A8 s00000014783001（未提携。11/15 オーナーに申込を提案）。成果＝新規お問合せ（相続）5,000円。全国。
  // 提携してリンクを発行したら href と、公式サイトで確かめた points・checkedAt を入れる。
  zeirishiDotcom: {
    key: 'zeirishiDotcom', name: '税理士ドットコム', cta: '相続に強い税理士を無料で探す',
    points: [], checkedAt: '', href: '', asp: 'a8', programId: 's00000014783001', reward: 5000,
  },
};

/**
 * 地域で出口を分ける（2026-11-15 オーナー了承「二択OK」）。
 * 相続アシストの対象は東京・神奈川・大阪・京都・兵庫だけなので、それ以外の地域の人には全国対応の紹介先を出す。
 * 全国対応の候補は上から順に、href があるものを使う。どれも href が空のあいだは分けず、今までどおり1つの出口のまま。
 */
export const REGION_SPLIT: Partial<Record<SouzokuPartnerKey, { areas: string; alt: SouzokuPartnerKey[] }>> = {
  souzokuAssist: { areas: '東京・神奈川・大阪・京都・兵庫', alt: ['iisouzoku', 'zeirishiDotcom'] },
};

export function regionAlt(key: SouzokuPartnerKey): { areas: string; alt: SouzokuPartner } | null {
  const r = REGION_SPLIT[key];
  if (!r) return null;
  const alt = r.alt.map((k) => SOUZOKU_PARTNERS[k]).find((p) => !!p.href);
  return alt ? { areas: r.areas, alt } : null;
}
