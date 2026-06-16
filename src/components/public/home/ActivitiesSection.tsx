"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Activity } from "@/types";
import { formatShortDate, getLocalizedText } from "@/lib/utils";

interface ActivitiesSectionProps {
  activities: Activity[];
}

export default function ActivitiesSection({ activities }: ActivitiesSectionProps) {
  const t = useTranslations("activities");
  const locale = useLocale();

  if (!activities.length) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-school-gold-500 font-semibold text-sm uppercase tracking-wider">
              {t("title")}
            </span>
            <h2 className={`text-3xl font-bold text-gray-900 mt-1 ${locale === "km" ? "font-khmer" : ""}`}>
              {t("subtitle")}
            </h2>
          </motion.div>
          <Button asChild variant="outline" className="hidden sm:flex border-school-blue-800 text-school-blue-800 hover:bg-school-blue-50">
            <Link href={`/${locale}/activities`}>
              {t("view_all")} <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, i) => {
            const title = getLocalizedText(activity.title_km, activity.title_en, locale);
            const location = getLocalizedText(activity.location_km, activity.location_en, locale);
            const categoryName = activity.category
              ? getLocalizedText(activity.category.name_km, activity.category.name_en, locale)
              : null;

            return (
              <motion.article
                key={activity.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  {activity.featured_image ? (
                    <Image
                      src={activity.featured_image}
                      alt={title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${activity.category?.color ?? "#1e3a8a"} 0%, #1e40af 100%)`,
                        opacity: 0.8,
                      }}
                    />
                  )}
                  {categoryName && (
                    <div className="absolute top-3 left-3">
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-full text-white"
                        style={{ backgroundColor: activity.category?.color ?? "#1e3a8a" }}
                      >
                        {categoryName}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className={`font-semibold text-gray-900 text-base mb-3 line-clamp-2 group-hover:text-school-blue-800 transition-colors ${locale === "km" ? "font-khmer" : ""}`}>
                    {title}
                  </h3>
                  <div className="space-y-1.5 mb-4">
                    {activity.activity_date && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatShortDate(activity.activity_date, locale)}</span>
                      </div>
                    )}
                    {location && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{location}</span>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/${locale}/activities/${activity.slug}`}
                    className="inline-flex items-center text-sm font-medium text-school-blue-800 hover:text-school-blue-900 gap-1 group/link"
                  >
                    {locale === "km" ? "អានបន្ថែម" : "Read More"}
                    <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
