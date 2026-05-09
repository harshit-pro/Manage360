-- Flyway migration: add total_fees_due column to students
-- This migration adds the missing column expected by the Student entity.
-- It sets a DEFAULT of 0 and marks the column NOT NULL so existing rows are populated.

ALTER TABLE IF EXISTS students
    ADD COLUMN IF NOT EXISTS total_fees_due integer NOT NULL DEFAULT 0;

-- Ensure an index if needed (optional). Uncomment if you want a dedicated index.
-- CREATE INDEX IF NOT EXISTS idx_students_total_fees_due ON students(total_fees_due);

