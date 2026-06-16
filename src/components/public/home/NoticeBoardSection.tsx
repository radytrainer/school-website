"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { Pin, AlertTriangle, Calendar, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Notice } from "@/types";
import { getLocalizedText, formatShortDate } from "@/lib/utils";

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; badgeVariant: "destructive" | "warning" | "info" | "default" }> = {
  urgent: { icon: <AlertTriangle className="w-4 h-4" />, color: "text-red-600", badgeVariant: "destructive" },
  exam: { icon: <Calendar className="w-4 h-4" />, color: "text-blue-600", badgeVariant: "info" },
  event: { icon: <Bell className="w-4 h-4" />, color: "text-purple-600", badgeVariant: "default" },
  general: { icon: <Bell className="w-4 h-4" />, color: "text-gray-600", badgeVariant: "default" },
};

const TYPE_LABELS_KM: Record<string, string> = {
  urgent: "បន្ទាន់",
  exam: "ប្រឡង",
  event: "ព្រឹត្តិការណ៍",
  general: "ទូទៅ",
};

const TYPE_LABELS_EN: Record<string, string> = {
  urgent: "Urgent",
  exam: "Exam",
  event: "Event",
  general: "General",
};

interface NoticeBoardSectionProps {
  notices: Notice[];
}

export default function NoticeBoardSection({ notices }: NoticeBoardSectionProps) {
  const locale = useLocale();

  if (!notices.length) return null;

  const sectionTitle = locale === "km" ? "ក្ដារជូនដំណឹង" : "Notice Board";

  return (
    <section className="py-16 bg-school-blue-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-school-gold-500 font-semibold text-sm uppercase tracking-wider">
            {locale === "km" ? "ការជូនដំណឹង" : "Notices"}
          </span>
          <h2 className={`text-3xl font-bold text-gray-900 mt-1 ${locale === "km" ? "font-khmer" : ""}`}>
            {sectionTitle}
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {notices.map((notice, i) => {
            const config = TYPE_CONFIG[notice.notice_type] ?? TYPE_CONFIG.general;
            const title = getLocalizedText(notice.title_km, notice.title_en, locale);
            const content = getLocalizedText(notice.content_km, notice.content_en, locale);
            const typeLabelMap = locale === "km" ? TYPE_LABELS_KM : TYPE_LABELS_EN;

            return (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                <div className={`mt-0.5 shrink-0 ${config.color}`}>{config.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={config.badgeVariant} className="text-xs">
                      {typeLabelMap[notice.notice_type] ?? notice.notice_type}
                    </Badge>
                    {notice.is_pinned && (
                      <span className="text-xs text-school-gold-500 flex items-center gap-0.5">
                        <Pin className="w-3 h-3" />
                        {locale === "km" ? "ចំណុចសំខាន់" : "Pinned"}
                      </span>
                    )}
                  </div>
                  <h3 className={`font-semibold text-gray-900 text-sm ${locale === "km" ? "font-khmer" : ""}`}>
                    {title}
                  </h3>
                  {content && (
                    <p className={`text-xs text-gray-500 mt-1 line-clamp-2 ${locale === "km" ? "font-khmer" : ""}`}>
                      {content}
                    </p>
                  )}
                </div>
                {notice.start_date && (
                  <div className="text-xs text-gray-400 shrink-0 text-right">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatShortDate(notice.start_date, locale)}
                    </div>
                    {notice.end_date && (
                      <div className="mt-0.5">→ {formatShortDate(notice.end_date, locale)}</div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
