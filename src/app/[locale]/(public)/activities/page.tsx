import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { getLocalizedText, formatShortDate } from "@/lib/utils";
import { Calendar, MapPin } from "lucide-react";
import { mockActivities, mockActivityCategories } from "@/lib/mock-data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("activities");
  return { title: t("title") };
}

interface ActivitiesPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ActivitiesPage({ searchParams }: ActivitiesPageProps) {
  const locale = await getLocale();
  const t = await getTranslations("activities");
  const params = await searchParams;
  const selectedCatSlug = params.category ?? "";

  const categories = mockActivityCategories;
  let activities = mockActivities.filter((a) => a.status === "published");

  if (selectedCatSlug) {
    const cat = categories.find((c) => c.slug === selectedCatSlug);
    if (cat) activities = activities.filter((a) => a.category_id === cat.id);
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <div className="gradient-school text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className={`text-4xl font-bold mb-3 ${locale === "km" ? "font-khmer" : ""}`}>
            {t("title")}
          </h1>
          <p className={`text-school-blue-100 ${locale === "km" ? "font-khmer" : ""}`}>
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href={`/${locale}/activities`}>
            <Badge
              variant={!selectedCatSlug ? "default" : "outline"}
              className="cursor-pointer py-1.5 px-3 text-sm"
            >
              {t("all_categories")}
            </Badge>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/${locale}/activities?category=${cat.slug}`}>
              <Badge
                variant={selectedCatSlug === cat.slug ? "default" : "outline"}
                className="cursor-pointer py-1.5 px-3 text-sm"
                style={selectedCatSlug === cat.slug ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
              >
                {getLocalizedText(cat.name_km, cat.name_en, locale)}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Grid */}
        {activities.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className={locale === "km" ? "font-khmer" : ""}>{t("no_activities")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((item) => {
              const title = getLocalizedText(item.title_km, item.title_en, locale);
              const desc = getLocalizedText(item.description_km, item.description_en, locale);
              const catName = item.category
                ? getLocalizedText(item.category.name_km, item.category.name_en, locale)
                : null;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Color band */}
                  <div
                    className="h-2"
                    style={{ backgroundColor: item.category?.color ?? "#1e40af" }}
                  />
                  <div className="p-6">
                    {catName && (
                      <span
                        className="inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-3 text-white"
                        style={{ backgroundColor: item.category?.color ?? "#1e40af" }}
                      >
                        {catName}
                      </span>
                    )}
                    <h2
                      className={`font-bold text-gray-900 text-lg mb-2 leading-snug ${locale === "km" ? "font-khmer" : ""}`}
                    >
                      {title}
                    </h2>
                    {desc && (
                      <p
                        className={`text-sm text-gray-500 line-clamp-3 mb-4 ${locale === "km" ? "font-khmer" : ""}`}
                      >
                        {desc}
                      </p>
                    )}
                    <div className="flex flex-col gap-1.5 text-xs text-gray-400">
                      {item.activity_date && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          {formatShortDate(item.activity_date, locale)}
                        </span>
                      )}
                      {item.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          {item.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
