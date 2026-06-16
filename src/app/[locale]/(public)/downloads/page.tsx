import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLocalizedText, formatFileSize } from "@/lib/utils";
import { Download as DownloadIcon, FileText, Shield, Calendar, File } from "lucide-react";
import { mockDownloads, mockDownloadCategories } from "@/lib/mock-data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("downloads");
  return { title: t("title") };
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "file-text": <FileText className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  calendar: <Calendar className="w-5 h-5" />,
  file: <File className="w-5 h-5" />,
};

interface DownloadsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function DownloadsPage({ searchParams }: DownloadsPageProps) {
  const locale = await getLocale();
  const t = await getTranslations("downloads");
  const params = await searchParams;
  const selectedCatSlug = params.category ?? "";

  const categories = mockDownloadCategories;
  let downloads = mockDownloads.filter((d) => d.status === "published");

  if (selectedCatSlug) {
    const cat = categories.find((c) => c.slug === selectedCatSlug);
    if (cat) downloads = downloads.filter((d) => d.category_id === cat.id);
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
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href={`/${locale}/downloads`}>
            <Badge
              variant={!selectedCatSlug ? "default" : "outline"}
              className="cursor-pointer py-1.5 px-3 text-sm"
            >
              {locale === "km" ? "ទាំងអស់" : "All"}
            </Badge>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/${locale}/downloads?category=${cat.slug}`}>
              <Badge
                variant={selectedCatSlug === cat.slug ? "default" : "outline"}
                className="cursor-pointer py-1.5 px-3 text-sm flex items-center gap-1.5"
              >
                {CATEGORY_ICONS[cat.icon] ?? <File className="w-3.5 h-3.5" />}
                {getLocalizedText(cat.name_km, cat.name_en, locale)}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Downloads list */}
        <div className="space-y-3 max-w-3xl">
          {downloads.map((item) => {
            const title = getLocalizedText(item.title_km, item.title_en, locale);
            const desc = getLocalizedText(item.description_km, item.description_en, locale);
            const catName = item.category
              ? getLocalizedText(item.category.name_km, item.category.name_en, locale)
              : null;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-school-blue-50 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-school-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-gray-900 text-sm ${locale === "km" ? "font-khmer" : ""}`}>
                    {title}
                  </h3>
                  {desc && (
                    <p className={`text-xs text-gray-500 line-clamp-1 mt-0.5 ${locale === "km" ? "font-khmer" : ""}`}>
                      {desc}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    {catName && (
                      <span className="text-xs text-school-blue-600 bg-school-blue-50 px-2 py-0.5 rounded-full">
                        {catName}
                      </span>
                    )}
                    {item.file_size && (
                      <span className="text-xs text-gray-400">
                        {formatFileSize(item.file_size)}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {t("count")}: {item.download_count}
                    </span>
                  </div>
                </div>
                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={item.file_name}
                  className="shrink-0"
                >
                  <Button size="sm" className="bg-school-blue-800 hover:bg-school-blue-900">
                    <DownloadIcon className="w-3.5 h-3.5 mr-1.5" />
                    {t("download")}
                  </Button>
                </a>
              </div>
            );
          })}

          {downloads.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <File className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p>{locale === "km" ? "មិនមានឯកសារ" : "No documents available"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
