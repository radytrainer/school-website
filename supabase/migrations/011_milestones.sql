-- ============================================================
-- About page "Key Milestones" timeline: previously hardcoded in
-- the page's source code, now an admin-managed ordered list.
-- Safe to run any number of times.
-- ============================================================

CREATE TABLE IF NOT EXISTS milestones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year            TEXT NOT NULL,
  title_km        TEXT NOT NULL,
  title_en        TEXT NOT NULL,
  description_km  TEXT,
  description_en  TEXT,
  color           TEXT NOT NULL DEFAULT '#00376f',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID REFERENCES admin_users(id),
  updated_by      UUID REFERENCES admin_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestones_sort ON milestones (sort_order);
CREATE INDEX IF NOT EXISTS idx_milestones_active ON milestones (is_active) WHERE is_active = true;

DROP TRIGGER IF EXISTS trg_milestones_updated_at ON milestones;
CREATE TRIGGER trg_milestones_updated_at BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active milestones" ON milestones;
CREATE POLICY "Public can read active milestones" ON milestones
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access milestones" ON milestones;
CREATE POLICY "Service role full access milestones" ON milestones
  USING (auth.role() = 'service_role');

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE milestones TO anon, authenticated, service_role;

-- Seed with the school's real milestones so the admin panel starts
-- with real, editable rows.
INSERT INTO milestones (year, title_km, title_en, description_km, description_en, color, sort_order)
SELECT * FROM (VALUES
  ('2000', 'ការបង្កើតសាលា', 'School Founded',
   'វិទ្យាល័យកំរៀង ត្រូវបានបង្កើតឡើង ក្រោមគំនិតផ្តួចផ្តើមរបស់អភិបាលស្រុកកំរៀង និងការិយាល័យអប់រំស្រុក ព្រមទាំងអាជ្ញាធរដែនដី ដើម្បីនាំមកនូវការអប់រំមធ្យមសិក្សាដល់សហគមន៍ជនបទនេះ។',
   'Kamrieng High School was founded through the initiative of the Kamrieng district governor and district education office, together with local authorities, to bring secondary education to this rural community.',
   '#c0392b', 1),
  ('2022', 'ទទួលស្គាល់ជា "សាលាល្អ"', 'Recognized as a "Best School"',
   'ក្រសួងអប់រំ យុវជន និងកីឡា បានទទួលស្គាល់វិទ្យាល័យកំរៀងជា "សាលាល្អ" ជាផ្លូវការ។',
   'The Ministry of Education, Youth and Sport formally recognized Kamrieng High School as a "Best School" (សាលាល្អ).',
   '#00376f', 2),
  ('2024–2025', 'ការកើនឡើងចំនួនសិស្ស', 'Growing Enrollment',
   'សាលាបច្ចុប្បន្នមានសិស្សចំនួន ២,១២៦ នាក់ ក្នុង ៤២ ថ្នាក់រៀន ចាប់ពីថ្នាក់ទី៧ដល់ទី១២ ដោយមានគ្រូបង្រៀនចំនួន ៥១ នាក់។',
   'The school now serves 2,126 students across 42 classes, Grade 7 through 12, guided by 51 teaching staff.',
   '#00376f', 3)
) AS v(year, title_km, title_en, description_km, description_en, color, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM milestones);

NOTIFY pgrst, 'reload schema';

-- Verify
SELECT year, title_en, sort_order FROM milestones ORDER BY sort_order;
