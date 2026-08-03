import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import TaishokukinCalculator from '@/components/retirement/TaishokukinCalculator';
import {
  RetirementArticleHeader, Toc, TableScroll,
  buildRetirementArticleJsonLd, buildRetirementArticleMetadata,
  tableCls, thCls, tdCls, ORG_NAME,
  type TocItem,
} from '@/components/retirement/RetirementArticle';
import { getRetirementArticle } from '@/lib/retirement/articles';

/* ===== メタ情報 =====
 * 実体は lib/retirement/articles.ts（レジストリ）が持つ。ここでは参照するだけ。
 * /loan の記事（記事8など）と同じ組み立て。 */
const ARTICLE = getRetirementArticle('/retirement/taishokukin-uketorikata');
const PAGE_PATH = ARTICLE.path;

export const metadata = buildRetirementArticleMetadata(ARTICLE);

/* この記事はFAQ節を持たない（確定稿にFAQがない）。faqs を渡さないので
 * FAQPage ノードは生成されない（buildRetirementArticleJsonLd 側で制御）。 */
const jsonLd = buildRetirementArticleJsonLd({ article: ARTICLE });

/* ===== 目次（H2 と対応。ツールの見出しも1項目として出す） ===== */
const TOC: TocItem[] = [
  { id: 'no-net-in-notice', label: '会社から届いた案内に、手取りは書かれていません' },
  { id: 'deduction', label: '最初に確認するのは、あなたの退職所得控除です' },
  { id: 'over-deduction', label: '控除を超えても、課税されるのは超えた分の半分です' },
  { id: 'pension-form', label: '年金形式は総額が増えます。同時に、引かれるものも増えます' },
  { id: 'where-to-cut', label: '問いは「どっちか」ではなく「どこで切るか」です' },
  { id: 'calculator', label: 'あなたの数字で計算する' },
  { id: 'where-to-find', label: '自分の数字はどこに書いてあるか' },
  { id: 'cautions', label: 'やらない方がいい人と、この記事で扱わないこと' },
  { id: 'sources', label: '出典' },
];

const h2 = 'mt-10 scroll-mt-20 text-[20px] font-bold text-slate-900 sm:text-[22px]';
const h3 = 'mt-6 text-[16px] font-bold text-slate-900 sm:text-[17px]';
const p = 'mt-3 text-[15px] leading-relaxed text-slate-700';
const note = 'mt-2 text-[13px] leading-relaxed text-slate-500';
const ulCls = 'mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700';
const olCls = 'mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700';

