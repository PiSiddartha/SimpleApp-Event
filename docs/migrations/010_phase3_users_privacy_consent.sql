-- Phase 3: users privacy policy acceptance
-- Prerequisite: 001-009 applied. Idempotent.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'privacy_policy_version') THEN
    ALTER TABLE users ADD COLUMN privacy_policy_version VARCHAR(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'privacy_policy_accepted_at') THEN
    ALTER TABLE users ADD COLUMN privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;
