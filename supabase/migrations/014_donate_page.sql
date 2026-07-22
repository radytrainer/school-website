-- ============================================================
-- Donate page: bank accounts and "why donate" use-case cards were
-- previously hardcoded directly in the page's source code, with
-- zero admin control. This makes both admin-managed.
--
-- NOTE: the seeded bank account numbers below are the SAME
-- placeholder values that were already hardcoded on the live site
-- ("000 123 456" / "001 987 654") — they are not real account
-- numbers. Replace them with the school's actual bank details via
-- the new /admin/donate panel before relying on this page for real
-- donations.
-- Safe to run any number of times.
-- ============================================================

CREATE TABLE IF NOT EXISTS bank_accounts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_name_km      TEXT NOT NULL,
  bank_name_en      TEXT NOT NULL,
  account_name_km   TEXT NOT NULL,
  account_name_en   TEXT NOT NULL,
  account_number    TEXT NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'USD / KHR',
  logo_color        TEXT NOT NULL DEFAULT '#00376f',
  sort_order        INTEGER NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_by        UUID REFERENCES admin_users(id),
  updated_by        UUID REFERENCES admin_users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donation_uses (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon              TEXT NOT NULL DEFAULT '💙',
  title_km          TEXT NOT NULL,
  title_en          TEXT NOT NULL,
  description_km    TEXT,
  description_en    TEXT,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_by        UUID REFERENCES admin_users(id),
  updated_by        UUID REFERENCES admin_users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_sort ON bank_accounts (sort_order);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON bank_accounts (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_donation_uses_sort ON donation_uses (sort_order);
CREATE INDEX IF NOT EXISTS idx_donation_uses_active ON donation_uses (is_active) WHERE is_active = true;

DROP TRIGGER IF EXISTS trg_bank_accounts_updated_at ON bank_accounts;
CREATE TRIGGER trg_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_donation_uses_updated_at ON donation_uses;
CREATE TRIGGER trg_donation_uses_updated_at BEFORE UPDATE ON donation_uses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_uses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active bank accounts" ON bank_accounts;
CREATE POLICY "Public can read active bank accounts" ON bank_accounts
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access bank accounts" ON bank_accounts;
CREATE POLICY "Service role full access bank accounts" ON bank_accounts
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Public can read active donation uses" ON donation_uses;
CREATE POLICY "Public can read active donation uses" ON donation_uses
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access donation uses" ON donation_uses;
CREATE POLICY "Service role full access donation uses" ON donation_uses
  USING (auth.role() = 'service_role');

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE bank_accounts TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE donation_uses TO anon, authenticated, service_role;

-- Seed with the same placeholder content already live on the page,
-- so the admin panel starts with editable rows instead of empty lists.
INSERT INTO bank_accounts (bank_name_km, bank_name_en, account_name_km, account_name_en, account_number, currency, logo_color, sort_order)
SELECT * FROM (VALUES
  ('ធនាគារ ABA', 'ABA Bank', 'វិទ្យាល័យកំរៀង', 'Kamrieng High School', '000 123 456', 'USD / KHR', '#0066cc', 1),
  ('ធនាគារ ACLEDA', 'ACLEDA Bank', 'វិទ្យាល័យកំរៀង', 'Kamrieng High School', '001 987 654', 'USD / KHR', '#e62020', 2)
) AS v(bank_name_km, bank_name_en, account_name_km, account_name_en, account_number, currency, logo_color, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM bank_accounts);

INSERT INTO donation_uses (icon, title_km, title_en, description_km, description_en, sort_order)
SELECT * FROM (VALUES
  ('📚', 'បណ្ណាល័យ និងសៀវភៅ', 'Library & Books',
   'ជួយយើងពង្រីកបណ្ណាល័យជាមួយសៀវភៅ និងសម្ភារៈសិក្សាទំនើប', 'Help us expand our library with modern textbooks and learning materials.', 1),
  ('💻', 'បច្ចេកវិទ្យា និងមន្ទីរពិសោធន៍', 'Technology & Labs',
   'គាំទ្រការធ្វើឱ្យប្រសើរឡើងនូវបន្ទប់កុំព្យូទ័រ និងមន្ទីរពិទ្យាសាស្ត្រ', 'Support the upgrade of computer labs and science facilities.', 2),
  ('🏆', 'អាហារូបករណ៍សិស្ស', 'Student Scholarships',
   'ផ្តល់អាហារូបករណ៍ដល់សិស្សមានទេព្យកោសល្យដែលខ្វះខាតហិរញ្ញវត្ថុ', 'Provide scholarships for talented students with financial need.', 3),
  ('🏫', 'ហេដ្ឋារចនាសម្ព័ន្ធសាលា', 'School Infrastructure',
   'ផ្តល់មូលនិធិសម្រាប់ការជួសជុលថ្នាក់រៀន និងការធ្វើឱ្យប្រសើរឡើងនូវបរិវេណ', 'Fund classroom renovations and campus improvements.', 4)
) AS v(icon, title_km, title_en, description_km, description_en, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM donation_uses);

NOTIFY pgrst, 'reload schema';

SELECT bank_name_en, account_number FROM bank_accounts ORDER BY sort_order;
SELECT title_en FROM donation_uses ORDER BY sort_order;
