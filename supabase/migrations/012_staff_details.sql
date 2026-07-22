-- ============================================================
-- Staff detail fields: clicking a teacher/leadership card on the
-- About page now opens a detail panel showing gender, educational
-- attainment, position, specialization, current teaching subject,
-- grade levels taught, and phone number. Adds the columns needed
-- to store that data (all nullable — existing rows are unaffected
-- and these are filled in per-person via the admin panel).
-- Safe to run any number of times.
-- ============================================================

-- Teachers: add position (administrative title, distinct from
-- department), specialization (degree major, distinct from the
-- subject currently taught), gender, and phone.
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female'));
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS position_km TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS position_en TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS specialization_km TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS specialization_en TEXT;

-- Leadership: bring it up to parity with teachers so vice
-- principals' cards can show the same detail fields (some vice
-- principals also teach a subject/grade).
ALTER TABLE leadership ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female'));
ALTER TABLE leadership ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE leadership ADD COLUMN IF NOT EXISTS qualification_km TEXT;
ALTER TABLE leadership ADD COLUMN IF NOT EXISTS qualification_en TEXT;
ALTER TABLE leadership ADD COLUMN IF NOT EXISTS specialization_km TEXT;
ALTER TABLE leadership ADD COLUMN IF NOT EXISTS specialization_en TEXT;
ALTER TABLE leadership ADD COLUMN IF NOT EXISTS subject_km TEXT;
ALTER TABLE leadership ADD COLUMN IF NOT EXISTS subject_en TEXT;
ALTER TABLE leadership ADD COLUMN IF NOT EXISTS grade_levels INTEGER[] NOT NULL DEFAULT '{}';

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE teachers TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE leadership TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
