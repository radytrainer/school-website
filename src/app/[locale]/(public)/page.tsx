import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import HeroSection from "@/components/public/home/HeroSection";
import StatsSection from "@/components/public/home/StatsSection";
import NewsSection from "@/components/public/home/NewsSection";
import AchievementsSection from "@/components/public/home/AchievementsSection";
import { getCurrentStatistics, getHeroSlides, getPublishedAchievements, getPublishedNews } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const nameEn = process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "Kamrieng High School";
  const nameKm = process.env.NEXT_PUBLIC_SCHOOL_NAME_KM ?? "វិទ្យាល័យកំរៀង";

  const title =
    locale === "km"
      ? `${nameKm} | ខេត្តបាត់ដំបង`
      : `${nameEn} | Official Website — Kamrieng, Battambang, Cambodia`;

  const description =
    locale === "km"
      ? `${nameKm} គឺជាវិទ្យាល័យសាធារណៈមួយស្ថិតនៅស្រុកកំរៀង ខេត្តបាត់ដំបង។ ស្វែងយល់ពីព័ត៌មាន សមិទ្ធផលសិស្ស ឯកសារចុះឈ្មោះ និងច្រើនទៀត។`
      : `${nameEn} (${nameKm}) is a public high school in Kamrieng district, Battambang province, Cambodia. Explore school news, student achievements, admissions documents, and more on our official website.`;

  return {
    title: { absolute: title },
    description,
    keywords: [
      "Kamrieng High School",
      "Kamrieng",
      nameKm,
      "high school Battambang",
      "Battambang high school",
      "school in Kamrieng",
      "Kamrieng district Battambang",
      "Cambodia high school",
    ],
    alternates: {
      canonical: `/${locale}`,
      languages: { km: "/km", en: "/en" },
    },
    openGraph: {
      title,
      description,
      url: `/${locale}`,
    },
  };
}

export default async function HomePage() {
  const [heroSlides, stats, allNews, allAchievements] = await Promise.all([
    getHeroSlides(),
    getCurrentStatistics(),
    getPublishedNews(),
    getPublishedAchievements(),
  ]);
  const news = allNews.slice(0, 6);
  const achievements = allAchievements.slice(0, 6);

  return (
    <>
      <HeroSection slides={heroSlides} />
      <StatsSection stats={stats} />
      <NewsSection news={news} />
      <AchievementsSection achievements={achievements} />
    </>
  );
}
