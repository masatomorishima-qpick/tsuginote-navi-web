/**
 * app/retirement/pro/tokushoho/page.tsx — 特定商取引法に基づく表記（有料版）
 *
 * ★文は第5版b（houmu_an_20260902b.md）§1 から1文字も変えずに入れています（生成器で切り出し）。
 *   変えたいときは、消す前に戦術Coworkへ投げてください。
 * ★見た目は /terms・/privacy と同じ骨（GuideHeader／max-w-4xl の白い箱／SiteFooter）。layout は足していません。
 * ★BackButton は置きません（別のタブで開かれたとき、戻り先が無いため。senjutsu_20260902b.md 3番の5）。
 * ★この頁では track() を呼びません（買う前に読む頁です）。
 * ★動作環境は DOUSA_KANKYOU の1か所だけ。実際に動かして確かめたものだけを書きます（senjutsu_20260902c.md 3番）。
 *   【版】が残ったまま本番に出しません。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import { SITE_URL } from '@/components/loan/LoanArticle';

const PAGE_PATH = '/retirement/pro/tokushoho';

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 | つぎの手ナビ',
  description: '退職金とiDeCoの受け取り方シミュレーション（有料版）の特定商取引法に基づく表記です。',
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
};

/** 実際に動かして確かめた環境だけ。確かめていないものは書きません */
/**
 * 動作環境の前半の1文（senjutsu_20260902c.md 3番の形）。
 * ★【版】は、森嶋さんから版が届いたら埋めます。★【版】が1つでも残ったまま本番に出しません。
 */
const DOUSA_KANKYOU =
  'Safari 【版】（Mac）、Safari 【版】（iPhone・iOS 【版】）、Google Chrome 151（Mac）でご利用いただけることを確かめています。';

/** 第5版b §1 の表（16行）。項目名も中身も、そのままの順番です */
const KOUMOKU: ReadonlyArray<readonly [string, string]> = [
  ['サービス名', '退職金とiDeCoの受け取り方シミュレーション（有料版）'],
  ['販売事業者', 'BlueAdventures'],
  ['運営統括責任者', '森嶋 聖人'],
  ['所在地', '神奈川県横浜市西区浅間町1丁目4番3号ウィザードビル402'],
  ['電話番号', 'お求めがあれば、遅滞なく書面または電子メールでお知らせします。info@blueadventures.jp までご連絡ください'],
  ['メールアドレス', 'info@blueadventures.jp'],
  ['販売価格', '19,800円（税込）'],
  ['商品代金以外に必要な料金', 'インターネットの接続料金・通信料金は、お客様のご負担となります'],
  ['お支払い方法', 'クレジットカード（Stripeによる決済）'],
  ['お支払い時期', 'お申し込みのとき'],
  ['購入方法', '当サイトの計算結果の画面で「有料版購入」を押していただくと、決済ページ（Stripe）へ移ります。決済が完了すると、そのままご利用いただけます'],
  ['商品の引渡時期', '決済が完了したあと、ただちにご利用いただけます'],
  ['ご利用いただける期間', 'お支払いの完了後、1年間'],
  ['返品・キャンセルについて', 'お客様のご都合による返金は、お受けしていません。ご購入後すぐに計算結果をご覧いただけるためです。当社に原因のある不具合があったときは、お支払いいただいた額の全額を返金します。計算に誤りがあった、画面が表示されない、お支払いいただいたのにご利用いただけない、などです。info@blueadventures.jp までご連絡ください。推奨する動作環境の外でのご利用と、保守のための一時的な停止は、上記の不具合に含みません'],
  ['適格請求書（インボイス）', '当社は適格請求書発行事業者ではないため、インボイス（適格請求書）の発行はいたしかねます'],
  ['動作環境', `${DOUSA_KANKYOU}これ以外の環境でのご利用は、動作を保証いたしかねます`],
];

export default function TokushohoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <GuideHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              特定商取引法に基づく表記
            </h1>

            {/* 画面の幅が狭いときは縦に積み、広いときは2列。横にはみ出しません */}
            <dl className="mt-8 divide-y divide-slate-200 border-y border-slate-200 text-sm leading-7 text-slate-700 sm:text-base">
              {KOUMOKU.map(([koumoku, naiyou]) => (
                <div key={koumoku} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
                  <dt className="font-semibold text-slate-900">{koumoku}</dt>
                  <dd className="break-words">{naiyou}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-sm leading-7 text-slate-700 sm:text-base">
              {'本サービスのご利用条件は'}
              <Link href="/terms" className="font-medium text-emerald-700 underline hover:text-emerald-800">「利用規約」</Link>
              {'（第15条）に、情報の取扱いは'}
              <Link href="/privacy" className="font-medium text-emerald-700 underline hover:text-emerald-800">「プライバシーポリシー」</Link>
              {'（第15条）に定めています。'}
            </p>

            <p className="mt-8 text-sm leading-7 sm:text-base">
              <Link href="/retirement/pro" className="font-medium text-emerald-700 hover:text-emerald-800">
                退職金とiDeCoの受け取り方シミュレーションのページへ
              </Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
