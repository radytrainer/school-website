-- ============================================================
-- Staff date of birth: stored for admin/HR records only. Not
-- rendered on the public staff detail modal (privacy — showing
-- exact birthdates for identifiable, real, named staff publicly
-- was a deliberate call not to make without being asked).
-- Safe to run any number of times.
-- ============================================================

ALTER TABLE teachers ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE leadership ADD COLUMN IF NOT EXISTS date_of_birth DATE;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE teachers TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE leadership TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