export default function TaishokukinUketorikataPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <RetirementArticleHeader article={ARTICLE} />

        <Toc items={TOC} />

        {/* 導入（本文冒頭の4段落・H2なし） */}
        <p className={p}>
          会社から「退職金の受け取り方法の選択届」が届くと、一緒に一時金と年金それぞれの金額が書かれた案内が入っています。勤続25年・退職金2,200万円・規程の利率2.25%の人の場合、年金形式で10年受け取ると総額は2,481万円です。一時金の2,200万円より、<strong>281万円多く</strong>見えます。
        </p>
        <p className={p}>
          ところが、税金と社会保険料を引いた後の手取りで比べると、順番が入れ替わります。全額を年金で受け取ると、全額を一時金で受け取った場合より、手取りは<strong>65万円少なくなります</strong>。
        </p>
        <p className={p}>
          そして、一番多く残るのは二択のどちらでもありません。退職所得控除の額まで一時金で受け取り、超えた分だけを年金にすると、全額一時金より<strong>65万円多く</strong>残ります。この人にとって、一番少ない選び方と一番多い選び方の差は<strong>130万円</strong>になります。
        </p>
        <p className={p}>
          同じ退職金でも、受け取り方で手元に残る金額は変わります。この記事では、その差がどこから生まれるのかを、計算の途中まで開いて説明します。ここで挙げた金額は、後述する共通の前提にもとづく計算例です。
        </p>

        {/* 会社の案内に手取りはない */}
        <section id="no-net-in-notice">
          <h2 className={h2}>会社から届いた案内に、手取りは書かれていません</h2>
          <p className={p}>
            そもそも、受け取り方を選べる人は多くありません。退職給付制度がある企業は<strong>74.9%</strong>で、その内訳は一時金のみが<strong>69.0%</strong>、年金のみが<strong>9.6%</strong>、両方を持つ併用型が<strong>21.4%</strong>です（厚生労働省「令和5年就労条件総合調査」）。受け取り方を選べるかどうかは、勤め先の制度によります。一時金と年金の両方を持つ併用型なら選べる可能性が高く、そうでない場合は選択肢がないこともあります。まず自分の制度を確認してください。
          </p>
          <p className={p}>
            その案内に書かれているのは、一時金の額と、年金形式にした場合の年額・総額です。企業年金基金のウェブサイトにシミュレーターが用意されていることもあります。ただし、そこに表示される金額は、税金と社会保険料を引く<strong>前</strong>の額面です。
          </p>
          <p className={p}>
            これは会社が不親切だからではありません。手取りを計算するには、退職金の額のほかに、あなたが65歳から受け取る公的年金の見込み額、家族構成、住んでいる自治体の保険料率が必要です。会社はそのいずれも把握していません。制度上、会社に計算できない数字なのです。
          </p>
          <p className={p}>
            つまり、案内に載っている比較は「額面の比較」であり、あなたが決めるべきなのは「手取りの比較」です。両者は、この記事で見ていくとおり、結論が入れ替わることがあります。
          </p>
        </section>

        {/* 退職所得控除 */}
        <section id="deduction">
          <h2 className={h2}>最初に確認するのは、あなたの退職所得控除です</h2>
          <p className={p}>
            比較を始める前に、確認すべき数字が1つあります。<strong>退職所得控除</strong>です。退職所得控除とは、退職金を一時金で受け取るときに、税金の計算から差し引ける金額のことです。
          </p>
          <p className={p}>控除額は、勤続年数だけで決まります。</p>
          <ul className={ulCls}>
            <li>勤続20年以下：<strong>40万円 × 勤続年数</strong>（80万円に満たない場合は80万円）</li>
            <li>勤続20年超：<strong>800万円 + 70万円 ×（勤続年数 − 20年）</strong></li>
          </ul>
          <p className={p}>
            勤続年数に1年未満の端数があるときは、切り上げて1年として数えます。勤続20年を超えている人の場合、あと数か月で1年に届くなら、退職日が変わるだけで控除額が70万円変わることがあります。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>勤続年数</th>
                  <th className={thCls}>退職所得控除額</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>20年</td><td className={tdCls}>800万円</td></tr>
                <tr><td className={tdCls}>22年</td><td className={tdCls}>940万円</td></tr>
                <tr><td className={tdCls}>25年</td><td className={tdCls}>1,150万円</td></tr>
                <tr><td className={tdCls}>30年</td><td className={tdCls}>1,500万円</td></tr>
                <tr><td className={tdCls}>35年</td><td className={tdCls}>1,850万円</td></tr>
                <tr><td className={tdCls}>38年</td><td className={tdCls}>2,060万円</td></tr>
                <tr><td className={tdCls}>40年</td><td className={tdCls}>2,200万円</td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            勤続20年を超えると、1年あたりの控除額が40万円から70万円に増えます。長く勤めた人ほど、控除の伸び方が大きくなる仕組みです。
          </p>
          <p className={p}>
            参考までに、定年退職者の平均退職給付額は大卒で<strong>1,896万円</strong>、退職金と年金の併用型がある企業に限ると<strong>2,261万円</strong>です（厚生労働省「令和5年就労条件総合調査」）。多くの人の退職金額が、この早見表のどのあたりに位置するかの参考になります。
          </p>
          <p className={p}>ここで一度、自分の退職金の額と控除額を比べてください。</p>
          <p className={p}>
            <strong>退職金の額が控除額の範囲内なら、一時金で受け取れば所得税も住民税もかかりません。</strong>手取りは退職金の額そのままです。この場合、比較は事実上ここで終わります。年金形式にしても総額は増えますが、増えた分に税金と社会保険料がかかるため、手取りは一時金を下回る計算になります（具体的な金額は後述します）。
          </p>
          <p className={p}>
            なお、一時金で受け取るときは、「退職所得の受給に関する申告書」を会社に提出します。これを出しておけば、控除の適用も税額の計算も納付も会社側で完結します。あなたが確定申告をする必要はありません。
          </p>
        </section>

        {/* 課税は超えた分の半分 */}
        <section id="over-deduction">
          <h2 className={h2}>控除を超えても、課税されるのは超えた分の半分です</h2>
          <p className={p}>
            退職金が控除額を超えた場合でも、超えた全額に課税されるわけではありません。
          </p>
          <p className={p}>課税の対象になる金額（課税退職所得）は、次の式で決まります。</p>
          <p className={`${p} font-bold`}>（退職金 − 退職所得控除額）× 1/2</p>
          <p className={p}>
            さらに、この金額は給与や年金といった他の所得と合算されず、単独で税率が決まります。これを<strong>分離課税</strong>といいます。分離課税とは、他の所得と分けて税額を計算する仕組みのことです。住民税は一律<strong>10%</strong>（市町村民税6% + 道府県民税4%）です。
          </p>
          <p className={p}>ここから具体例に入ります。以下の3つの例は、すべて次の前提で計算しています。</p>

          <blockquote className="mt-4 rounded-xl border-l-4 border-slate-300 bg-slate-50 p-4">
            <p className="text-[14px] font-bold text-slate-800">この記事の例に共通する前提</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-slate-700">
              <li>65歳から受け取る公的年金は年220万円</li>
              <li>年金形式は、<strong>60歳で退職し、60歳から69歳までの10年間</strong>受け取る</li>
              <li>所得控除は基礎控除のみ</li>
              <li>国民健康保険料・介護保険料の増加は「増えた所得の約10%」という目安で計算</li>
              <li>所得税には復興特別所得税を含む</li>
              <li><strong>60歳以降も働いて給与を受け取る場合、企業年金はその給与と合算されて課税されるため、年金形式の税負担はここでの計算より重くなります。この記事の金額は、60歳で退職して他に収入がない場合のものです</strong></li>
            </ul>
            <p className="mt-3 text-[14px] leading-relaxed text-slate-700">
              企業年金の受取年数は、規程によって5年・10年・15年などから選べる場合があります。この記事では10年で計算しており、他の年数の金額は扱いません。
            </p>
          </blockquote>

          <p className={p}>
            <strong>勤続25年・退職金2,200万円・規程の利率2.25%の場合</strong>で、全額を一時金で受け取ったときの税額を計算します。
          </p>
          <ol className={olCls}>
            <li>退職所得控除額：勤続25年なので<strong>1,150万円</strong></li>
            <li>課税退職所得：（2,200万円 − 1,150万円）× 1/2 = <strong>525万円</strong></li>
            <li>所得税：5,250,000円 × 20% − 427,500円 = 622,500円</li>
            <li>復興特別所得税を含める：622,500円 × 1.021 = <strong>635,572円</strong>（1円未満切捨て）</li>
            <li>住民税：5,250,000円 × 10% = <strong>525,000円</strong></li>
            <li>税の合計：635,572円 + 525,000円 = <strong>1,160,572円</strong>（約116万円）</li>
          </ol>
          <p className={p}>
            手取りは<strong>2,084万円</strong>という計算になります。控除を超えた金額は1,050万円ですが、課税の対象になったのはその半分の525万円です。
          </p>
          <p className={p}>
            ただし、この「1/2」には例外があります。役員等で勤続年数が5年以下の場合は、1/2の適用がありません。役員等以外でも、勤続年数が5年以下のときは、300万円を超える部分について1/2が適用されません。勤続が長い人には関係のない話ですが、短期間で退職する場合は前提が変わります。
          </p>
        </section>

        {/* 年金形式は総額が増えるが引かれるものも増える */}
        <section id="pension-form">
          <h2 className={h2}>年金形式は総額が増えます。同時に、引かれるものも増えます</h2>
          <p className={p}>
            年金形式を選ぶと、受け取りを先送りする分、退職金は<strong>規程の利率</strong>で増えていきます。規程の利率とは、退職金規程や企業年金の規約で定められている、据え置き期間中の増加率のことです。
          </p>
          <p className={p}>
            勤続25年の例（利率2.25%）で10年の年金形式を選ぶと、年額248.1万円、10年間の総額は2,481万円になります。一時金の2,200万円より<strong>281万円多い</strong>金額です。案内に載っているのは、通常ここまでです。
          </p>
          <p className={p}>引かれる側で、2つのことが起きます。</p>
          <p className={p}>
            <strong>1つ目は、税金のかかり方が変わることです。</strong>年金形式で毎年受け取る金額は、退職所得ではなく「公的年金等の<strong>雑所得</strong>」として扱われます。雑所得とは、給与所得や退職所得などのどれにも当てはまらない所得の区分です。ここには<strong>公的年金等控除</strong>という差し引きがあり、65歳以上で年金収入が330万円未満なら110万円、65歳未満で130万円未満なら60万円が控除されます（収入がこれを超える場合、控除額の計算方法は変わります）。
          </p>
          <p className={p}>
            問題は、65歳になると老齢年金の受け取りが始まることです。企業年金と老齢年金は、どちらも「公的年金等の雑所得」として<strong>合算</strong>されて課税されます。退職所得のような分離課税ではないため、合算された金額に応じて税率が決まります。
          </p>
          <p className={p}>
            <strong>2つ目は、社会保険料です。</strong>公的年金等の雑所得は、国民健康保険料と介護保険料を計算するときの所得にも算入されます。一時金は分離課税で、これらの保険料の算定に含まれません。年金形式を選ぶと、税金だけでなく保険料も増えることになります。
          </p>
          <p className={p}>この2つを反映して、3つの例を一時金と年金で比べたものが次の表です。</p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>例</th>
                  <th className={thCls}>規程の利率</th>
                  <th className={thCls}>一時金の手取り</th>
                  <th className={thCls}>年金10年の手取り</th>
                  <th className={thCls}>差</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>勤続38年・2,000万円</td>
                  <td className={tdCls}>1.0%</td>
                  <td className={tdCls}><strong>2,000万円</strong></td>
                  <td className={tdCls}>1,731万円</td>
                  <td className={tdCls}>一時金が269万円多い</td>
                </tr>
                <tr>
                  <td className={tdCls}>勤続25年・2,200万円</td>
                  <td className={tdCls}>2.25%</td>
                  <td className={tdCls}><strong>2,084万円</strong></td>
                  <td className={tdCls}>2,019万円</td>
                  <td className={tdCls}>一時金が65万円多い</td>
                </tr>
                <tr>
                  <td className={tdCls}>勤続30年・1,200万円</td>
                  <td className={tdCls}>2.5%</td>
                  <td className={tdCls}><strong>1,200万円</strong></td>
                  <td className={tdCls}>1,147万円</td>
                  <td className={tdCls}>一時金が約53万円多い</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            勤続38年の例は、控除2,060万円が退職金2,000万円を上回るため、一時金なら税は0円、手取りは2,000万円です。年金形式にすると総額は2,112万円（+112万円）に増えますが、税と社会保険料が381万円増えるため、手取りは1,731万円になります。
          </p>
          <p className={p}>
            <strong>注目していただきたいのは、勤続30年の例です。</strong>規程の利率2.5%は3つの例のなかで最も高く、年金形式にすると総額は1,371万円（+171万円）まで増えます。それでも、税と社会保険料が224万円増えるため手取りは1,147万円で、一時金の1,200万円を下回ります。<strong>利率が高くても、退職金が控除の範囲内なら一時金が有利になる</strong>という計算です。
          </p>
          <p className={p}>もっとも、勤続25年の例のように控除を超える場合は、二択の外に選択肢があります。</p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>勤続25年・2,200万円の選択</th>
                  <th className={thCls}>手取り</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>全額を年金（10年）</td><td className={tdCls}>2,019万円</td></tr>
                <tr><td className={tdCls}>全額を一時金</td><td className={tdCls}>2,084万円</td></tr>
                <tr>
                  <td className={tdCls}><strong>併用（1,150万円まで一時金 + 残り1,050万円を年金）</strong></td>
                  <td className={tdCls}><strong>2,149万円</strong></td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            全額一時金は全額年金より<strong>65万円</strong>多く、併用は全額一時金よりさらに<strong>65万円</strong>多い計算になります。一番少ない全額年金と一番多い併用の差は、<strong>130万円</strong>です。
          </p>
          <p className={note}>
            ※ 国民健康保険料・介護保険料の増加は「増えた所得の約10%」という目安で計算しています。保険料率と算定方法は自治体によって異なるため、実際の金額はお住まいの市区町村で変わります（国民健康保険法施行令 第29条の7）。
          </p>
        </section>

        {/* どこで切るか */}
        <section id="where-to-cut">
          <h2 className={h2}>問いは「どっちか」ではなく「どこで切るか」です</h2>
          <p className={p}>
            ここまでの計算から言えることは、はっきりしています。<strong>退職所得控除の枠は、一時金で使い切るのが基本です。年金形式にするかどうかは、控除を超えた部分だけの判断になります。</strong>
          </p>
          <p className={p}>
            控除の額までを一時金で受け取れば、その部分の税金は0円です。年金形式に回しても税と社会保険料がかかるだけなので、控除枠を使い切らない理由がありません。
          </p>
          <p className={p}>
            そのうえで、控除を超える部分だけを、一時金にするか年金にするかを検討します。勤続25年の例でいえば、控除1,150万円を超える1,050万円の扱いだけが論点になります。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>超過分1,050万円の扱い</th>
                  <th className={thCls}>増える分</th>
                  <th className={thCls}>引かれる分</th>
                  <th className={thCls}>残り</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>一時金に含める</td>
                  <td className={tdCls}>0円</td>
                  <td className={tdCls}>税 ▲116.1万円</td>
                  <td className={tdCls}><strong>934万円</strong></td>
                </tr>
                <tr>
                  <td className={tdCls}>年金10年にする</td>
                  <td className={tdCls}>運用 +134.3万円</td>
                  <td className={tdCls}>税 + 国保・介護 ▲185.6万円</td>
                  <td className={tdCls}><strong>999万円</strong></td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>年金にした方が65万円多く残ります。関係を分解すると、次のようになります。</p>
          <ul className={ulCls}>
            <li>年金にすると、10年間の運用で<strong>134.3万円</strong>増えます</li>
            <li>一方で、引かれる金額は<strong>185.6万円</strong>です。一時金に含めた場合の<strong>116.1万円</strong>と比べて、<strong>69.5万円</strong>多い</li>
            <li>増える134.3万円が、余分に引かれる69.5万円を上回ります。差し引き<strong>64.7万円</strong>（表では65万円）が、年金に回すことで多く残る金額です</li>
          </ul>
          <p className={note}>
            ※ 上の表と分解の各項目は四捨五入しているため、表示された金額どうしを足し引きすると、1万円未満のずれが出る場合があります。
          </p>
          <p className={p}>
            つまり、年金形式が有利になるかどうかは、「運用で増える金額が、税と社会保険料の増加分を上回るか」という一点で決まります。総額が増えるから有利なのではありません。増え方と引かれ方のどちらが大きいか、という比較です。
          </p>
          <p className={p}>そして、増える金額を決めているのが<strong>規程の利率</strong>です。</p>
          <p className={p}>
            同じ超過分1,050万円を、利率1.0%で計算し直すと、こうなります。運用で増えるのは59万円、税と国民健康保険料・介護保険料の増加は169万円、残りは<strong>940万円</strong>です。一時金に含めた場合の934万円との差は、<strong>約6万円</strong>しかありません。
          </p>
          <p className={p}>
            利率が2.25%なら65万円の差がつき、1.0%なら約6万円まで縮む。同じ人・同じ金額でも、規程の利率が変わるだけで結論はここまで動きます。<strong>あなたが次に調べるべき数字は、勤め先の規程の利率です。</strong>
          </p>

          {/* 計算ツール（本文「規程の利率です。」の段落の直後・駅1指示書2-3） */}
          <div id="calculator" className="scroll-mt-20">
            <h2 className={h2}>あなたの数字で計算する</h2>
            <TaishokukinCalculator articlePath={PAGE_PATH} />
          </div>

          <p className={p}>
            ただし、控除額ちょうどで区切れるとは限りません。制度によっては、一時金と年金の割合があらかじめ決まっていることがあります。それでも、超過分の一部を年金にできるなら検討する価値はあります。勤続25年の例の人が「半分ずつ」しか選べない場合、手取りは<strong>2,143万円</strong>です。最適な区切り方の2,149万円には届きませんが、全額一時金の2,084万円は上回る計算になります。
          </p>
          <p className={p}>
            もう1つ、前提の確認が必要です。<strong>60歳以降も働く場合、この差は縮みます。</strong>勤続25年の例で、60歳から64歳まで年400万円の給与がある場合、超過分を年金に回すことで多く残る金額は、<strong>65万円から16万円</strong>になります。給与と企業年金が合算されて課税されるためです。年金形式が有利であることは変わりませんが、差は小さくなります。
          </p>
          <p className={p}>以上をまとめると、<strong>年金形式が一時金を上回るのは、次の3つが揃う場合です。</strong></p>
          <ol className={olCls}>
            <li>退職金が退職所得控除を超えていること</li>
            <li>規程の利率が高いこと（この記事の例では、2.25%なら65万円、1.0%なら約6万円まで縮みました）</li>
            <li>受け取る時期に、他の収入が少ないこと</li>
          </ol>
          <p className={p}>この3つが揃わない場合、年金形式が一時金を上回るのは難しい計算になります。</p>
        </section>

        {/* 自分の数字はどこに書いてあるか */}
        <section id="where-to-find">
          <h2 className={h2}>自分の数字はどこに書いてあるか</h2>
          <p className={p}>この記事の計算を自分の数字に置き換えるには、4つの情報が必要です。</p>
          <h3 className={h3}>1. 規程の利率と、選べる受取年数</h3>
          <p className={p}>
            退職金規程、企業年金基金から届く「給付の案内」、選択届に添えられた説明書きのいずれかに記載されています。実際の書類では「予定利率」「据置利率」「給付利率」などの名称で書かれていることがあります。見当たらない場合は、人事部門または企業年金基金に問い合わせてください。
          </p>
          <h3 className={h3}>2. 選べる分割の割合</h3>
          <p className={p}>
            一時金と年金を組み合わせられるか、組み合わせられる場合にどの割合を選べるかは、制度によって異なります。金額を自由に決められる制度もあれば、「全額」「半額」など決まった選択肢しかない制度もあります。退職金規程または選択届の説明書きで確認してください。この記事の結論は「控除額まで一時金、超過分を年金」ですが、そもそもその区切り方を選べるかどうかが先に決まります。
          </p>
          <h3 className={h3}>3. 65歳から受け取る公的年金の見込み額</h3>
          <p className={p}>
            ねんきん定期便、またはねんきんネットで確認できます。年金形式を選んだ場合、65歳以降はこの金額と企業年金が合算されて課税されるため、比較にはこの数字が必要です。
          </p>
          <h3 className={h3}>4. 勤続年数</h3>
          <p className={p}>
            選択届に記載されていることが多い項目です。記載がなければ人事部門に確認してください。1年未満の端数は切り上げて数えるため、勤続20年を超えている場合、退職日が変わるだけで控除額が70万円変わることがあります。退職日をまだ調整できる段階なら、確認しておく価値があります。
          </p>
        </section>

        {/* やらない方がいい人・扱わないこと */}
        <section id="cautions">
          <h2 className={h2}>やらない方がいい人と、この記事で扱わないこと</h2>
          <p className={p}>
            <strong>深く考えずに年金形式を選ぶことは、おすすめできません。</strong>勤続38年の例や勤続30年の例のように、退職金が退職所得控除の範囲内であれば、一時金なら税金は0円です。この状態で年金形式を選ぶと、税が0円になる権利を使わないまま、増えた分に税と社会保険料がかかります。勤続30年の例では、規程の利率が2.5%と高くても、手取りは一時金より約53万円少ないという計算になりました。
          </p>
          <p className={p}>
            <strong>逆に、規程の利率が高く、退職金が控除を大きく超える人が、検討せずに全額一時金を選ぶこともおすすめできません。</strong>勤続25年の例では、控除を超えた部分だけを年金に回すことで、全額一時金より65万円多く残る計算になりました。二択で考えると、この選択肢は見えません。
          </p>
          <h3 className={h3}>この記事で扱わないこと</h3>
          <ul className={ulCls}>
            <li>iDeCo・企業型DCと退職金を近い時期に受け取る場合の、退職所得控除の調整ルール</li>
            <li>勤続5年以下の場合、および役員等の場合の詳細な取り扱い</li>
            <li>障害を事由とする退職、死亡退職の場合の取り扱い</li>
          </ul>
          <p className={p}>
            いずれも別の記事で扱います。該当する可能性がある場合、この記事の計算をそのまま当てはめないでください。
          </p>
        </section>

        {/* 出典 */}
        <section id="sources" className="mt-10 scroll-mt-20">
          <h2 className="mb-3 text-[20px] font-bold text-slate-900">出典</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-slate-700">
            <li>国税庁 タックスアンサー No.1420「退職金を受け取ったとき（退職所得）」</li>
            <li>国税庁 タックスアンサー No.1600「公的年金等の課税関係」</li>
            <li>国税庁 確定申告の手引き「公的年金等に係る雑所得の速算表」</li>
            <li>地方税法 第328条の3・第50条の4（退職所得の分離課税の税率）</li>
            <li>厚生労働省「令和5年就労条件総合調査」</li>
            <li>国民健康保険法施行令 第29条の7</li>
          </ul>
          {/* 免責＋運営者導線は全記事共通のサイト定型（記事本文ではない）。
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
