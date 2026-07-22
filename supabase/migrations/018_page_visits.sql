-- ============================================================
-- Site-wide visitor counting for the admin "Visitor Analytics" chart.
--
-- Originally designed around an Upstash Redis instance whose Vercel env
-- vars turned out to be empty/non-functional — switched to Postgres,
-- reusing the same reliable infrastructure as everything else on this
-- site instead of depending on a second, unverified external service.
--
-- Two tables: a per-day total-pageview counter, and a per-day
-- (day, visitor_hash) dedup table for approximate unique visitors —
-- visitor_hash is a one-way SHA-256 of IP+User-Agent+day computed in
-- middleware.ts, so no PII is ever stored here and it can't be
-- correlated across days.
-- ============================================================

CREATE TABLE page_visit_totals (
  day    DATE PRIMARY KEY,
  total  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE page_visit_uniques (
  day           DATE NOT NULL,
  visitor_hash  TEXT NOT NULL,
  PRIMARY KEY (day, visitor_hash)
);

CREATE INDEX idx_page_visit_uniques_day ON page_visit_uniques(day);

CREATE OR REPLACE FUNCTION record_page_visit(visit_day DATE, visitor_hash TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO page_visit_totals (day, total) VALUES (visit_day, 1)
    ON CONFLICT (day) DO UPDATE SET total = page_visit_totals.total + 1;

  INSERT INTO page_visit_uniques (day, visitor_hash) VALUES (visit_day, visitor_hash)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION record_page_visit(DATE, TEXT) TO service_role;

ALTER TABLE page_visit_totals ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_visit_uniques ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access page_visit_totals" ON page_visit_totals
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access page_visit_uniques" ON page_visit_uniques
  FOR ALL USING (auth.role() = 'service_role');

GRANT ALL ON page_visit_totals TO service_role;
GRANT ALL ON page_visit_uniques TO service_role;
