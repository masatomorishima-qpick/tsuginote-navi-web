/**
 * 給湯器のページの一覧（2026-11-13 作成）。入口のページ /kyutoki と、各ページの下の「給湯器のページ一覧」の元。
 * 11/13 の点検で、トップから辿れる給湯器のページが19のうち4つだけ（残り15は、どのページからも辿れない）と分かったため作った。
 * 新しい給湯器のページを足したら、ここにも1行足す。
 */
export type KyutokiPage = { href: string; t: string; s: string };
export type KyutokiGroup = { h: string; icon: 'trouble' | 'money' | 'choose' | 'home'; items: KyutokiPage[] };

export const KYUTOKI_GROUPS: KyutokiGroup[] = [
  {
    h: '故障・トラブル', icon: 'trouble',
    items: [
      { href: '/kyutoki/oyu-ga-denai', t: 'お湯が出ないとき', s: '30秒で修理か交換かの目安' },
      { href: '/kyutoki/error', t: 'エラー番号の早見', s: '自分で直せるか、修理か' },
      { href: '/kyutoki/nurui', t: 'お湯がぬるい', s: 'まず確かめる4つ' },
      { href: '/kyutoki/mizumore', t: '水漏れ', s: '止水栓・電源・ガス栓の順に' },
      { href: '/kyutoki/touketsu', t: '凍結したとき', s: 'とかし方と予防' },
      { href: '/kyutoki/sokujitsu', t: '壊れた日に', s: '即日の修理・交換' },
    ],
  },
  {
    h: '費用と見積もり', icon: 'money',
    items: [
      { href: '/kyutoki/kokan-hiyou', t: '交換費用の目安', s: '種類・号数別' },
      { href: '/kyutoki/mitsumori-mikata', t: '見積もりの見方', s: '内訳で確かめる10か所' },
      { href: '/kyutoki/mitsumori-takai', t: '見積もりが高いとき', s: '金額の目安と高くなる理由' },
      { href: '/kyutoki/shiharai', t: '交換の払い方', s: '分割・カード・後払い' },
      { href: '/kyutoki/tanomisaki', t: 'どこに頼むか', s: '急ぎのときと比べるとき' },
    ],
  },
  {
    h: '選び方', icon: 'choose',
    items: [
      { href: '/kyutoki/nensu', t: '寿命と交換の時期', s: '修理か交換かは年数で' },
      { href: '/kyutoki/gosu-erabikata', t: '号数の選び方', s: '16号・20号・24号' },
      { href: '/kyutoki/kataban', t: '型番の見方', s: '号数と後継機種が分かる' },
      { href: '/kyutoki/maker', t: 'メーカーと値段', s: 'リンナイとノーリツ' },
      { href: '/kyutoki/ecojozu', t: 'エコジョーズ', s: '従来型との差額' },
    ],
  },
  {
    h: '住まい別の費用', icon: 'home',
    items: [
      { href: '/kyutoki/mansion', t: 'マンション', s: '扉の中・壁掛け' },
      { href: '/kyutoki/kodate', t: '戸建て', s: '壁掛け・据え置き' },
      { href: '/kyutoki/furo', t: 'お風呂の給湯器', s: '給湯専用・オート・フルオート' },
      { href: '/kyutoki/danbo', t: '暖房付き', s: '床暖房・浴室暖房' },
    ],
  },
];

export const KYUTOKI_PAGES: KyutokiPage[] = KYUTOKI_GROUPS.flatMap((g) => g.items);
