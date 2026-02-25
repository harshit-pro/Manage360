-- =========================
-- ADD CONTACT FIELD TO LIBRARIES
-- =========================
-- Allows each library to store a contact phone/email for the profile page.

ALTER TABLE libraries
    ADD COLUMN IF NOT EXISTS contact VARCHAR(100);
