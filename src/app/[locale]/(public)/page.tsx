import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import HeroSection from "@/components/public/home/HeroSection";
import StatsSection from "@/components/public/home/StatsSection";
import NewsSection from "@/components/public/home/NewsSection";
import AchievementsSection from "@/components/public/home/AchievementsSection";
import { createServerClient } from "@/lib/supabase";
import type { Achievement, News, Statistics } from "@/types";
import {
  mockStats,
  mockNews,
  mockAchievements,
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

async function getCurrentStatistics(): Promise<Statistics> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("statistics")
    .select("*")
    .eq("is_current", true)
    .maybeSingle();
  return (data as Statistics | null) ?? mockStats;
}

async function getLatestNews(): Promise<News[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("news")
    .select("*, category:news_categories(*)")
    .eq("status", "published")
    .order("publish_date", { ascending: false })
    .limit(6);
  return data && data.length > 0 ? (data as News[]) : mockNews.slice(0, 6);
}

async function getLatestAchievements(): Promise<Achievement[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("achievements")
    .select("*")
    .eq("status", "published")
    .order("achievement_date", { ascending: false })
    .limit(6);
  return data && data.length > 0 ? (data as Achievement[]) : mockAchievements.slice(0, 6);
}

export default async function HomePage() {
  const [stats, news, achievements] = await Promise.all([
    getCurrentStatistics(),
    getLatestNews(),
    getLatestAchievements(),
  ]);

  return (
    <>
      <HeroSection slides={mockHeroSlides} />
      <StatsSection stats={stats} />
      <NewsSection news={news} />
      <AchievementsSection achievements={achievements} />
    </>
  );
}
