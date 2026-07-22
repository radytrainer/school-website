import type { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase";
import { locales } from "@/i18n/config";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

// Without this, Next.js prerenders sitemap.xml once at build time and
// freezes it — new news articles added through the admin panel wouldn't
// appear until the next deploy. Regenerating hourly keeps it current.
export const revalidate = 3600;

// [route, changeFrequency, priority] — priority reflects how often each
// page's content actually changes and how central it is to the site,
// so crawlers spend their budget on the pages most worth re-checking.
const STATIC_ROUTES: [string, MetadataRoute.Sitemap[number]["changeFrequency"], number][] = [
  ["", "daily", 1.0],
  ["/news", "daily", 0.9],
  ["/achievements", "weekly", 0.8],
  ["/documents", "weekly", 0.8],
  ["/about", "monthly", 0.7],
  ["/governance", "monthly", 0.6],
  ["/contact", "monthly", 0.6],
  ["/donate", "monthly", 0.6],
  ["/operation", "monthly", 0.6],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient();

  const { data: news } = await supabase
    .from("news")
    .select("slug, updated_at")
    .eq("status", "published");

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.flatMap(([route, changeFrequency, priority]) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    }))
  );

  const newsEntries: MetadataRoute.Sitemap = (news ?? []).flatMap((n) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/news/${n.slug}`,
      lastModified: n.updated_at ? new Date(n.updated_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }))
  );

  return [...staticEntries, ...newsEntries];
}
