import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import SchoolReportView from "@/components/public/operation/SchoolReportView";
import { getReportSections } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const title = locale === "km" ? "របាយការណ៍សាលា" : "School Operations Report";
  const description =
    locale === "km"
      ? "របាយការណ៍ប្រតិបត្តិការសាលានៃវិទ្យាល័យកំរៀង ខេត្តបាត់ដំបង — ស្ថិតិ បុគ្គលិក ថវិកា និងលទ្ធផលសិក្សា។"
      : "School Operations Report for Kamrieng High School, Battambang province, Cambodia — statistics, staffing, budget, and academic results.";
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/operation`, languages: { km: "/km/operation", en: "/en/operation" } },
  };
}

export default async function OperationPage() {
  const locale = await getLocale();
  const { sections, meta } = await getReportSections();
  return <SchoolReportView locale={locale} sections={sections} meta={meta} />;
}
