-- ============================================================
-- Documents — downloadable school documents (reports, exam
-- results, forms, policies) managed from /admin/documents.
--
-- Files are referenced by URL (pasted by an admin, e.g. a Google
-- Drive link) rather than uploaded to Supabase Storage, matching
-- how every other admin form on this site handles files/images
-- today. See 004_drop_gallery_downloads.sql for the previous
-- `downloads` table + `documents` storage bucket this replaces.
-- ============================================================

CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_km        TEXT NOT NULL,
  title_en        TEXT NOT NULL,
  description_km  TEXT,
  description_en  TEXT,
  category        TEXT NOT NULL DEFAULT 'other'
                    CHECK (category IN ('report','result','form','policy','other')),
  file_url        TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID REFERENCES admin_users(id),
  updated_by      UUID REFERENCES admin_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_active ON documents(is_active);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_sort ON documents(sort_order);

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active documents" ON documents
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role full access documents" ON documents
  FOR ALL USING (auth.role() = 'service_role');

GRANT SELECT ON documents TO anon, authenticated;
GRANT ALL ON documents TO service_role;
