-- ============================================================
-- Atomic view-count increment for news articles.
--
-- news.view_count already existed and is already displayed on the
-- public article page, but nothing ever incremented it. Mirrors the
-- shape of the old increment_download_count() RPC (dropped in
-- 004_drop_gallery_downloads.sql) for the same reason: a single atomic
-- UPDATE avoids a read-then-write race between concurrent visitors.
-- ============================================================

CREATE OR REPLACE FUNCTION increment_news_view(news_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE news SET view_count = view_count + 1 WHERE id = news_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_news_view(UUID) TO anon, authenticated, service_role;
