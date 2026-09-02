/**
 * app/retirement/pro/kekka/page.tsx — 鍵つきの道の頁（B-3・senjutsu_20260902s.md 4番オ・5番）
 *
 * ★★文は戦術Coworkが `senjutsu_20260902s.md` 5番で出した字です。1文字も変えていません。
 *   変えたいときは、消す前に戦術Coworkへ投げてください。
 *
 * ★4つの姿（①②③の字は B-3 の戦術の字のまま。④は A-2a で親に差し替え）
 *   ① Cookie が無い（リンクから来ていない）
 *   ② 見つからない（表に無い）
 *   ③ 期限が切れている
 *   ④ 通る（★A-2a で、置きの1画面から**有料版の親 `PaidApp`（画面7 → 口 → 画面8 → 画面13）を描く頁**になりました）
 *
 * ★決め
 *   ・見た目は B-1a（tokushoho）と同じ骨（`GuideHeader`／max-w-4xl の白い箱／`SiteFooter`）。layout は足しません
 *   ・★`track()` を呼びません（A-2 で決め直します）
 *   ・★表から引くのは `id, expires_at, inputs, kekka`（A-2a・senjutsu_20260902ad.md 1-1）。★`email`・`pass_key` は引きません
 *     ★`kekka` を引く本は、この頁と保存の口だけ（363番）。★`inputs`・`kekka` は親に渡し、形は親が確かめます
 *   ・★①②③④のどれにも「鍵」「key」「Cookie」「エラー」の字を出しません
 *   ・★どれにも、利用者を下げる字を出しません
 *   ・★`dynamic = 'force-dynamic'` を明示します（★別の方の結果が配られることだけは、起こしてはいけません）
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import { SITE_URL } from '@/components/loan/LoanArticle';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { kigenNoJi, hidukeNoJi } from '@/lib/retirement/pro/hyouji';
import { tokyoYear } from '@/lib/retirement/pro/now';
import { COOKIE_NA } from '@/lib/retirement/pro/cookie';
import PaidApp from '@/components/retirement/pro/PaidApp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PRO_PATH = '/retirement/pro';

export const metadata: Metadata = {
  title: '計算結果 | つぎの手ナビ',
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}${PRO_PATH}` },
};

type Sugata =
  | { kind: 'nashi' }
  | { kind: 'mitsukaranai' }
  | { kind: 'kigen'; kigen: Date }
  | { kind: 'tooru'; kigen: Date; inputs: unknown; kekka: unknown };

async function sugataWoKimeru(): Promise<Sugata> {
  const c = await cookies();
  const kagi = c.get(COOKIE_NA)?.value;
  if (!kagi) return { kind: 'nashi' };

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('retirement_pro_passes')
    .select('id, expires_at, inputs, kekka')
    .eq('pass_key', kagi)
    .maybeSingle();

  if (error) {
    // ★引けなかったとき。★利用者には②を出します（「無い」とは言わず、もう一度お試しいただく形）
    console.error('[pro/kekka] 表を引けませんでした', { code: error.code ?? null });
    return { kind: 'mitsukaranai' };
  }
  if (!data) return { kind: 'mitsukaranai' };

  const kigen = new Date(data.expires_at as string);
  if (!Number.isFinite(kigen.getTime())) {
    console.error('[pro/kekka] 期限を日付にできませんでした');
    return { kind: 'mitsukaranai' };
  }
  if (kigen.getTime() <= Date.now()) return { kind: 'kigen', kigen };
  return { kind: 'tooru', kigen, inputs: data.inputs ?? null, kekka: data.kekka ?? null };
}

const H1 = 'text-[24px] font-bold leading-tight text-slate-900 sm:text-[28px]';
const P = 'mt-6 text-base leading-relaxed text-slate-800';

export default async function KekkaPage() {
  const s = await sugataWoKimeru();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <GuideHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          {s.kind === 'nashi' && (
            <>
              <h1 className={H1}>メールのリンクからお開きください</h1>
              <p className={P}>
                このページは、ご購入のときにお送りしたメールのリンクから開いていただけます。
              </p>
              <p className={P}>
                メールが見つからないときは、info@blueadventures.jp までご連絡ください。
                <br />
                ご購入のときにご入力いただいたメールアドレスをお知らせいただければ、お調べします。
              </p>
            </>
          )}

          {s.kind === 'mitsukaranai' && (
            <>
              <h1 className={H1}>このリンクからは開けませんでした</h1>
              <p className={P}>お手元のリンクから、計算結果を開くことができませんでした。</p>
              <p className={P}>
                メールに書かれているリンクを、もう一度お試しください。
                <br />
                リンクを写して貼り付けた場合は、途中で切れていることがあります。
              </p>
              <p className={P}>
                それでも開けないときは、info@blueadventures.jp までご連絡ください。
              </p>
            </>
          )}

          {s.kind === 'kigen' && (
            <>
              <h1 className={H1}>ご利用いただける期間が終了しました</h1>
              <p className={P}>
                ご利用いただける期間（ご購入から1年間）は、{hidukeNoJi(s.kigen)} に終了しました。
                <br />
                このリンクからは、計算結果をご覧いただけません。
              </p>
              <p className={P}>もう一度ご利用になる場合は、あらためてお求めください。</p>
              <p className="mt-8">
                <Link
                  href={PRO_PATH}
                  className="font-medium text-emerald-700 hover:text-emerald-800"
                >
                  退職金とiDeCoの受け取り方シミュレーションのページへ
                </Link>
              </p>
              <p className={P}>ご不明な点は、info@blueadventures.jp までご連絡ください。</p>
            </>
          )}

          {s.kind === 'tooru' && (
            // ★「現在の年」は、この頁が `tokyoYear(new Date())` で作って渡します（既定値を作らない・§4-4-2）
            <PaidApp
              genzaiNen={tokyoYear(new Date())}
              kigen={kigenNoJi(s.kigen)}
              inputs={s.inputs}
              kekka={s.kekka}
            />
          )}

          <div className="h-16" aria-hidden="true" />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
