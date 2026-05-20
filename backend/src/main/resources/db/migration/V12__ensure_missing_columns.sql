-- Flyway migration: ensure missing columns exist (idempotent)
-- Adds columns that some environments may be missing due to earlier skipped migrations.
-- Safe to run multiple times.

ALTER TABLE IF EXISTS students
  ADD COLUMN IF NOT EXISTS total_fees_due integer NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS libraries
  ADD COLUMN IF NOT EXISTS templates_json TEXT;

-- In case seasonal_fees was added later and tests reference it
ALTER TABLE IF EXISTS students
  ADD COLUMN IF NOT EXISTS seasonal_fees integer NOT NULL DEFAULT 0;

-- Ensure jsonb alias columns exist (no-op if column already present)
-- (No further action required here)

