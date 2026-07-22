-- ============================================================
-- News photo gallery: lets an article carry multiple extra photos
-- beyond its single featured_image, matching the same images[]
-- pattern already used by the activities table.
-- Safe to run any number of times.
-- ============================================================

ALTER TABLE news ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE news TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'news' AND column_name = 'images';
