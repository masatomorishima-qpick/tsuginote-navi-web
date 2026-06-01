/**
 * /digital/settings/upgrade
 *
 * 2026-05 改訂：/digital/settings/plan に統合されたため、このページは
 *   リダイレクト専用に変更。既存リンク（メール、ボタン等）の互換性を維持する。
 *
 * Stripe Checkout キャンセル時の戻り先（?canceled=1）として使われていた経緯があるが、
 * その文言表示も /plan 側で持つことになったため、ここはシンプルにリダイレクトのみ。
 */

import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ canceled?: string }>;
};

export default async function UpgradePage({ searchParams }: Props) {
  const { canceled } = await searchParams;
  // canceled パラメータは /plan 側で表示するために引き継ぐ
  if (canceled === '1') {
    redirect('/digital/settings/plan?canceled=1');
  }
  redirect('/digital/settings/plan');
}
