import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { redirect } from 'next/navigation';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage() {
  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?next=/onboarding');
  }
  return <OnboardingClient userId={user.id} />;
}
