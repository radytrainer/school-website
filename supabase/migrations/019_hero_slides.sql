-- ============================================================
-- Hero slideshow — admin-manageable homepage carousel slides.
--
-- The `HeroSlide` type and the homepage `HeroSection` component were
-- already fully built to accept this shape (image_url, gradient
-- fallback, bilingual title/subtitle/CTA fields, sort_order, is_active)
-- but the homepage was only ever fed hardcoded mock data. This wires up
-- the real table so admins can manage it from /admin/hero-slides.
-- ============================================================

CREATE TABLE hero_slides (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_km           TEXT NOT NULL,
  title_en           TEXT NOT NULL,
  subtitle_km        TEXT,
  subtitle_en        TEXT,
  image_url          TEXT,
  gradient           TEXT NOT NULL DEFAULT 'linear-gradient(135deg, #061525 0%, #0c2d5e 55%, #092045 100%)',
  cta_primary_km     TEXT,
  cta_primary_en     TEXT,
  cta_secondary_km   TEXT,
  cta_secondary_en   TEXT,
  cta_primary_href   TEXT NOT NULL DEFAULT '/contact',
  cta_secondary_href TEXT NOT NULL DEFAULT '/about',
  sort_order         INTEGER NOT NULL DEFAULT 0,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  created_by         UUID REFERENCES admin_users(id),
  updated_by         UUID REFERENCES admin_users(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hero_slides_active ON hero_slides(is_active);
CREATE INDEX idx_hero_slides_sort ON hero_slides(sort_order);

CREATE TRIGGER trg_hero_slides_updated_at
  BEFORE UPDATE ON hero_slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active hero slides" ON hero_slides
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role full access hero_slides" ON hero_slides
  FOR ALL USING (auth.role() = 'service_role');

GRANT SELECT ON hero_slides TO anon, authenticated;
GRANT ALL ON hero_slides TO service_role;
