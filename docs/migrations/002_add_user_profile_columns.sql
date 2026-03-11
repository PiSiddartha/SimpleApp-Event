-- Migration: add user profile columns (student / professional)
-- Run once on existing DB. Safe to re-run (idempotent).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'user_type') THEN
    ALTER TABLE users ADD COLUMN user_type VARCHAR(20) CHECK (user_type IN ('student', 'professional'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'university') THEN
    ALTER TABLE users ADD COLUMN university VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'course') THEN
    ALTER TABLE users ADD COLUMN course VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'year_of_study') THEN
    ALTER TABLE users ADD COLUMN year_of_study VARCHAR(20);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'city') THEN
    ALTER TABLE users ADD COLUMN city VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'state') THEN
    ALTER TABLE users ADD COLUMN state VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'designation') THEN
    ALTER TABLE users ADD COLUMN designation VARCHAR(255);
  END IF;
  -- company already exists on users
END $$;
