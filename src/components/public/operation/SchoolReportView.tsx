"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { SCHOOL_REPORT_META, type ReportBlock, type ReportSection } from "@/lib/school-report-data";

interface SchoolReportViewProps {
  locale: string;
  sections: ReportSection[];
  meta: typeof SCHOOL_REPORT_META;
}

function sectionFromHash(sections: ReportSection[]): number {
  if (typeof window === "undefined") return sections[0]?.number ?? 1;
  const match = window.location.hash.match(/^#section-(\d+)$/);
  const n = match ? parseInt(match[1], 10) : NaN;
  return sections.some((s) => s.number === n) ? n : sections[0]?.number ?? 1;
}

export default function SchoolReportView({ locale, sections, meta }: SchoolReportViewProps) {
  const km = locale === "km";
  // Kept in the URL hash (not just React state) so the active tab survives
  // a locale switch, which remounts this component via full navigation.
  const [activeNumber, setActiveNumber] = useState(sections[0]?.number ?? 1);
  useEffect(() => {
    setActiveNumber(sectionFromHash(sections));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectSection = useCallback((n: number) => {
    setActiveNumber(n);
    history.replaceState(null, "", `#section-${n}`);
  }, []);

  const activeSection = (sections.find((s) => s.number === activeNumber) ?? sections[0]) as ReportSection;

  return (
    <div className="min-h-screen" style={{ background: "#f8f9ff" }}>
      {/* Hero */}
      <section
        className="pt-24 pb-16"
        style={{ background: "linear-gradient(135deg, #001f45 0%, #00376f 55%, #1e4e8c 100%)" }}
      >
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <p className="font-khmer text-2xl md:text-3xl mb-3" style={{ color: "#fdbc13" }}>
            កម្រងព័ត៌មានគ្រឹះស្ថានសិក្សា
          </p>
          <h1 className={cn("text-4xl md:text-5xl font-bold text-white mb-5", km && "font-khmer")}>
            {km ? "របាយការណ៍ប្រតិបត្តិការសាលារៀន" : "School Operations Report"}
          </h1>
          <p className={cn("text-base md:text-lg text-white/70 leading-relaxed", km && "font-khmer")}>
            {km
              ? `ព័ត៌មានផ្លូវការស្តីពីប្រតិបត្តិការសាលា ឆ្នាំសិក្សា ${meta.academicYear} — ធ្វើបច្ចុប្បន្នភាពថ្ងៃទី ${meta.reportDate_km}`
              : `Official school operations data for academic year ${meta.academicYear} — last updated ${meta.reportDate_en}`}
          </p>
        </div>
      </section>

      <div className="max-w-[1680px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Section nav — sidebar on desktop, horizontal scroll on mobile */}
          <nav className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-6 px-6 lg:mx-0 lg:px-0 scrollbar-thin">
              {sections.map((section) => {
                const active = section.number === activeNumber;
                return (
                  <button
                    key={section.number}
                    type="button"
                    onClick={() => selectSection(section.number)}
                    className={cn(
                      "flex items-center gap-3 text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors shrink-0 lg:shrink whitespace-nowrap lg:whitespace-normal cursor-pointer",
                      km && "font-khmer",
                      active ? "text-white" : "bg-white hover:bg-school-blue-50"
                    )}
                    style={
                      active
                        ? { background: "#00376f" }
                        : { color: "#0d1c2f", boxShadow: "0px 2px 12px rgba(30,78,140,0.05)" }
                    }
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={active ? { background: "#fdbc13", color: "#00376f" } : { background: "#eef3ff", color: "#00376f" }}
                    >
                      {section.number}
                    </span>
                    <span className="lg:whitespace-normal">{km ? section.title_km : section.title_en}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content */}
          <div className="space-y-6 min-w-0">
            <div className="bg-white rounded-2xl p-6 md:p-8" style={{ boxShadow: "0px 4px 20px rgba(30,78,140,0.07)" }}>
              <p className="text-xs tracking-[0.2em] uppercase font-medium mb-1" style={{ color: "#737781" }}>
                SECTION {activeSection.number}
              </p>
              <h2 className={cn("text-2xl font-bold mb-6", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
                {km ? activeSection.title_km : activeSection.title_en}
              </h2>

              <div className="space-y-8">
                {activeSection.subsections.map((sub) => (
                  <div key={sub.key}>
                    <h3 className={cn("text-base font-bold mb-3 flex items-center gap-2", km && "font-khmer")} style={{ color: "#00376f" }}>
                      <span
                        className="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold shrink-0"
                        style={{ background: "rgba(0,55,111,0.08)", color: "#00376f" }}
                      >
                        {sub.key}
                      </span>
                      {km ? sub.title_km : sub.title_en}
                    </h3>
                    <div className="space-y-4">
                      {sub.blocks.map((block, i) => (
                        <BlockRenderer key={i} block={block} km={km} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Report data stores bilingual labels as a single "ខ្មែរ text / English text"
// string. Split on that pattern (Khmer script before the slash, Latin script
// after) and keep only the half matching the active locale. Plain data
// values that happen to contain " / " (e.g. "27 / 14" total/female pairs)
// don't match — the regex requires an actual Khmer/Latin split — so they
// pass through untouched.
function localizeCell<T>(value: T, km: boolean): T {
  if (typeof value !== "string") return value;
  const match = value.match(/^(.*\p{Script=Khmer}.*)\s\/\s(.*)$/u);
  if (match && !/\p{Script=Khmer}/u.test(match[2])) {
    return (km ? match[1].trim() : match[2].trim()) as unknown as T;
  }
  return value;
}

function BlockRenderer({ block, km }: { block: ReportBlock; km: boolean }) {
  if (block.type === "keyvalue") {
    return (
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {block.items.map((item) => (
          <div key={item.label_en} className="flex items-baseline gap-2 py-1.5 border-b" style={{ borderColor: "#f0f2f7" }}>
            <dt className={cn("text-xs shrink-0", km && "font-khmer")} style={{ color: "#8993a3" }}>
              {km ? item.label_km : item.label_en}
            </dt>
            <dd className={cn("text-sm font-medium break-all", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
              {localizeCell(item.value, km)}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  if (block.type === "list") {
    return (
      <ul className="space-y-3">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: "#434750" }}>
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#fdbc13" }} />
            <span className={km ? "font-khmer" : ""}>{localizeCell(item, km)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "text") {
    return (
      <div className="space-y-2">
        {block.paragraphs.map((p, i) => (
          <p key={i} className={cn("text-sm leading-relaxed", km && "font-khmer")} style={{ color: "#434750" }}>
            {localizeCell(p, km)}
          </p>
        ))}
      </div>
    );
  }

  // table
  return (
    <div>
      <div className="rounded-xl border" style={{ borderColor: "#eef1f7" }}>
        <table className="w-full text-xs sm:text-sm table-fixed break-words">
          <thead>
            <tr style={{ background: "#f4f7ff" }}>
              {block.headers.map((h, i) => (
                <th
                  key={i}
                  className={cn("text-left px-1.5 sm:px-2.5 py-2 font-semibold text-[10px] sm:text-xs leading-tight align-bottom", km && "font-khmer")}
                  style={{ color: "#00376f" }}
                >
                  {localizeCell(h, km)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => {
              const isTotal = String(row[0]).toLowerCase().includes("total") || String(row[0]).includes("សរុប");
              return (
                <tr
                  key={ri}
                  className="border-t"
                  style={{ borderColor: "#f0f2f7", background: isTotal ? "#fdf8ea" : ri % 2 === 0 ? "#ffffff" : "#fbfcff" }}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={cn("px-1.5 sm:px-2.5 py-2 leading-snug", isTotal && "font-bold", km && "font-khmer")}
                      style={{ color: "#0d1c2f" }}
                    >
                      {cell === "" ? <span style={{ color: "#c3c6d2" }}>—</span> : localizeCell(cell, km)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {block.note && (
        <p className={cn("text-xs mt-2 leading-relaxed", km && "font-khmer")} style={{ color: "#a3a9b7" }}>
          {localizeCell(block.note, km)}
        </p>
      )}
    </div>
  );
}
