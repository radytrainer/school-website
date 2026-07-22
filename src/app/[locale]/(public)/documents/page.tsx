import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { cn, formatShortDate, getLocalizedText, getFileExtension } from "@/lib/utils";
import {
  Download, Search, Calendar, FolderOpen,
  FileText, FileSpreadsheet, File as FileIcon,
  FileBarChart, Award, ClipboardList, ShieldCheck, Folder,
  type LucideIcon,
} from "lucide-react";
import { getPublishedDocuments } from "@/lib/queries";
import type { DocumentCategory } from "@/types";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("documents");
  const description =
    locale === "km"
      ? "ទាញយកឯកសារផ្លូវការ របាយការណ៍ លទ្ធផលប្រឡង និងទម្រង់បែបបទរបស់វិទ្យាល័យកំរៀង ខេត្តបាត់ដំបង។"
      : "Download official documents, reports, exam results, and forms from Kamrieng High School, Battambang, Cambodia.";
  return {
    title: t("title"),
    description,
    alternates: { canonical: `/${locale}/documents`, languages: { km: "/km/documents", en: "/en/documents" } },
  };
}

const CATEGORIES: DocumentCategory[] = ["report", "result", "form", "policy", "other"];

const CATEGORY_ICONS: Record<DocumentCategory, LucideIcon> = {
  report: FileBarChart,
  result: Award,
  form: ClipboardList,
  policy: ShieldCheck,
  other: Folder,
};

const CATEGORY_BADGE_STYLES: Record<DocumentCategory, string> = {
  report: "bg-blue-50 text-blue-700",
  result: "bg-purple-50 text-purple-700",
  form: "bg-green-50 text-green-700",
  policy: "bg-orange-50 text-orange-700",
  other: "bg-gray-100 text-gray-600",
};

function getFileTypeStyle(fileName: string): { icon: LucideIcon; bg: string; color: string; label: string } {
  const ext = getFileExtension(fileName);
  if (ext === "pdf") return { icon: FileText, bg: "bg-red-50", color: "text-red-500", label: "PDF" };
  if (ext === "doc" || ext === "docx") return { icon: FileText, bg: "bg-blue-50", color: "text-blue-600", label: "DOC" };
  if (ext === "xls" || ext === "xlsx") return { icon: FileSpreadsheet, bg: "bg-green-50", color: "text-green-600", label: "XLS" };
  return { icon: FileIcon, bg: "bg-gray-100", color: "text-gray-400", label: ext ? ext.toUpperCase() : "FILE" };
}

interface DocumentsPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const locale = await getLocale();
  const km = locale === "km";
  const t = await getTranslations("documents");
  const params = await searchParams;
  const selectedCategory = params.category ?? "";
  const query = (params.q ?? "").trim();

  let documents = await getPublishedDocuments();
  if (selectedCategory) {
    documents = documents.filter((d) => d.category === selectedCategory);
  }
  if (query) {
    const q = query.toLowerCase();
    documents = documents.filter((d) => {
      const title = getLocalizedText(d.title_km, d.title_en, locale);
      const desc = getLocalizedText(d.description_km, d.description_en, locale);
      return title.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
    });
  }

  const hasFilters = Boolean(selectedCategory || query);

  return (
    <div className="min-h-screen" style={{ background: "#f8f9ff" }}>
      {/* Hero */}
      <section
        className="pt-24 pb-14"
        style={{ background: "linear-gradient(135deg, #001f45 0%, #00376f 55%, #1e4e8c 100%)" }}
      >
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <p className="font-khmer text-2xl md:text-3xl mb-3" style={{ color: "#fdbc13" }}>
            ឯកសារសាលារៀន
          </p>
          <h1 className={cn("text-4xl md:text-5xl font-bold text-white mb-4", km && "font-khmer")}>
            {t("title")}
          </h1>
          <p className={cn("text-base md:text-lg text-white/70 leading-relaxed mb-8", km && "font-khmer")}>
            {t("subtitle")}
          </p>

          {/* Search */}
          <form action={`/${locale}/documents`} className="flex gap-2 max-w-lg mx-auto">
            {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder={t("search_placeholder")}
                className={cn(
                  "w-full h-12 pl-11 pr-4 rounded-full bg-white text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-school-gold-500",
                  km && "font-khmer"
                )}
              />
            </div>
            <button
              type="submit"
              aria-label={t("search")}
              className="shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-white transition-colors hover:opacity-90 cursor-pointer"
              style={{ background: "#fdbc13" }}
            >
              <Search className="w-5 h-5" style={{ color: "#0d1b38" }} />
            </button>
          </form>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <a href={`/${locale}/documents`}>
            <span
              className={cn(
                "cursor-pointer inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                !selectedCategory
                  ? "bg-school-blue-800 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-school-blue-800 hover:text-school-blue-800"
              )}
            >
              {t("all")}
            </span>
          </a>
          {CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICONS[c];
            const active = selectedCategory === c;
            return (
              <a key={c} href={`/${locale}/documents?category=${c}`}>
                <span
                  className={cn(
                    "cursor-pointer inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                    active
                      ? "bg-school-blue-800 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-school-blue-800 hover:text-school-blue-800"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t(c)}
                </span>
              </a>
            );
          })}
        </div>

        {/* Grid */}
        {documents.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className={cn("mb-3", km && "font-khmer")}>{t("no_results")}</p>
            {hasFilters && (
              <a
                href={`/${locale}/documents`}
                className="text-sm font-medium text-school-blue-800 hover:underline cursor-pointer"
              >
                {t("clear_filters")}
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {documents.map((item) => {
              const title = getLocalizedText(item.title_km, item.title_en, locale);
              const desc = getLocalizedText(item.description_km, item.description_en, locale);
              const fileStyle = getFileTypeStyle(item.file_name);
              const FileTypeIcon = fileStyle.icon;

              return (
                <article
                  key={item.id}
                  className="group bg-white rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{ boxShadow: "0px 4px 20px rgba(30,78,140,0.07)" }}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn("w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 gap-0.5", fileStyle.bg)}>
                      <FileTypeIcon className={cn("w-6 h-6", fileStyle.color)} />
                      <span className={cn("text-[9px] font-bold tracking-wide", fileStyle.color)}>{fileStyle.label}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={cn("inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2", CATEGORY_BADGE_STYLES[item.category])}>
                        {t(item.category)}
                      </span>
                      <h3
                        className={cn(
                          "font-semibold text-gray-900 leading-snug mb-1 line-clamp-2 group-hover:text-school-blue-800 transition-colors",
                          km && "font-khmer"
                        )}
                      >
                        {title}
                      </h3>
                      {desc && (
                        <p className={cn("text-xs text-gray-500 line-clamp-2", km && "font-khmer")}>
                          {desc}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {t("uploaded")} {formatShortDate(item.created_at, locale)}
                    </div>
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("download")}
                      title={t("download")}
                      className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-school-gold-500 focus-visible:ring-offset-2 cursor-pointer"
                      style={{ background: "#fdbc13" }}
                    >
                      <Download className="w-4 h-4" style={{ color: "#0d1b38" }} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
