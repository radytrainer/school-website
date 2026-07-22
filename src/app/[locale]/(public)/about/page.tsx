import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getLocalizedText, cn, parseListItems } from "@/lib/utils";
import { Eye, Star, ArrowRight, Users, GraduationCap, Layers, Award, MapPin, CalendarDays } from "lucide-react";
import { getAboutPageData, getCurrentStatistics } from "@/lib/queries";
import OrganizationSection from "@/components/public/about/OrganizationSection";
import StaffDirectory from "@/components/public/about/StaffDirectory";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("about");
  const description =
    locale === "km"
      ? "ស្វែងយល់អំពីបេសកកម្ម អ្នកដឹកនាំ និងប្រវត្តិសាស្ត្ររបស់វិទ្យាល័យកំរៀង ស្ថិតនៅស្រុកកំរៀង ខេត្តបាត់ដំបង។"
      : "Learn about Kamrieng High School's mission, leadership, and history — a public high school in Kamrieng district, Battambang province, Cambodia.";
  return {
    title: t("title"),
    description,
    alternates: { canonical: `/${locale}/about`, languages: { km: "/km/about", en: "/en/about" } },
  };
}

const DEFAULT_CORE_VALUES_EN = [
  "Academic Excellence",
  "Integrity & Honor",
  "Cultural Pride",
  "Innovation",
];
const DEFAULT_CORE_VALUES_KM = [
  "ឧត្តមភាពសិក្សា",
  "សុចរិតភាព និងកិត្តិយស",
  "មោទនភាពវប្បធម៌",
  "នវានុវត្តន៍",
];

