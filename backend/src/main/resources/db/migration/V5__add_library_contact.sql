-- =========================
-- ADD CONTACT FIELD TO LIBRARIES
-- =========================
-- Allows each library to store a contact phone/email for the profile page.
-- Note: V4 was an older migration (fix_students_text_columns) already in schema history.

ALTER TABLE libraries
    ADD COLUMN IF NOT EXISTS contact VARCHAR(100);
