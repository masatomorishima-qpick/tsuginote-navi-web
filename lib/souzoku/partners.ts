/**
 * 相続のページの出口（1ページに1つ）。2026-11-05 新設。
 * href が空のあいだはボタンを出さない（提携前・リンク未発行のリンクを踏ませないため）。
 * 紹介先の一覧と判断：docs/haifu-plan.md（枝 docs/listing-rules）の「レントラックスの紹介先」。
 */
export type SouzokuPartnerKey = 'iisouzoku' | 'souzokuAssist' | 'akiyaHonpo' | 'rakuuru';

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
    points: [], checkedAt: '', href: '', asp: 'rentracks', programId: '15468', reward: 13200,
  },
  // レントラックス 15882（提携中）。成果＝新規申込完了、16,000円。ラクウル（13857）の承認までのつなぎ。
  akiyaHonpo: {
    key: 'akiyaHonpo', name: '空き家買取本舗', cta: '実家の買い取り額を無料で聞く',
    points: [], checkedAt: '', href: '', asp: 'rentracks', programId: '15882', reward: 16000,
  },
  // レントラックス 13857（クローズド、11/5 申請中）。成果＝問い合わせ後30日以内に相続人と確認できた時点、11,440円。
  // 却下条件：「複数社へ見積もりを出す相見積もりを推奨する文言」。このページでは相見積もりをすすめない。
  rakuuru: {
    key: 'rakuuru', name: 'ラクウル', cta: '相続した家の売り方を無料で相談する',
    points: [], checkedAt: '', href: '', asp: 'rentracks', programId: '13857', reward: 11440,
  },
};