export default async function AboutPage() {
  const locale = await getLocale();
  const t = await getTranslations("about");
  const km = locale === "km";
  const { schoolInfo, leadership, teachers, milestones } = await getAboutPageData();
  const stats = await getCurrentStatistics();

  const infoMap = Object.fromEntries(schoolInfo.map((i) => [i.section, i]));
  const vision = infoMap["vision"];
  const mission = infoMap["mission"];
  const history = infoMap["history"];
  const values = infoMap["values"];

  const parsedCoreValues = parseListItems(
    values ? getLocalizedText(values.content_km, values.content_en, locale) : null
  );
  const coreValues =
    parsedCoreValues.length > 0
      ? parsedCoreValues
      : km
        ? DEFAULT_CORE_VALUES_KM
        : DEFAULT_CORE_VALUES_EN;

  const sortedMilestones = [...milestones].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="min-h-screen" style={{ background: "#f8f9ff" }}>

      {/* ── Hero ── */}
      <section
        className="pt-24 pb-20"
        style={{
          background: "linear-gradient(135deg, #001f45 0%, #00376f 55%, #1e4e8c 100%)",
        }}
      >
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <p className="font-khmer text-2xl md:text-3xl mb-3" style={{ color: "#fdbc13" }}>
            អំពីសាលារបស់យើង
          </p>
          <h1 className={cn("text-4xl md:text-5xl font-bold text-white mb-5", km && "font-khmer")}>
            {t("title")}
          </h1>
          <p
            className={cn("text-base md:text-lg text-white/70 leading-relaxed", km && "font-khmer")}
          >
            {km
              ? "សាលារដ្ឋមធ្យមសិក្សានៅស្រុកកំរៀង ខេត្តបាត់ដំបង បម្រើសហគមន៍ជនបទតាំងពីឆ្នាំ ២០០០ ជាមួយបេសកកម្មពង្រីកឱកាសអប់រំប្រកបដោយគុណភាពដល់កូនសិស្សគ្រប់រូប"
              : "A public secondary school in Kamrieng district, Battambang province, serving this rural community since 2000 — committed to expanding access to quality education for every student."}
          </p>
        </div>
      </section>

      {/* ── Quick Facts ── */}
      <section className="py-12" style={{ background: "#ffffff" }}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto -mt-24 relative z-10">
            {[
              { icon: CalendarDays, label_en: "Established", label_km: "ឆ្នាំបង្កើត", value: "2000" },
              { icon: MapPin, label_en: "Land Area", label_km: "ផ្ទៃដី", value: "21,253 m²" },
              { icon: Users, label_en: "Students", label_km: "សិស្ស", value: (stats.total_students ?? 0).toLocaleString() },
              { icon: GraduationCap, label_en: "Teachers", label_km: "គ្រូបង្រៀន", value: String(stats.total_teachers ?? 0) },
              { icon: Layers, label_en: "Classes", label_km: "ថ្នាក់រៀន", value: String(stats.total_classes ?? 0) },
              { icon: Award, label_en: "BAC Pass Rate", label_km: "អត្រាប្រឡងជាប់", value: `${stats.pass_rate ?? stats.graduation_rate ?? 0}%` },
            ].map((fact) => {
              const Icon = fact.icon;
              return (
                <div
                  key={fact.label_en}
                  className="bg-white rounded-2xl p-4 md:p-5 text-center flex flex-col items-center gap-2"
                  style={{ boxShadow: "0px 8px 30px rgba(30,78,140,0.10)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(0,55,111,0.08)" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "#00376f" }} />
                  </div>
                  <p className="text-xl md:text-2xl font-bold tabular-nums" style={{ color: "#0d1c2f" }}>
                    {fact.value}
                  </p>
                  <p className={cn("text-xs leading-tight", km && "font-khmer")} style={{ color: "#8993a3" }}>
                    {km ? fact.label_km : fact.label_en}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Vision / Mission / Values ── */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Vision & Mission — spans 2 cols */}
            <div
              className="lg:col-span-2 bg-white rounded-2xl p-8"
              style={{ boxShadow: "0px 4px 20px rgba(30,78,140,0.07)" }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(0,55,111,0.08)" }}
                >
                  <Eye className="w-4 h-4" style={{ color: "#00376f" }} />
                </div>
                <div>
                  <p
                    className={cn("text-xs font-semibold leading-tight", km && "font-khmer")}
                    style={{ color: "#fdbc13" }}
                  >
                    {km ? "ចក្ខុវិស័យ និងបេសកកម្ម" : "ចក្ខុវិស័យ និងបេសកកម្ម"}
                  </p>
                  <p className="text-xs tracking-[0.15em] uppercase" style={{ color: "#737781" }}>
                    VISION &amp; MISSION
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 className={cn("text-base font-bold mb-3", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
                    {km ? "ចក្ខុវិស័យ" : "Vision"}
                  </h3>
                  <div
                    className={cn("text-sm leading-relaxed prose prose-sm max-w-none", km && "font-khmer")}
                    style={{ color: "#434750" }}
                    dangerouslySetInnerHTML={{
                      __html: vision
                        ? (getLocalizedText(vision.content_km, vision.content_en, locale) ?? "")
                        : "",
                    }}
                  />
                </div>
                <div>
                  <h3 className={cn("text-base font-bold mb-3", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
                    {km ? "បេសកកម្ម" : "Mission"}
                  </h3>
                  <div
                    className={cn("text-sm leading-relaxed prose prose-sm max-w-none", km && "font-khmer")}
                    style={{ color: "#434750" }}
                    dangerouslySetInnerHTML={{
                      __html: mission
                        ? (getLocalizedText(mission.content_km, mission.content_en, locale) ?? "")
                        : "",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Core Values */}
            <div className="rounded-2xl p-8 flex flex-col" style={{ background: "#fdbc13" }}>
              <div className="flex items-center gap-3 mb-8">
                <Star className="w-5 h-5 flex-shrink-0" style={{ color: "#00376f" }} />
                <div>
                  <p className={cn("text-xs font-semibold leading-tight", km && "font-khmer")} style={{ color: "#6b4d00" }}>
                    {km ? "គុណតម្លៃ" : "គុណតម្លៃ"}
                  </p>
                  <p className="text-xs tracking-[0.15em] uppercase" style={{ color: "#5d4200" }}>
                    CORE VALUES
                  </p>
                </div>
              </div>
              <ul className="space-y-4 flex-1">
                {coreValues.map((v) => (
                  <li key={v} className="flex items-center gap-3 text-sm font-semibold" style={{ color: "#261900" }}>
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: "#00376f" }}
                    />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── History ── */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-khmer text-3xl md:text-4xl mb-1" style={{ color: "#00376f" }}>
                ប្រវត្តិ​សាលា
              </p>
              <h2 className={cn("text-2xl font-bold mb-6", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
                {history ? getLocalizedText(history.title_km, history.title_en, locale) : "Our Rich History"}
              </h2>
              <div
                className={cn("text-base leading-relaxed mb-6 prose prose-sm max-w-none", km && "font-khmer")}
                style={{ color: "#434750" }}
                dangerouslySetInnerHTML={{
                  __html: history
                    ? (getLocalizedText(history.content_km, history.content_en, locale) ?? "")
                    : "",
                }}
              />
              <a
                href="#"
                className={cn("inline-flex items-center gap-1.5 text-sm font-semibold group", km && "font-khmer")}
                style={{ color: "#00376f" }}
              >
                {km ? "ស្វែងយល់បន្ថែម" : "Learn more about our archives"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            {/* Image / placeholder */}
            <div
              className="relative rounded-2xl overflow-hidden flex items-end"
              style={{
                minHeight: 320,
                background: "linear-gradient(135deg, #00376f 0%, #1e4e8c 100%)",
              }}
            >
              {/* Decorative circles */}
              <div
                className="absolute top-8 right-8 w-40 h-40 rounded-full opacity-10"
                style={{ background: "#fdbc13" }}
              />
              <div
                className="absolute top-24 right-24 w-60 h-60 rounded-full opacity-5"
                style={{ background: "#ffffff" }}
              />
              <div className="relative z-10 p-6">
                <span
                  className="text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm"
                  style={{ background: "rgba(0,0,0,0.35)", color: "#ffffff" }}
                >
                  {km ? "បង្កើតឡើងឆ្នាំ ២០០០" : "Established 2000"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Milestones ── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-khmer text-3xl mb-2" style={{ color: "#0d1c2f" }}>
              ដំណាក់កាលសំខាន់ៗ
            </h2>
            <p className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: "#737781" }}>
              KEY MILESTONES
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto">
            {/* Centre line */}
            <div
              className="absolute left-1/2 top-2 bottom-2 w-px"
              style={{ background: "#c3c6d2", transform: "translateX(-50%)" }}
            />

            {sortedMilestones.map((m, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={m.id}
                  className={cn(
                    "relative flex items-start gap-0 mb-16 last:mb-0",
                    isLeft ? "flex-row" : "flex-row-reverse"
                  )}
                >
                  {/* Content */}
                  <div className={cn("flex-1 pb-4", isLeft ? "pr-10 text-right" : "pl-10 text-left")}>
                    <p className="text-3xl font-bold mb-1" style={{ color: m.color }}>
                      {m.year}
                    </p>
                    <h3
                      className={cn("text-lg font-semibold mb-2", km && "font-khmer")}
                      style={{ color: "#0d1c2f" }}
                    >
                      {getLocalizedText(m.title_km, m.title_en, locale)}
                    </h3>
                    <p
                      className={cn("text-sm leading-relaxed", km && "font-khmer")}
                      style={{ color: "#434750" }}
                    >
                      {getLocalizedText(m.description_km, m.description_en, locale)}
                    </p>
                  </div>

                  {/* Dot — centred on the line */}
                  <div
                    className="absolute left-1/2 w-3.5 h-3.5 rounded-full border-2 border-white"
                    style={{
                      background: m.color,
                      top: "0.45rem",
                      transform: "translateX(-50%)",
                      boxShadow: `0 0 0 3px ${m.color}30`,
                    }}
                  />

                  {/* Spacer */}
                  <div className="flex-1" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <StaffDirectory leadership={leadership} teachers={teachers} locale={locale} />

      <OrganizationSection teachers={teachers} locale={locale} />
    </div>
  );
}
