import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { getGovernanceIcon } from "@/lib/governance-icons";
import { getGovernanceItems } from "@/lib/queries";
import type { GovernanceItem } from "@/types";
import { ClipboardList, Sparkles } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("governance");
  const description =
    locale === "km"
      ? "រចនាសម្ព័ន្ធគ្រប់គ្រង និងវប្បធម៌សាលានៃវិទ្យាល័យកំរៀង ខេត្តបាត់ដំបង។"
      : "School governance, management structure, and school culture at Kamrieng High School, Battambang, Cambodia.";
  return {
    title: t("title"),
    description,
    alternates: { canonical: `/${locale}/governance`, languages: { km: "/km/governance", en: "/en/governance" } },
  };
}

const SECTION_COPY = {
  structure: {
    anchor: "structure",
    eyebrow: "SCHOOL GOVERNANCE",
    kicker: "អភិបាលកិច្ចសាលារៀន",
    heading_km: "រចនាសម្ព័ន្ធ និងប្រព័ន្ធគ្រប់គ្រង",
    heading_en: "Structure & Management Systems",
    intro_km: "គោលការណ៍ ផែនការ និងគណៈកម្មការ ដែលរក្សាការគ្រប់គ្រងសាលា ប្រកបដោយប្រសិទ្ធភាព។",
    intro_en: "The policies, plans, and committees that keep our school well managed and accountable.",
    navLabel_km: "រចនាសម្ព័ន្ធ",
    navLabel_en: "Structure",
    accent: "blue" as const,
  },
  culture: {
    anchor: "culture",
    eyebrow: "TEACHING & LEARNING CULTURE",
    kicker: "វប្បធម៌បង្រៀន និងរៀន",
    heading_km: "សកម្មភាពសិក្សា និងអភិវឌ្ឍន៍សិស្ស",
    heading_en: "Learning Activities & Student Growth",
    intro_km: "ការអនុវត្ត និងសកម្មភាពប្រចាំថ្ងៃ ដែលជំរុញការសិក្សា និងការរីកចម្រើនរបស់សិស្ស។",
    intro_en: "The everyday habits and activities that shape how our students learn and grow.",
    navLabel_km: "វប្បធម៌សិក្សា",
    navLabel_en: "Learning Culture",
    accent: "gold" as const,
  },
};

const ACCENT_STYLES = {
  blue: {
    sectionBg: "#f8f9ff",
    iconWrapClass: "bg-[rgba(0,55,111,0.08)] group-hover:bg-[#00376f]",
    iconClass: "text-[#00376f] group-hover:text-white",
    numberColor: "#00376f",
    kickerColor: "#00376f",
  },
  gold: {
    sectionBg: "linear-gradient(180deg, #fffdf7 0%, #fef8ea 100%)",
    iconWrapClass: "bg-[rgba(253,188,19,0.16)] group-hover:bg-[#fdbc13]",
    iconClass: "text-[#b6790a] group-hover:text-white",
    numberColor: "#b6790a",
    kickerColor: "#00376f",
  },
};

