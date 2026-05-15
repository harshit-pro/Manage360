-- Flyway migration: add templates_json column to libraries
-- Add a nullable TEXT column templates_json to the libraries table

ALTER TABLE IF EXISTS libraries
  ADD COLUMN IF NOT EXISTS templates_json TEXT;

-- No default to preserve existing behaviour; nullable by default.

