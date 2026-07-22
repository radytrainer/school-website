import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatShortDate, getLocalizedText, truncate, resolveImageUrl } from "@/lib/utils";
import { Calendar, ArrowRight, Search, Images } from "lucide-react";
import { getPublishedNews, getNewsCategories } from "@/lib/queries";

async function getNewsData() {
  const [news, categories] = await Promise.all([
    getPublishedNews(),
    getNewsCategories(),
  ]);
  return { news, categories };
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("news");
  const description =
    locale === "km"
      ? "ព័ត៌មាន និងបច្ចុប្បន្នភាពថ្មីៗពីវិទ្យាល័យកំរៀង ខេត្តបាត់ដំបង។"
      : "Latest news and updates from Kamrieng High School, Battambang province, Cambodia.";
  return {
    title: t("title"),
    description,
    alternates: { canonical: `/${locale}/news`, languages: { km: "/km/news", en: "/en/news" } },
  };
}

interface NewsPageProps {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const locale = await getLocale();
  const km = locale === "km";
  const t = await getTranslations("news");
  const params = await searchParams;
  const categorySlug = params.category ?? "";
  const page = parseInt(params.page ?? "1");
  const pageSize = 9;

  const { news: allNews, categories } = await getNewsData();

  let filtered = allNews;
  if (categorySlug) {
    const cat = categories.find((c) => c.slug === categorySlug);
    if (cat) filtered = filtered.filter((n) => n.category_id === cat.id);
  }

  const count = filtered.length;
  const totalPages = Math.ceil(count / pageSize);
  const news = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen" style={{ background: "#f8f9ff" }}>
      {/* ── Hero ── */}
      <section
        className="pt-24 pb-16"
        style={{ background: "linear-gradient(135deg, #001f45 0%, #00376f 55%, #1e4e8c 100%)" }}
      >
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <p className="font-khmer text-2xl md:text-3xl mb-3" style={{ color: "#fdbc13" }}>
            ព័ត៌មានសាលារៀន
          </p>
          <h1 className={cn("text-4xl md:text-5xl font-bold text-white mb-5", km && "font-khmer")}>
            {t("title")}
          </h1>
          <p className={cn("text-base md:text-lg text-white/70 leading-relaxed", km && "font-khmer")}>
            {t("subtitle")}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-14">
        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <Link href={`/${locale}/news`}>
            <Badge
              variant={!categorySlug ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors py-1.5 px-4 rounded-full text-sm font-medium",
                !categorySlug ? "bg-school-blue-800 hover:bg-school-blue-900" : "hover:bg-school-blue-50 hover:text-school-blue-800"
              )}
            >
              {t("categories")} ({count ?? 0})
            </Badge>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/${locale}/news?category=${cat.slug}`}>
              <Badge
                variant={categorySlug === cat.slug ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors py-1.5 px-4 rounded-full text-sm font-medium",
                  categorySlug === cat.slug ? "bg-school-blue-800 hover:bg-school-blue-900" : "hover:bg-school-blue-50 hover:text-school-blue-800"
                )}
              >
                {getLocalizedText(cat.name_km, cat.name_en, locale)}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Grid */}
        {news.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className={cn(km && "font-khmer")}>{t("no_results")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {news.map((item) => {
              const title = getLocalizedText(item.title_km, item.title_en, locale);
              const excerpt = getLocalizedText(item.excerpt_km, item.excerpt_en, locale);
              const categoryName = item.category
                ? getLocalizedText(item.category.name_km, item.category.name_en, locale)
                : null;
              const extraPhotos = item.images?.length ?? 0;

              return (
                <article
                  key={item.id}
                  className="group bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{ boxShadow: "0px 4px 20px rgba(30,78,140,0.07)" }}
                >
                  <Link href={`/${locale}/news/${item.slug}`}>
                    <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                      {item.featured_image ? (
                        <Image
                          src={resolveImageUrl(item.featured_image)}
                          alt={title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 opacity-80"
                          style={{ background: "linear-gradient(135deg, #001f45 0%, #00376f 55%, #1e4e8c 100%)" }}
                        />
                      )}
                      {categoryName && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-school-blue-800 text-white">{categoryName}</Badge>
                        </div>
                      )}
                      {item.is_featured && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="warning">{t("featured")}</Badge>
                        </div>
                      )}
                      {extraPhotos > 0 && (
                        <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white bg-black/55 backdrop-blur-sm">
                          <Images className="w-3 h-3" />
                          {extraPhotos + 1}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatShortDate(item.publish_date ?? item.created_at, locale)}
                    </div>
                    <h2 className={cn("font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-school-blue-800 transition-colors", km && "font-khmer")}>
                      <Link href={`/${locale}/news/${item.slug}`}>{title}</Link>
                    </h2>
                    {excerpt && (
                      <p className={cn("text-sm text-gray-500 line-clamp-3 mb-4", km && "font-khmer")}>
                        {truncate(excerpt, 150)}
                      </p>
                    )}
                    <Link
                      href={`/${locale}/news/${item.slug}`}
                      className="inline-flex items-center text-sm font-medium text-school-blue-800 hover:gap-2 gap-1 transition-all"
                    >
                      {t("read_more")} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/${locale}/news?page=${p}${categorySlug ? `&category=${categorySlug}` : ""}`}
              >
                <Button
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  className={p === page ? "bg-school-blue-800" : ""}
                >
                  {p}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
