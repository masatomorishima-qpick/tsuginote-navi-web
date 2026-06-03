ALTER TABLE digital_user_profiles
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz DEFAULT NULL;
COMMENT ON COLUMN digital_user_profiles.onboarding_completed_at
IS '初回オンボーディング完了日時。NULLの場合は未完了。';
