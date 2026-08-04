/**
 * lib/retirement/articles.ts — 退職金・年金セクション（/retirement/*）の記事レジストリ
 *
 * 2026-08-03 新設（駅1指示書2-1）。lib/loan/articles.ts と同じ「レジストリ駆動」を再現する。
 * このセクションには今後、年金の受給開始時期・取り崩しの順番など複数の記事が入る想定
 * （事業戦略まとめ 2026-08-03 §3「使う市場」）。
 *
 * 構造は /loan と意図的に同一（フィールドの意味・注意点は lib/loan/articles.ts を参照）。
 * 共通化は3セクション目ができるまで行わない（2026-08-03 masato確定：2つ目で抽象化すると
 * 3つ目の要件に合わない形に固まるため）。ここから自動で反映される場所：
 *   / トップの記事一覧・/retirement ハブ・sitemap.xml・llms.txt・パンくず・
 *   Article JSON-LD・title/description/canonical/OGP・メインビジュアル
 *
 * 注意（/loan と同じルール）：
 * - title に「｜つぎの手ナビ」を含めない（buildArticleMetadata が自動で付ける）
 * - topic に具体的な金額・税率を書かない（llms.txt が陳腐化するため）
 * - path は一度公開したら変えない
 */

export interface MainVisual {
  src: string;
  alt: string;
}

export interface RetirementArticle {
  path: string;
  title: string;
  heading: string;
  breadcrumb: string;
  description: string;
  summary: string;
  topic: string;
  datePublished: string; // 'YYYY-MM-DD'
  dateModified: string;  // 'YYYY-MM-DD'
  visual: MainVisual;
  order: number;
}

const ARTICLES: RetirementArticle[] = [
  {
    /* 2026-08-03 追加：駅1（記事9）。
     * 「その判断の瞬間の検索」で来る一回性の問い（退職金の受け取り方）に、
     * 記事＋手取り比較ツールで答える。記事とツールは同時公開（指示書0章）。 */
    path: '/retirement/taishokukin-uketorikata',
    title: '退職金は一時金と年金どっちで受け取るか｜手取りで比べると答えが変わる',
    heading: '退職金は一時金と年金どっちで受け取るか｜額面ではなく手取りで比べる',
    breadcrumb: '退職金の受け取り方',
    description:
      '退職金の受け取り方(一時金・年金・併用)を、税金と社会保険料を引いた後の手取りで比較します。受け取り方で手取りが130万円変わる例、最初に確認すべき退職所得控除の早見表つき。',
    summary:
      '会社の案内に載っているのは税引き前の額面です。手取りで比べると順番が入れ替わり、一番多く残るのは二択の外にあります。控除額の早見表と計算ツールつき。',
    topic:
      '退職所得控除、一時金と年金の手取り比較、併用の区切り方、規程の利率の調べ方',
    datePublished: '2026-08-03',
    dateModified: '2026-08-03',
    visual: {
      src: '/retirement/taishokukin-uketorikata.webp',
      alt: '1本の帯が途中で区切られ、左右で異なる扱いになることを表した図',
    },
    order: 1,
  },
  {
    /* 2026-08-04 追加：駅1-2（記事11）。
     * 記事9で作った型に1本足すだけで、ハブ・sitemap・llms.txt・パンくず・
     * 構造化データ・トップページに自動反映される（新しい仕組みは作らない・指示書0章）。
     * この記事にツールは付けない（iDeCoの調整計算は後日ツールv2に統合する方針のため、
     * 記事9のツールへリンクするにとどめる・指示書2-3）。
     * order は 2。記事9が基礎・iDeCoが応用なので、ハブでは記事9を上に固定する
     * （初見の読者にとっての読む順が、ハブの並び順であるべき・2026-08-04 masato確定）。 */
    path: '/retirement/ideco-taishokukin-juntan',
    title: 'iDeCoと退職金は受け取る順番で手取りが変わる｜10年ルールの正確な中身',
    heading: 'iDeCoと退職金は、受け取る順番と間隔で手取りが変わります',
    breadcrumb: 'iDeCoと退職金の受け取り順',
    description:
      'iDeCoと退職金を近い時期に受け取ると、退職所得控除が重複分だけ減ります。「5年ルールが10年ルールになった」の正確な中身と経過措置、受け取る順番による手取りの差を、国税庁の原文と計算で確認します。',
    summary:
      '金額は1円も変わらないのに、受け取る順番と間隔だけで手取りが95万円変わる例があります。条文の「前年以前9年内」と、令和8年1月1日の経過措置を確認します。',
    /* topic に金額・税率は入れない（llms.txt が陳腐化するため）。
     * 「令和8年1月1日」は改正の施行日で、改正がない限り変わらない事実なので残す
     * （2026-08-04 masato確定）。 */
    topic:
      '退職所得控除の調整計算、受け取る順番による違い、令和8年1月1日の経過措置、重複期間の逆算',
    datePublished: '2026-08-04',
    dateModified: '2026-08-04',
    visual: {
      src: '/retirement/ideco-taishokukin-juntan.webp',
      alt: '2本の帯が時間軸の上に並び、重なった部分だけが色を変えていることを表した図',
    },
    order: 2,
  },
];

/** 表示順に並べた記事一覧（ハブ・トップ・sitemap・llms.txt が使う） */
export const RETIREMENT_ARTICLES: RetirementArticle[] = [...ARTICLES].sort((a, b) => a.order - b.order);

/** パスから記事を引く。未登録のパスは throw（登録漏れをビルド時に気付くため・/loan と同じ設計）。 */
export function getRetirementArticle(path: string): RetirementArticle {
  const found = ARTICLES.find((a) => a.path === path);
  if (!found) {
    throw new Error(`retirement article not registered: ${path}（lib/retirement/articles.ts に追加してください）`);
  }
  return found;
}