function ItemCard({ item, index, km, accent }: { item: GovernanceItem; index: number; km: boolean; accent: "blue" | "gold" }) {
  const Icon = getGovernanceIcon(item.icon);
  const styles = ACCENT_STYLES[accent];
  return (
    <div
      className="group relative h-full bg-white rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{ boxShadow: "0px 4px 20px rgba(30,78,140,0.07)" }}
    >
      <div className="flex items-start gap-4">
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300", styles.iconWrapClass)}>
          <Icon className={cn("w-5 h-5 transition-colors duration-300", styles.iconClass)} />
        </div>
        <div className="min-w-0">
          <span className="text-xs font-bold tracking-wider" style={{ color: styles.numberColor }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <p className={cn("text-sm leading-relaxed mt-1", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
            {km ? item.title_km : item.title_en}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ km }: { km: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-16 rounded-2xl border border-dashed"
      style={{ borderColor: "#dbe4f5", color: "#8993a3" }}
    >
      <Sparkles className="w-8 h-8 mb-3 opacity-50" />
      <p className={cn("text-sm", km && "font-khmer")}>
        {km ? "មិនទាន់មានមាតិកាទេ" : "Content coming soon"}
      </p>
    </div>
  );
}

export default async function GovernancePage() {
  const locale = await getLocale();
  const km = locale === "km";
  const items = await getGovernanceItems();

  const structureItems = items.filter((i) => i.section === "structure");
  const cultureItems = items.filter((i) => i.section === "culture");

  return (
    <div className="min-h-screen" style={{ background: "#f8f9ff" }}>
      {/* ── Hero ── */}
      <section
        className="pt-24 pb-16"
        style={{
          background: "linear-gradient(135deg, #001f45 0%, #00376f 55%, #1e4e8c 100%)",
        }}
      >
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <p className="font-khmer text-2xl md:text-3xl mb-3" style={{ color: "#fdbc13" }}>
            អភិបាលកិច្ចសាលារៀន
          </p>
          <h1 className={cn("text-4xl md:text-5xl font-bold text-white mb-5", km && "font-khmer")}>
            {km ? "អភិបាលកិច្ច និងវប្បធម៌សាលារៀន" : "School Governance"}
          </h1>
          <p className={cn("text-base md:text-lg text-white/70 leading-relaxed", km && "font-khmer")}>
            {km
              ? "របៀបគ្រប់គ្រង តាមដាន និងលើកកម្ពស់គុណភាពអប់រំ តាមរយៈប្រព័ន្ធ រចនាសម្ព័ន្ធ និងវប្បធម៌សិក្សារបស់សាលា"
              : "How our school is structured, monitored, and improved — and the everyday culture of teaching and learning behind it."}
          </p>
        </div>
      </section>

      {/* ── Quick nav ── */}
      <div className="border-b" style={{ borderColor: "#e6eeff", background: "#ffffff" }}>
        <div className="container mx-auto px-6">
          <nav className="flex items-center justify-center gap-2 py-3 flex-wrap">
            {(Object.keys(SECTION_COPY) as (keyof typeof SECTION_COPY)[]).map((key) => {
              const s = SECTION_COPY[key];
              return (
                <a
                  key={key}
                  href={`#${s.anchor}`}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200",
                    km && "font-khmer"
                  )}
                  style={{ background: "#eff4ff", color: "#00376f" }}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  {km ? s.navLabel_km : s.navLabel_en}
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Structure & Management Systems ── */}
      <section id={SECTION_COPY.structure.anchor} className="py-16 scroll-mt-20" style={{ background: ACCENT_STYLES.blue.sectionBg }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="font-khmer text-3xl mb-2" style={{ color: ACCENT_STYLES.blue.kickerColor }}>
              {SECTION_COPY.structure.kicker}
            </p>
            <h2 className={cn("text-2xl font-bold mb-3", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
              {km ? SECTION_COPY.structure.heading_km : SECTION_COPY.structure.heading_en}
            </h2>
            <p className={cn("text-sm leading-relaxed mb-3", km && "font-khmer")} style={{ color: "#5b6472" }}>
              {km ? SECTION_COPY.structure.intro_km : SECTION_COPY.structure.intro_en}
            </p>
            <p className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: "#737781" }}>
              {SECTION_COPY.structure.eyebrow}
            </p>
          </div>

          {structureItems.length === 0 ? (
            <EmptyState km={km} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {structureItems.map((item, i) => (
                <ItemCard key={item.id} item={item} index={i} km={km} accent="blue" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Learning Activities & Student Growth ── */}
      <section id={SECTION_COPY.culture.anchor} className="py-16 scroll-mt-20" style={{ background: ACCENT_STYLES.gold.sectionBg }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="font-khmer text-3xl mb-2" style={{ color: ACCENT_STYLES.gold.kickerColor }}>
              {SECTION_COPY.culture.kicker}
            </p>
            <h2 className={cn("text-2xl font-bold mb-3", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
              {km ? SECTION_COPY.culture.heading_km : SECTION_COPY.culture.heading_en}
            </h2>
            <p className={cn("text-sm leading-relaxed mb-3", km && "font-khmer")} style={{ color: "#5b6472" }}>
              {km ? SECTION_COPY.culture.intro_km : SECTION_COPY.culture.intro_en}
            </p>
            <p className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: "#737781" }}>
              {SECTION_COPY.culture.eyebrow}
            </p>
          </div>

          {cultureItems.length === 0 ? (
            <EmptyState km={km} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cultureItems.map((item, i) => (
                <ItemCard key={item.id} item={item} index={i} km={km} accent="gold" />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
