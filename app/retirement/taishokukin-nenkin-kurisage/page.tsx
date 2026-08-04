import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import {
  RetirementArticleHeader, Toc, TableScroll,
  buildRetirementArticleJsonLd, buildRetirementArticleMetadata,
  tableCls, thCls, tdCls, ORG_NAME,
  type TocItem,
} from '@/components/retirement/RetirementArticle';
import { getRetirementArticle } from '@/lib/retirement/articles';

/* ===== メタ情報 =====
 * 実体は lib/retirement/articles.ts（レジストリ）が持つ。ここでは参照するだけ。
 * 記事9（/retirement/taishokukin-uketorikata）・記事11（同 ideco-taishokukin-juntan）と同じ組み立て。
 *
 * この記事にツールは埋め込まない（駅1-4指示書0章・3-3）。繰下げの比較は記事9に埋め込み済みの
 * TaishokukinCalculator（v2.0「年金の受け取り開始年齢との組み合わせ」ブロック）がすでに担っており、
 * 同じ比較を2箇所に置くと数値の二重管理になるため。ここでは記事9のツールへ導線を1本置くにとどめる。 */
const ARTICLE = getRetirementArticle('/retirement/taishokukin-nenkin-kurisage');

export const metadata = buildRetirementArticleMetadata(ARTICLE);

/* この記事はFAQ節を持たない（確定稿にFAQがない）。faqs を渡さないので
 * FAQPage ノードは生成されない（記事9・記事11と同じ）。 */
const jsonLd = buildRetirementArticleJsonLd({ article: ARTICLE });

/* ===== 目次（H2 と対応）=====
 * ツールへの導線は見出しではないため目次に載せない（記事11と同じ・2026-08-04 masato確定）。 */
const TOC: TocItem[] = [
  { id: 'same-income', label: '退職金を年金で受け取ると、公的年金と同じ所得にまとめられます' },
  { id: 'pension-period', label: '企業年金の受け取り期間には、終わりがあります' },
  { id: 'overlap-five-years', label: '重なる5年間で、何がどれだけ変わるか' },
  { id: 'kurisage-increase', label: '公的年金を繰り下げると、年金額そのものも増えます' },
  { id: 'lifetime', label: '生涯の手取りで見ると、何歳まで生きるかで結論が変わります' },
  { id: 'vs-uketorikata', label: 'この表の数字は、受け取り方を比べたときの数字とは別のものです' },
  { id: 'lump-sum-only', label: '全額一時金を選ぶ人には、この判断はありません' },
  { id: 'where-to-find', label: '自分の数字はどこに書いてあるか' },
  { id: 'cautions', label: 'やらない方がいい人と、この記事で扱わないこと' },
  { id: 'sources', label: '出典' },
];

const h2 = 'mt-10 scroll-mt-20 text-[20px] font-bold text-slate-900 sm:text-[22px]';
const h3 = 'mt-6 text-[16px] font-bold text-slate-900 sm:text-[17px]';
const p = 'mt-3 text-[15px] leading-relaxed text-slate-700';
const ulCls = 'mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700';
const olCls = 'mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700';
const linkCls = 'text-blue-700 underline hover:no-underline';

export default function TaishokukinNenkinKurisagePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <RetirementArticleHeader article={ARTICLE} />

        <Toc items={TOC} />

        {/* 導入（本文冒頭の3段落・H2なし） */}
        <p className={p}>
          退職金を一時金で受け取るか、年金で受け取るかは、別の記事
          <Link href="/retirement/taishokukin-uketorikata" className={linkCls}>退職金は一時金と年金どっちで受け取るか</Link>
          で扱いました。ただし、年金形式を選ぶなら、その判断はもう1つの選択と切り離せません。<strong>公的年金をいつから受け取るか</strong>です。
        </p>
        <p className={p}>
          勤続25年・退職金2,200万円の人が、10年の年金形式を選んだとします。この人が企業年金を受け取っている10年間にかかる税と社会保険料は、公的年金を65歳から受け取る場合は<strong>5,670,418円</strong>、70歳まで繰り下げる場合は<strong>3,048,693円</strong>という計算になります。<strong>差は約262万円</strong>です。
        </p>
        <p className={p}>
          受け取る退職金の額は同じです。企業年金の年額も同じです。変わるのは、公的年金をいつから受け取り始めるかだけです。
        </p>

        {/* 前提の囲み（本文3〜21行目の {'>'} ブロック）。記事9・記事11と同じ callout ボックス
            （素の blockquote ではなく、左罫線＋淡色背景の囲み）。前提が最も密度の高い部分。 */}
        <blockquote className="mt-4 rounded-xl border-l-4 border-slate-300 bg-slate-50 p-4">
          <p className="text-[14px] font-bold text-slate-800">この記事の計算の前提</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-slate-700">
            <li>勤続25年・退職金2,200万円・退職金規程の利率2.25%</li>
            <li>年金の受け取りは10年（60歳から69歳まで）。企業年金の年額は<strong>2,481,329円</strong>、受け取り総額は<strong>24,813,290円</strong></li>
            <li>65歳から受け取れる公的年金は年額<strong>2,200,000円</strong></li>
            <li>60歳で退職し、60〜64歳に他の収入はない。配偶者はいないものとし、加給年金は考慮しない</li>
            <li>所得控除は基礎控除のみで計算しています（所得税48万円・住民税43万円）。社会保険料控除や配偶者控除は含めていません</li>
            <li>所得税・住民税とも、課税標準の1,000円未満を切り捨てて計算しています。所得税には復興特別所得税（2.1%）を含み、1円未満を切り捨てます。住民税は一律10%で、均等割は含めていません</li>
            <li>国民健康保険料・介護保険料は、雑所得の10%という目安で計算しています。<strong>この10%は法令に定められた率ではなく、当サイトが用いている概算の率です。</strong>実際の保険料は自治体や所得段階によって異なります</li>
            <li>国民健康保険料には<strong>賦課限度額</strong>（1年に支払う保険料の上限額）があり、所得が高い場合、実際の負担はこの計算より小さくなることがあります</li>
            <li>75歳からは後期高齢者医療制度に移りますが、この計算では全期間を同じ目安率で扱っています</li>
          </ul>
          <p className="mt-3 text-[14px] leading-relaxed text-slate-700">
            社会保険料が概算であるため、<strong>水準そのものより、3つの開始年齢の差を見てください。</strong>
          </p>
        </blockquote>

        {/* 公的年金と同じ所得にまとめられる（本文23〜40行目。見出し・本文とも置換①②③を適用済み） */}
        <section id="same-income">
          <h2 className={h2}>退職金を年金で受け取ると、公的年金と同じ所得にまとめられます</h2>
          <p className={p}>
            退職金を一時金で受け取ると、税の上では退職所得になります。退職所得は<strong>分離課税</strong>です。分離課税とは、他の所得と合算せず、単独で税額を計算する仕組みのことです。
          </p>
          <p className={p}>
            一方、退職金を年金形式で受け取ると、毎年の受け取りは「<strong>公的年金等の雑所得</strong>」になります。公的年金等の雑所得とは、公的年金や企業年金など、年金として受け取る収入をまとめた所得の区分です。
          </p>
          <p className={p}>
            そして、65歳から受け取る老齢年金も、同じ「公的年金等の雑所得」です。<strong>両者は別々の制度から出るお金ですが、税の計算では同じ所得区分にまとめられます。</strong>
          </p>
          <p className={p}>
            問題は、この所得区分に用意されている差し引きです。<strong>公的年金等控除</strong>——公的年金等の収入から差し引ける金額のこと——は、収入の合計額に対して一度だけ計算されます。企業年金の分と老齢年金の分が、別々に用意されているわけではありません。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>その年の公的年金等の収入</th>
                  <th className={thCls}>公的年金等控除額</th>
                  <th className={thCls}>雑所得</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>企業年金のみ 2,481,329円</td>
                  <td className={tdCls}><strong>1,100,000円</strong></td>
                  <td className={tdCls}>1,381,329円</td>
                </tr>
                <tr>
                  <td className={tdCls}>企業年金 + 老齢年金 4,681,329円</td>
                  <td className={tdCls}><strong>1,387,199円</strong></td>
                  <td className={tdCls}>3,294,130円</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            老齢年金2,200,000円が加わると、収入は2,200,000円増えます。それに対して、控除は<strong>287,199円</strong>しか増えません。増えた収入のほとんどが、そのまま雑所得の増加になります。
          </p>
          <p className={p}>
            雑所得が増えれば、所得税と住民税が増えます。さらに、国民健康保険料と介護保険料の算定にも雑所得が使われるため、社会保険料も増えます。
          </p>
        </section>

        {/* 企業年金の受け取り期間には終わりがある（本文42〜52行目） */}
        <section id="pension-period">
          <h2 className={h2}>企業年金の受け取り期間には、終わりがあります</h2>
          <p className={p}>ここで、2つの年金の性質の違いが効いてきます。</p>
          <p className={p}>
            <strong>企業年金の受け取りには、終わりがあります。</strong>60歳から10年受け取るなら、69歳で終わります。<strong>老齢年金は終身です。</strong>受け取り始めたら、亡くなるまで続きます。
          </p>
          <p className={p}>
            公的年金を65歳から受け取る場合、2つが重なるのは<strong>65歳から69歳までの5年間だけ</strong>です。60歳から64歳までは企業年金だけ、70歳以降は老齢年金だけになります。
          </p>
          <p className={p}>
            そして、公的年金を70歳まで繰り下げると、<strong>この5年間は企業年金だけになります。</strong>重なりが消えます。
          </p>
          <p className={p}>
            企業年金があると公的年金等の収入が増えるため、手取りの率が下がるという説明があります。ただしそれは、企業年金を終わりのない収入として見た場合です。受け取り期間に終わりがあるなら、重なる期間だけを外すという考え方ができます。
          </p>
        </section>

        {/* 重なる5年間で何がどれだけ変わるか（本文54〜85行目） */}
        <section id="overlap-five-years">
          <h2 className={h2}>重なる5年間で、何がどれだけ変わるか</h2>
          <p className={p}>65歳から69歳までの1年分を、2つの選び方で並べます。</p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}></th>
                  <th className={thCls}>65歳から受け取る</th>
                  <th className={thCls}>70歳まで繰り下げる</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>その年の公的年金等の収入</td>
                  <td className={tdCls}>4,681,329円</td>
                  <td className={tdCls}>2,481,329円</td>
                </tr>
                <tr>
                  <td className={tdCls}>公的年金等控除</td>
                  <td className={tdCls}>1,387,199円</td>
                  <td className={tdCls}>1,100,000円</td>
                </tr>
                <tr>
                  <td className={tdCls}>雑所得</td>
                  <td className={tdCls}>3,294,130円</td>
                  <td className={tdCls}>1,381,329円</td>
                </tr>
                <tr>
                  <td className={tdCls}>所得税の課税標準（基礎控除48万円を引き、1,000円未満切捨て）</td>
                  <td className={tdCls}>2,814,000円</td>
                  <td className={tdCls}>901,000円</td>
                </tr>
                <tr>
                  <td className={tdCls}>所得税（復興特別所得税を含む）</td>
                  <td className={tdCls}>187,761円</td>
                  <td className={tdCls}>45,996円</td>
                </tr>
                <tr>
                  <td className={tdCls}>住民税の課税標準（基礎控除43万円を引き、1,000円未満切捨て）</td>
                  <td className={tdCls}>2,864,000円</td>
                  <td className={tdCls}>951,000円</td>
                </tr>
                <tr>
                  <td className={tdCls}>住民税（10%）</td>
                  <td className={tdCls}>286,400円</td>
                  <td className={tdCls}>95,100円</td>
                </tr>
                <tr>
                  <td className={tdCls}>社会保険料（目安）</td>
                  <td className={tdCls}>329,413円</td>
                  <td className={tdCls}>138,133円</td>
                </tr>
                <tr>
                  <td className={tdCls}><strong>1年の負担の合計</strong></td>
                  <td className={tdCls}><strong>803,574円</strong></td>
                  <td className={tdCls}><strong>279,229円</strong></td>
                </tr>
                <tr>
                  <td className={tdCls}><strong>1年の手取り</strong></td>
                  <td className={tdCls}><strong>3,877,755円</strong></td>
                  <td className={tdCls}><strong>2,202,100円</strong></td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            雑所得が増えると、所得税の税率が上がる区分に入ります。住民税と社会保険料は、いずれも雑所得に比例して増えます。3つが同時に増えるため、負担の差は大きくなります。
          </p>
          <p className={p}>
            企業年金を受け取っている10年間（60歳から69歳まで）の合計は、次のようになります。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>老齢年金の受け取り開始</th>
                  <th className={thCls}>税と社会保険料の合計</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>65歳</td>
                  <td className={tdCls}><strong>5,670,418円</strong></td>
                </tr>
                <tr>
                  <td className={tdCls}>70歳</td>
                  <td className={tdCls}><strong>3,048,693円</strong></td>
                </tr>
                <tr>
                  <td className={tdCls}>75歳</td>
                  <td className={tdCls}><strong>3,048,693円</strong></td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}><strong>差は約262万円です。</strong></p>
          <p className={p}>
            75歳まで繰り下げる場合が70歳の場合と同じ金額なのは、<strong>どちらも69歳までは企業年金だけ</strong>だからです。この10年間に限れば、70歳まで繰り下げても75歳まで繰り下げても、負担は変わりません。
          </p>
          <p className={p}>
            もう1つ確認しておく必要があります。<strong>60歳から64歳までの負担は、3通りとも同じです。</strong>この期間は、どの選び方でも企業年金だけを受け取っているためです。<strong>差はすべて、65歳から69歳までの5年間で生まれています。</strong>
          </p>
        </section>

        {/* 繰下げで年金額そのものも増える（本文87〜104行目） */}
        <section id="kurisage-increase">
          <h2 className={h2}>公的年金を繰り下げると、年金額そのものも増えます</h2>
          <p className={p}>
            <strong>繰下げ受給</strong>とは、老齢年金の受け取り開始を65歳より後にすることで、年金額を増やす仕組みのことです。増額率は1か月あたり0.7%で、75歳まで（120か月）繰り下げると84%増えます。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>受け取り開始</th>
                  <th className={thCls}>増額率</th>
                  <th className={thCls}>年額</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>65歳</td>
                  <td className={tdCls}>—</td>
                  <td className={tdCls}><strong>2,200,000円</strong></td>
                </tr>
                <tr>
                  <td className={tdCls}>70歳</td>
                  <td className={tdCls}><strong>+42%</strong></td>
                  <td className={tdCls}><strong>3,124,000円</strong></td>
                </tr>
                <tr>
                  <td className={tdCls}>75歳</td>
                  <td className={tdCls}><strong>+84%</strong></td>
                  <td className={tdCls}><strong>4,048,000円</strong></td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>ここまでで、繰下げの効果が2つに分かれることが分かります。</p>
          <ol className={olCls}>
            <li><strong>老齢年金の年額そのものが増える</strong></li>
            <li><strong>企業年金と重なる期間の税と社会保険料が下がる</strong></li>
          </ol>
          <p className={p}>
            一般に語られるのは1つ目です。企業年金を年金形式で受け取る人には、2つ目が加わります。
          </p>
          <p className={p}>
            <strong>そして、対価があります。繰り下げている間、老齢年金は1円も受け取れません。</strong>70歳まで繰り下げるなら5年間、75歳まで繰り下げるなら10年間、老齢年金の収入はゼロです。増えた年額は、その後に受け取ることで回収していく形になります。
          </p>
        </section>

        {/* 生涯の手取り（本文106〜129行目）。表5は4列で、/retirement で最も横に広い表。 */}
        <section id="lifetime">
          <h2 className={h2}>生涯の手取りで見ると、何歳まで生きるかで結論が変わります</h2>
          <p className={p}>
            前の章の表は、重なる5年間の1年分です。ここからの表は、60歳から想定した年齢までの合計です。
          </p>
          <p className={p}>
            企業年金と老齢年金を合わせて、60歳から想定寿命まで受け取った手取りの合計を、開始年齢3通りで並べます。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>想定寿命</th>
                  <th className={thCls}>65歳から受け取る</th>
                  <th className={thCls}>70歳まで繰り下げる</th>
                  <th className={thCls}>75歳まで繰り下げる</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>80歳</td>
                  <td className={tdCls}><strong>5,205万円</strong></td>
                  <td className={tdCls}>5,128万円</td>
                  <td className={tdCls}>4,220万円</td>
                </tr>
                <tr>
                  <td className={tdCls}>85歳</td>
                  <td className={tdCls}>6,200万円</td>
                  <td className={tdCls}><strong>6,470万円</strong></td>
                  <td className={tdCls}>5,922万円</td>
                </tr>
                <tr>
                  <td className={tdCls}>90歳</td>
                  <td className={tdCls}>7,196万円</td>
                  <td className={tdCls}><strong>7,812万円</strong></td>
                  <td className={tdCls}>7,625万円</td>
                </tr>
                <tr>
                  <td className={tdCls}>95歳</td>
                  <td className={tdCls}>8,192万円</td>
                  <td className={tdCls}>9,153万円</td>
                  <td className={tdCls}><strong>9,328万円</strong></td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            太字が、各行で最も大きい値です。想定寿命は、その年齢まで受け取った場合を指します（80歳なら、60歳から80歳までの21年分です）。<strong>万円単位で示しているのは、社会保険料を目安の率で概算しているためです。</strong>
          </p>
          <p className={p}>行ごとに見ると、こうなります。</p>
          <ul className={ulCls}>
            <li><strong>80歳まで</strong>なら、<strong>65歳から受け取る場合</strong>が最も多くなります</li>
            <li><strong>85歳まで</strong>と<strong>90歳まで</strong>なら、<strong>70歳まで繰り下げる場合</strong>が最も多くなります</li>
            <li><strong>95歳まで</strong>なら、<strong>75歳まで繰り下げる場合</strong>が最も多くなります</li>
          </ul>
          <p className={p}>
            <strong>どれが最も多いかは、何歳まで生きるかで入れ替わります。</strong>繰下げは、待っている間の受け取りをゼロにして、その後の年額を増やす選択です。受け取る期間が長いほど、増えた年額を回収する時間が長くなります。逆に短ければ、待っていた期間の分を取り戻せません。
          </p>
          <p className={p}>
            したがって、この表から「繰り下げた方がよい」という結論は出ません。何歳まで生きるかは、決めることも知ることもできないためです。この表が示しているのは、<strong>どちらの向きに転ぶかの分かれ目が、どのあたりにあるか</strong>です。
          </p>
        </section>

        {/* 記事9の数字との違い（本文131〜142行目）。見出し・本文に置換④⑤⑥を適用済み。
            2026-08-04：ここは当初 2行2列の表だったが、公開後の実測を受けて段落2つに変更した（追補②）。
            セルには thCls / tdCls の whitespace-nowrap が効くため、数値ではなく散文を入れると
            折り返さずに伸びる。この表だけ実効幅が 1,473px（表示枠 720px）になり、753px 分の
            横スクロールが必要になっていた。nowrap は数値の表に必要な設計なので変更せず、
            「散文を表に入れるのをやめる」という直し方を採っている。同じ理由で、この箇所を
            表に戻さないこと。
            置換⑤の文言（『全額年金の手取り 2,019万円』）は段落にそのまま引き継いでいる。
            リンクにしない方針も維持：本文にリンク記法がなく、下の段落にすでに記事9への
            リンクがあり近接して重複するため（追補①・masato確定）。 */}
        <section id="vs-uketorikata">
          <h2 className={h2}>この表の数字は、受け取り方を比べたときの数字とは別のものです</h2>
          <p className={p}>ここで、混同しやすい点を1つ整理します。</p>
          <p className={p}>
            「退職金は一時金と年金どっちで受け取るか」に出てくる『全額年金の手取り <strong>2,019万円</strong>』は、公的年金を受け取っている人が、退職金を<strong>年金で受け取ることによって手元に増える額</strong>です。一時金・年金・併用のどれを選ぶかを比べるための量です。
          </p>
          <p className={p}>
            この記事の「生涯の手取り」は、企業年金と老齢年金を合わせて、<strong>想定した年齢まで受け取った合計</strong>です。
          </p>
          <p className={p}>
            <strong>この2つは、足し引きできる関係にはありません。</strong>測っているものが違います。2,019万円は「退職金の受け取り方を比べるため」の量で、この記事の数字は「生涯に受け取る合計」です。片方からもう片方を引いても、意味のある数字にはなりません。
          </p>
          <p className={p}>
            退職金の受け取り方そのものを比べたい場合は、
            <Link href="/retirement/taishokukin-uketorikata" className={linkCls}>退職金は一時金と年金どっちで受け取るか</Link>
            をご覧ください。
          </p>
        </section>

        {/* 全額一時金を選ぶ人には関係がない（本文144〜150行目） */}
        <section id="lump-sum-only">
          <h2 className={h2}>全額一時金を選ぶ人には、この判断はありません</h2>
          <p className={p}>
            ここまでの話は、退職金を年金形式または併用で受け取る人のためのものです。
          </p>
          <p className={p}>
            退職金を全額一時金で受け取れば、それは退職所得になります。退職所得は分離課税なので、<strong>公的年金と合算されません。</strong>したがって、公的年金の受け取り開始年齢を変えても、退職金にかかる税は変わりません。この記事の判断そのものが発生しません。
          </p>
          <p className={p}>
            一時金と年金のどちらを選ぶかは、
            <Link href="/retirement/taishokukin-uketorikata" className={linkCls}>退職金は一時金と年金どっちで受け取るか</Link>
            で扱っています。<strong>まずそちらで受け取り方を決め、年金形式または併用を選ぶ場合に、この記事の判断に進んでください。</strong>
          </p>
        </section>

        {/* 自分の数字はどこに書いてあるか（本文152〜163行目）。
            本文の「**1. …**」形式の小見出しは、記事9・記事11と同じく h3 として実装する。 */}
        <section id="where-to-find">
          <h2 className={h2}>自分の数字はどこに書いてあるか</h2>
          <p className={p}>この記事の計算を自分の数字に置き換えるには、3つの情報が必要です。</p>
          <h3 className={h3}>1. 企業年金の年額と、受け取り期間</h3>
          <p className={p}>
            退職金規程、会社から届く選択届、企業年金基金から届く給付の案内のいずれかに記載されています。<strong>受け取り期間は特に重要です。</strong>この記事の考え方は、企業年金の受け取りに終わりがあることを前提にしているためです。
          </p>
          <h3 className={h3}>2. 65歳から受け取れる公的年金の見込額</h3>
          <p className={p}>
            ねんきん定期便、またはねんきんネットで確認できます。企業年金と合算される金額なので、この数字がないと重なる期間の負担を計算できません。
          </p>
          <h3 className={h3}>3. 勤続年数</h3>
          <p className={p}>
            退職金規程に記載されています。退職金の額と受け取り方を決める前提になります。
          </p>
          {/* 記事9のツールへの導線（本文の追記ではなく、テンプレート側の相互参照・駅1-4指示書3-3）。
              位置は「自分の数字はどこに書いてあるか」の章の末尾（追補① Q4・masato確定）。
              直前の章末が記事9へのリンクで終わるため、そこに置くと同じ遷移先が2行続く。また、
              読者が3つの数字を確認し終えた直後がツールを開くのに最も自然な位置。 */}
          <p className={`${p} mt-8`}>
            → この記事の計算は、
            <Link href="/retirement/taishokukin-uketorikata" className={linkCls}>「退職金は一時金と年金どっちで受け取るか」</Link>
            の計算ツールで、自分の数字を入れて試せます。年金の受け取り開始年齢との組み合わせも同じツールで比べられます。
          </p>
        </section>

        {/* やらない方がいい人・扱わないこと（本文165〜184行目） */}
        <section id="cautions">
          <h2 className={h2}>やらない方がいい人と、この記事で扱わないこと</h2>
          <p className={p}>
            <strong>繰り下げている間の生活費を、老齢年金なしでまかなえない人には、繰下げはおすすめできません。</strong>繰下げは、その期間を自分の資産と企業年金でまかなえることが前提です。
          </p>
          <p className={p}>
            とくに注意が必要なのは、<strong>企業年金の受け取りが終わったあと、老齢年金が始まるまでの期間</strong>です。この前提のケースで75歳まで繰り下げる場合、70歳から74歳までの5年間が、公的年金等の収入がまったくない期間になります。<strong>この期間の生活費は、生涯の手取りの表には一切考慮されていません。</strong>表に出ているのは受け取る合計額であって、その間をどう暮らすかは別の問題です。
          </p>
          <p className={p}>
            <strong>長生きを前提に置いて繰下げを決めることも、おすすめできません。</strong>80歳までなら、65歳から受け取る場合が最も多いという計算になりました。繰下げが有利になるかどうかは、想定する年齢によって入れ替わります。
          </p>
          <p className={p}>
            <strong>この記事の数字をそのまま自分に当てはめることも、おすすめできません。</strong>企業年金の年額、受け取り期間、公的年金の見込額のいずれかが変われば、結論の向きも変わります。特に受け取り期間が長い制度では、重なる期間そのものが変わります。
          </p>
          <h3 className={h3}>この記事で扱わないこと</h3>
          <ul className={ulCls}>
            <li><strong>加給年金</strong>（65歳未満の配偶者がいる場合などの加算）。繰下げの待機中は受け取れないため、該当する人は繰下げの有利さが小さくなります。金額はこの記事では扱いません</li>
            <li>老齢基礎年金と老齢厚生年金を分けて繰り下げる場合</li>
            <li>60歳以降も働く場合（在職老齢年金による支給停止）</li>
            <li>
              iDeCo・企業型DCを併せて受け取る場合。こちらは
              <Link href="/retirement/ideco-taishokukin-juntan" className={linkCls}>iDeCoと退職金は、受け取る順番と間隔で手取りが変わります</Link>
              で扱っています
            </li>
            <li>「5年前みなし繰下げ」の特例</li>
            <li>繰上げ受給（65歳より前に受け取る場合）</li>
          </ul>
          <p className={p}>いずれも、この記事の計算をそのまま当てはめないでください。</p>
        </section>

        {/* 出典（本文186〜196行目の9件を、本文中に番号を振らず末尾に一括で出す） */}
        <section id="sources" className="mt-10 scroll-mt-20">
          <h2 className="mb-3 text-[20px] font-bold text-slate-900">出典</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-slate-700">
            <li>日本年金機構「年金の繰下げ受給」（増額率0.7%/月・上限75歳）</li>
            <li>厚生年金保険法 第44条の3（支給の繰下げ）</li>
            <li>所得税法 第35条（雑所得・公的年金等控除）</li>
            <li>所得税法 第31条（退職手当等とみなす一時金）</li>
            <li>国税通則法 第118条第1項（国税の課税標準の端数計算）</li>
            <li>地方税法 第20条の4の2第1項（課税標準額の端数計算）</li>
            <li>国民健康保険法施行令 第29条の7（賦課限度額）</li>
            <li>国税庁 タックスアンサー No.1600「公的年金等の課税関係」</li>
            <li>国税庁「所得税の税率」（速算表）</li>
          </ul>
          {/* 免責＋運営者導線は全記事共通のサイト定型（記事本文ではない）。記事9・記事11と同じブロック。
              本文の確定稿には免責文がないため追記せず、サイト共通の信頼導線のみを置く。 */}
          <h3 className="mt-6 text-[16px] font-bold text-slate-900">免責</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
            本記事は一般的な情報提供を目的とした試算であり、税務・投資に関する助言ではありません。実際の税額・社会保険料は、お住まいの自治体や個別の事情によって異なります。受け取り方を決める際は、勤め先の人事部門・企業年金基金、または税務署・税理士にご確認ください。
          </p>
          <p className="mt-4 text-[13px] text-slate-500">
            運営：{ORG_NAME}（
            <Link href="/company" className="text-blue-700 hover:underline">運営会社・お問い合わせ</Link>
            ／
            <Link href="/privacy" className="text-blue-700 hover:underline">プライバシーポリシー</Link>
            ／
            <Link href="/policy" className="text-blue-700 hover:underline">中立性ポリシー</Link>
            ）
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
