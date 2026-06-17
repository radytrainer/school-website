import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import HeroSection from "@/components/public/home/HeroSection";
import StatsSection from "@/components/public/home/StatsSection";
import NewsSection from "@/components/public/home/NewsSection";
import AchievementsSection from "@/components/public/home/AchievementsSection";
import NoticeBoardSection from "@/components/public/home/NoticeBoardSection";
import {
  mockStats,
  mockNews,
  mockAchievements,
  mockNotices,
  mockHeroSlides,
} from "@/lib/mock-data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title:
      locale === "km"
        ? (process.env.NEXT_PUBLIC_SCHOOL_NAME_KM ?? "វិទ្យាល័យ")
        : (process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "High School"),
    description:
      locale === "km"
        ? "ស្វាគមន៍មកកាន់វិទ្យាល័យ"
        : "Welcome to our High School official website",
  };
}

export default async function HomePage() {
  return (
    <>
      <HeroSection slides={mockHeroSlides} />
      <StatsSection stats={mockStats} />
      <NewsSection news={mockNews.slice(0, 6)} />
      <AchievementsSection achievements={mockAchievements.slice(0, 6)} />
      <NoticeBoardSection notices={mockNotices} />
    </>
  );
}
