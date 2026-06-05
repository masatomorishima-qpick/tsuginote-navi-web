import { getDigitalSession } from '@/lib/supabase/digitalServer';
import { redirect } from 'next/navigation';
import { listAssets } from '@/lib/digital/assets';
import AssetsListClient from './AssetsListClient';

export const dynamic = 'force-dynamic';

export default async function AssetsListPage() {
  const { supabase, user } = await getDigitalSession();
  if (!user) redirect('/login?next=/digital/assets');
  const assets = await listAssets(supabase, user.id);
  return <AssetsListClient assets={assets} />;
}
