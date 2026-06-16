import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getLocalizedText } from "@/lib/utils";
import { ImageIcon } from "lucide-react";
import { mockGallery } from "@/lib/mock-data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("gallery");
  return { title: t("title") };
}

const CATEGORY_LABELS: Record<string, { km: string; en: string }> = {
  events: { km: "ព្រឹត្តិការណ៍", en: "Events" },
  sports: { km: "កីឡា", en: "Sports" },
  academic: { km: "ការសិក្សា", en: "Academic" },
  cultural: { km: "វប្បធម៌", en: "Cultural" },
  community: { km: "សហគមន៍", en: "Community" },
};

interface GalleryPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const locale = await getLocale();
  const t = await getTranslations("gallery");
  const params = await searchParams;
  const selectedCat = params.category ?? "";

  let items = mockGallery.filter((g) => g.status === "published");
  if (selectedCat) {
    items = items.filter((g) => g.category === selectedCat);
  }

  const uniqueCategories = [...new Set(mockGallery.map((g) => g.category).filter(Boolean))] as string[];

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
          <a href={`/${locale}/gallery`}>
            <span
              className={`inline-block cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                !selectedCat
                  ? "bg-school-blue-800 text-white border-school-blue-800"
                  : "border-gray-300 text-gray-600 hover:border-school-blue-800 hover:text-school-blue-800"
              }`}
            >
              {locale === "km" ? "ទាំងអស់" : "All"}
            </span>
          </a>
          {uniqueCategories.map((cat) => {
            const label = CATEGORY_LABELS[cat];
            return (
              <a key={cat} href={`/${locale}/gallery?category=${cat}`}>
                <span
                  className={`inline-block cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selectedCat === cat
                      ? "bg-school-blue-800 text-white border-school-blue-800"
                      : "border-gray-300 text-gray-600 hover:border-school-blue-800 hover:text-school-blue-800"
                  }`}
                >
                  {label ? (locale === "km" ? label.km : label.en) : cat}
                </span>
              </a>
            );
          })}
        </div>

        {/* Masonry-style grid */}
        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p>{locale === "km" ? "មិនមានរូបភាព" : "No photos available"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item, i) => {
              const title = getLocalizedText(item.title_km, item.title_en, locale);
              const caption = getLocalizedText(item.caption_km, item.caption_en, locale);
              const catLabel = item.category ? CATEGORY_LABELS[item.category] : null;

              return (
                <div
                  key={item.id}
                  className={`group relative overflow-hidden rounded-xl bg-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 ${
                    i % 7 === 0 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                >
                  {/* Placeholder gradient since no real images */}
                  <div
                    className={`w-full aspect-square flex items-center justify-center ${
                      i % 7 === 0 ? "md:aspect-auto md:h-full md:min-h-[300px]" : ""
                    }`}
                    style={{
                      background: `linear-gradient(135deg, hsl(${(i * 47) % 360}, 60%, 75%), hsl(${(i * 47 + 60) % 360}, 50%, 60%))`,
                    }}
                  >
                    <ImageIcon className="w-10 h-10 text-white/50" />
                  </div>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex flex-col justify-end p-3">
                    <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      {catLabel && (
                        <span className="text-xs text-white/80 mb-1 block">
                          {locale === "km" ? catLabel.km : catLabel.en}
                        </span>
                      )}
                      {title && (
                        <p className={`text-white text-sm font-semibold leading-tight ${locale === "km" ? "font-khmer" : ""}`}>
                          {title}
                        </p>
                      )}
                      {caption && (
                        <p className={`text-white/80 text-xs mt-1 line-clamp-2 ${locale === "km" ? "font-khmer" : ""}`}>
                          {caption}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.is_featured && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-school-gold-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        ★
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
