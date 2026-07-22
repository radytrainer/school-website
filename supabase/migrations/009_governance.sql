-- ============================================================
-- Governance page content: two admin-managed ordered lists
-- ("Structure & Management Systems" and "Learning Activities &
-- Student Growth") that were previously hardcoded in the page.
-- Safe to run any number of times.
-- ============================================================

DO $$ BEGIN
  CREATE TYPE governance_section AS ENUM ('structure', 'culture');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS governance_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section     governance_section NOT NULL,
  title_km    TEXT NOT NULL,
  title_en    TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT 'ClipboardCheck',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_by  UUID REFERENCES admin_users(id),
  updated_by  UUID REFERENCES admin_users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_governance_section ON governance_items (section, sort_order);
CREATE INDEX IF NOT EXISTS idx_governance_active ON governance_items (is_active) WHERE is_active = true;

DROP TRIGGER IF EXISTS trg_governance_items_updated_at ON governance_items;
CREATE TRIGGER trg_governance_items_updated_at BEFORE UPDATE ON governance_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE governance_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active governance_items" ON governance_items;
CREATE POLICY "Public can read active governance_items" ON governance_items
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access governance_items" ON governance_items;
CREATE POLICY "Service role full access governance_items" ON governance_items
  USING (auth.role() = 'service_role');

-- Belt-and-suspenders grants: this Supabase project has repeatedly hit
-- PostgREST "table not in schema cache" errors on newly created tables
-- until explicit grants were added, so add them up front this time.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE governance_items TO anon, authenticated, service_role;

-- Seed the original hardcoded content so the admin panel starts with real,
-- editable rows instead of an empty list.
INSERT INTO governance_items (section, title_km, title_en, icon, sort_order)
SELECT * FROM (VALUES
  ('structure'::governance_section, 'តេស្តស្តង់ដារ តាមលំនាំប្រឡងបាក់ឌុប', 'Standardized tests aligned with the national Baccalaureate exam format', 'ClipboardCheck', 1),
  ('structure', 'ផែនការសិក្សាសិស្ស ផែនការបង្រៀន និងផែនការកែលម្អសាលារៀន', 'Student learning plans, teaching plans, and school improvement plans', 'NotebookPen', 2),
  ('structure', 'គណៈកម្មការគ្រប់គ្រងថ្នាក់រៀន និងសាលារៀន', 'Classroom and school management committees', 'Users2', 3),
  ('structure', 'កិច្ចព្រមព្រៀងលទ្ធផលការងារប្រចាំឆ្នាំ', 'Annual work performance agreements', 'FileSignature', 4),
  ('structure', 'ក្រុមប្រឹក្សាសិស្ស', 'Student council', 'Vote', 5),
  ('structure', 'ប្រព័ន្ធតាមដានសិស្សប្រចាំខែ និងត្រីមាស', 'Monthly and quarterly student monitoring system', 'LineChart', 6),
  ('culture', 'សិស្សមានកាលវិភាគរៀន និងបំពេញកិច្ចការផ្សេងៗប្រចាំថ្ងៃ ក្នុងមួយសប្តាហ៍ៗ', 'Students follow a weekly class schedule and complete daily tasks', 'CalendarDays', 1),
  ('culture', 'សិស្សសិក្សាតាមរយៈ GEIP EdTech App មុនពេលរៀនជាមួយគ្នា', 'Students study through the GEIP EdTech App before learning together', 'Smartphone', 2),
  ('culture', 'សិស្សរៀនផ្ទាល់ជាមួយគ្នា', 'Students engage in direct peer-to-peer learning', 'Handshake', 3),
  ('culture', 'សិស្សហ្វឹកហាត់បង្ហាញសំណួរ លំហាត់ និងចំណេះដឹងថ្មីៗ', 'Students practice presenting questions, exercises, and new knowledge', 'MessageCircleQuestion', 4),
  ('culture', 'សិស្សរៀនជាគម្រោងស្រាវជ្រាវ ដើម្បីពង្រឹងការយល់ដឹងខ្លឹមសារមេរៀន', 'Students undertake research projects to deepen their understanding of lessons', 'FlaskConical', 5),
  ('culture', 'សិស្សផ្សព្វផ្សាយគម្រោងស្រាវជ្រាវ ដើម្បីអភិវឌ្ឍជំនាញ និងបទពិសោធន៍ជាក់ស្តែង', 'Students present research projects to build practical skills and experience', 'Presentation', 6)
) AS v(section, title_km, title_en, icon, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM governance_items);

NOTIFY pgrst, 'reload schema';
