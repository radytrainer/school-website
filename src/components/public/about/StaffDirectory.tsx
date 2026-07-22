"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, User, Mail, FileText, Quote, X, Phone, GraduationCap, BookOpen, Layers, Award } from "lucide-react";
import { cn, getLocalizedText, resolveImageUrl } from "@/lib/utils";
import type { Leadership, Teacher } from "@/types";

type StaffKind = "leadership" | "teacher";

interface StaffPerson {
  id: string;
  kind: StaffKind;
  name: string;
  role: string;
  photo_url?: string;
  bio?: string;
  gender?: "male" | "female";
  phone?: string;
  qualification?: string;
  specialization?: string;
  subject?: string;
  gradeLevels?: number[];
}

interface StaffDirectoryProps {
  leadership: Leadership[];
  teachers: Teacher[];
  locale: string;
}

export default function StaffDirectory({ leadership, teachers, locale }: StaffDirectoryProps) {
  const km = locale === "km";
  const [filter, setFilter] = useState<"all" | StaffKind>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<StaffPerson | null>(null);

  const activeLeaders = useMemo(
    () => leadership.filter((l) => l.is_active).sort((a, b) => a.sort_order - b.sort_order),
    [leadership]
  );
  const activeTeachers = useMemo(
    () => teachers.filter((t) => t.is_active).sort((a, b) => a.sort_order - b.sort_order),
    [teachers]
  );

  const principal = activeLeaders[0];

  const people: StaffPerson[] = useMemo(() => {
    const fromLeaders: StaffPerson[] = activeLeaders.map((l) => ({
      id: l.id,
      kind: "leadership",
      name: getLocalizedText(l.name_km, l.name_en, locale),
      role: getLocalizedText(l.position_km, l.position_en, locale) || (km ? "គណៈគ្រប់គ្រង" : "Leadership"),
      photo_url: l.photo_url,
      bio: getLocalizedText(l.bio_km, l.bio_en, locale) || undefined,
      gender: l.gender,
      phone: l.phone || undefined,
      qualification: getLocalizedText(l.qualification_km, l.qualification_en, locale) || undefined,
      specialization: getLocalizedText(l.specialization_km, l.specialization_en, locale) || undefined,
      subject: getLocalizedText(l.subject_km, l.subject_en, locale) || undefined,
      gradeLevels: l.grade_levels && l.grade_levels.length > 0 ? l.grade_levels : undefined,
    }));
    const fromTeachers: StaffPerson[] = activeTeachers.map((t) => ({
      id: t.id,
      kind: "teacher",
      name: getLocalizedText(t.name_km, t.name_en, locale),
      role:
        getLocalizedText(t.position_km, t.position_en, locale) ||
        getLocalizedText(t.subject_km, t.subject_en, locale) ||
        getLocalizedText(t.department_km, t.department_en, locale) ||
        (km ? "គ្រូបង្រៀន" : "Teacher"),
      photo_url: t.photo_url,
      gender: t.gender,
      phone: t.phone || undefined,
      qualification: getLocalizedText(t.qualification_km, t.qualification_en, locale) || undefined,
      specialization: getLocalizedText(t.specialization_km, t.specialization_en, locale) || undefined,
      subject: getLocalizedText(t.subject_km, t.subject_en, locale) || undefined,
      gradeLevels: t.grade_levels && t.grade_levels.length > 0 ? t.grade_levels : undefined,
    }));
    return [...fromLeaders, ...fromTeachers];
  }, [activeLeaders, activeTeachers, locale, km]);

  const q = query.trim().toLowerCase();
  const filtered = people.filter((p) => {
    if (filter !== "all" && p.kind !== filter) return false;
    if (q && !p.name.toLowerCase().includes(q)) return false;
    return true;
  });

  // Keep the principal's featured card above the grid while browsing without
  // a search query — searching drops back to a flat, predictable result list.
  const principalPerson = principal ? people.find((p) => p.id === principal.id) : undefined;
  const showFeatured = !q && (filter === "all" || filter === "leadership") && !!principalPerson;
  const gridPeople = showFeatured ? filtered.filter((p) => p.id !== principalPerson!.id) : filtered;

  const counts = {
    all: people.length,
    leadership: activeLeaders.length,
    teacher: activeTeachers.length,
  };

  return (
    <section className="py-16" style={{ background: "#f8f9ff" }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className={cn("text-3xl font-bold mb-2", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
            {km ? "គណៈគ្រប់គ្រង និងបុគ្គលិកសាលា" : "Our Staff"}
          </h2>
          <p className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: "#737781" }}>
            SCHOOL LEADERSHIP &amp; STAFF
          </p>
        </div>

        {showFeatured && (
          <PrincipalCard person={principalPerson!} locale={locale} onOpen={() => setSelected(principalPerson!)} />
        )}

        {/* Filter pills + search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            {(
              [
                ["all", km ? "ទាំងអស់" : "All"],
                ["leadership", km ? "គណៈគ្រប់គ្រង" : "Leadership"],
                ["teacher", km ? "គ្រូបង្រៀន" : "Teachers"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer",
                  km && "font-khmer",
                  filter === key
                    ? "bg-school-blue-800 text-white"
                    : "bg-white text-school-blue-800 hover:bg-school-blue-50 border border-[#e6eeff]"
                )}
              >
                {label} <span className="ml-1 opacity-70">({counts[key]})</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#a3a9b7" }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={km ? "ស្វែងរកឈ្មោះ..." : "Search by name..."}
              className={cn(
                "w-full pl-9 pr-3 py-2 rounded-full text-sm bg-white border border-[#e6eeff] focus:outline-none focus:ring-2 focus:ring-school-blue-800/20",
                km && "font-khmer"
              )}
            />
          </div>
        </div>

        {gridPeople.length === 0 ? (
          <p className={cn("text-center text-sm py-16", km && "font-khmer")} style={{ color: "#737781" }}>
            {km ? "រកមិនឃើញលទ្ធផលទេ" : "No staff match your search."}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {gridPeople.map((p) => (
              <PersonCard key={p.id} person={p} km={km} onOpen={() => setSelected(p)} />
            ))}
          </div>
        )}
      </div>

      {selected && <StaffDetailModal person={selected} km={km} onClose={() => setSelected(null)} />}
    </section>
  );
}

function PersonCard({ person, km, onOpen }: { person: StaffPerson; km: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full bg-white rounded-2xl p-4 text-center border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
      style={{ borderColor: "#e6eeff", boxShadow: "0px 2px 12px rgba(30,78,140,0.05)" }}
    >
      <div className="relative w-16 h-16 mx-auto rounded-full mb-3 overflow-hidden ring-2 ring-[#eff4ff] transition-all duration-300 group-hover:ring-[#fdbc13]/40">
        {person.photo_url ? (
          <Image src={resolveImageUrl(person.photo_url)} alt={person.name} fill className="object-cover object-top" sizes="64px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "#eff4ff" }}>
            <User className="w-8 h-8" style={{ color: "#a8c8ff" }} />
          </div>
        )}
      </div>
      <h4 className={cn("font-semibold text-sm mb-1 leading-tight transition-colors group-hover:text-[#00376f]", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
        {person.name}
      </h4>
      <p className={cn("text-xs leading-snug", km && "font-khmer")} style={{ color: "#737781" }}>
        {person.role}
      </p>
    </button>
  );
}

function PrincipalCard({ person, locale, onOpen }: { person: StaffPerson; locale: string; onOpen: () => void }) {
  const km = locale === "km";
  return (
    <div
      className="relative bg-white rounded-3xl overflow-hidden mb-10 cursor-pointer transition-shadow hover:shadow-2xl"
      style={{ boxShadow: "0px 8px 30px rgba(30,78,140,0.10)" }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onOpen(); }}
    >
      <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #00376f 0%, #fdbc13 100%)" }} />

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
        <div
          className="flex items-center justify-center p-8 md:p-10"
          style={{ background: "linear-gradient(160deg, #eef3ff 0%, #dde9ff 100%)" }}
        >
          <div className="relative w-44 h-44 md:w-52 md:h-52 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl shrink-0">
            {person.photo_url ? (
              <Image src={resolveImageUrl(person.photo_url)} alt={person.name} fill className="object-cover object-top" sizes="208px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: "#dde9ff" }}>
                <User className="w-20 h-20" style={{ color: "#a8c8ff" }} />
              </div>
            )}
          </div>
        </div>

        <div className="relative p-8 md:p-10 flex flex-col justify-center overflow-hidden">
          <Quote className="absolute -top-2 right-6 w-24 h-24 pointer-events-none" style={{ color: "#00376f", opacity: 0.06 }} />
          <span
            className="relative self-start inline-flex items-center text-xs tracking-[0.15em] uppercase font-semibold px-3 py-1.5 rounded-full mb-4"
            style={{ background: "rgba(0,55,111,0.08)", color: "#00376f" }}
          >
            {person.role}
          </span>
          <h3 className={cn("relative text-2xl md:text-3xl font-bold mb-5", km && "font-khmer")} style={{ color: "#00376f" }}>
            {person.name}
          </h3>
          {person.bio && (
            <blockquote
              className={cn("relative text-base italic leading-relaxed mb-7 pl-5 border-l-[3px]", km && "font-khmer")}
              style={{ color: "#434750", borderColor: "#fdbc13" }}
            >
              {`"${person.bio}"`}
            </blockquote>
          )}
          <div className="relative flex flex-wrap gap-3">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpen(); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#00376f" }}
            >
              <Mail className="w-4 h-4" />
              {km ? "ការណែនាំ" : "View Message"}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpen(); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border transition-colors hover:bg-[#f0f5ff]"
              style={{ color: "#00376f", borderColor: "#00376f" }}
            >
              <FileText className="w-4 h-4" />
              {km ? "ជីវប្រវត្ដិ" : "Biography"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatGrades(grades: number[] | undefined, km: boolean): string | undefined {
  if (!grades || grades.length === 0) return undefined;
  const list = grades.join(", ");
  return km ? `ថ្នាក់ទី ${list}` : `Grade ${list}`;
}

function StaffDetailModal({ person, km, onClose }: { person: StaffPerson; km: boolean; onClose: () => void }) {
  // Gender and phone move up next to the name/role; Position is dropped from
  // the grid since it's already shown as the role line under the name.
  const rows: { icon: React.ReactNode; label: string; value?: string; highlight?: boolean }[] = [
    { icon: <GraduationCap className="w-3 h-3" />, label: km ? "កម្រិតវប្បធម៌" : "Educational Attainment", value: person.qualification },
    { icon: <Award className="w-3 h-3" />, label: km ? "ជំនាញ" : "Specialization", value: person.specialization, highlight: true },
    { icon: <BookOpen className="w-3 h-3" />, label: km ? "មុខវិជ្ជាបង្រៀន" : "Subject Currently Taught", value: person.subject, highlight: true },
    { icon: <Layers className="w-3 h-3" />, label: km ? "ថ្នាក់បង្រៀន" : "Class Level Taught", value: formatGrades(person.gradeLevels, km) },
  ];
  const providedRows = rows.filter((r) => r.value);
  const genderLabel = person.gender
    ? km
      ? person.gender === "male" ? "ប្រុស" : "ស្រី"
      : person.gender === "male" ? "Male" : "Female"
    : undefined;

  const infoContent = (
    <>
      <div className="flex items-center gap-2">
        <h3 className={cn("text-xl sm:text-2xl font-bold text-white leading-tight", km && "font-khmer")}>
          {person.name}
        </h3>
        {genderLabel && (
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-sm font-bold leading-none"
            style={{
              background: person.gender === "male" ? "rgba(59,130,246,0.25)" : "rgba(236,72,153,0.25)",
              color: person.gender === "male" ? "#93c5fd" : "#f9a8d4",
            }}
            title={genderLabel}
          >
            {person.gender === "male" ? "♂" : "♀"}
          </span>
        )}
      </div>
      <span
        className={cn("inline-block text-xs font-semibold px-2.5 py-1 rounded-full mt-2", km && "font-khmer")}
        style={{ background: "rgba(253,188,19,0.14)", color: "#fdbc13" }}
      >
        {person.role}
      </span>

      <div className="space-y-2.5 mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {person.phone && (
          <p className="flex items-center gap-2.5 text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
            <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.08)", color: "#fdbc13" }}>
              <Phone className="w-3 h-3" />
            </span>
            {person.phone}
          </p>
        )}
        {providedRows.map((row) => (
          <p
            key={row.label}
            className={cn("flex items-center gap-2.5 text-xs", km && "font-khmer")}
            style={{ color: "rgba(255,255,255,0.75)" }}
            title={row.label}
          >
            <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.08)", color: "#fdbc13" }}>
              {row.icon}
            </span>
            {row.highlight ? (
              <span
                className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold truncate"
                style={{ background: "rgba(110,163,224,0.18)", color: "#8ec3f7" }}
              >
                {row.value}
              </span>
            ) : (
              row.value
            )}
          </p>
        ))}
      </div>

      {providedRows.length === 0 && !person.phone && (
        <p className={cn("text-center text-sm py-4", km && "font-khmer")} style={{ color: "rgba(255,255,255,0.45)" }}>
          {km
            ? "ព័ត៌មានលម្អិតមិនទាន់ត្រូវបានបញ្ចូលនៅឡើយទេ។"
            : "Detailed information hasn't been added yet."}
        </p>
      )}
    </>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,27,56,0.55)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors z-30 backdrop-blur-sm cursor-pointer"
          style={{ color: "#ffffff" }}
          aria-label={km ? "បិទ" : "Close"}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center">
          {/* Grouped info card */}
          <div
            className="relative z-20 order-2 sm:order-1 rounded-2xl p-5 sm:p-5 w-full sm:w-[220px] shrink-0"
            style={{ background: "#0d1b38", boxShadow: "0px 20px 50px rgba(0,0,0,0.35)" }}
          >
            {infoContent}
          </div>

          {/* Photo in a framed border, overlapping the info card's edge.
              Width is capped (not flex-1) so an aspect-ratio box gives a
              properly proportioned headshot height instead of either
              cropping too tight or overflowing the viewport. */}
          <div className="relative z-10 order-1 sm:order-2 w-[240px] sm:w-[280px] mx-auto sm:mx-0 sm:-ml-8">
            <div
              className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border-[6px] bg-white"
              style={{ borderColor: "#6ea3e0", boxShadow: "0px 20px 50px rgba(0,0,0,0.3)" }}
            >
              {person.photo_url ? (
                <Image src={resolveImageUrl(person.photo_url)} alt={person.name} fill className="object-cover object-top" sizes="(min-width: 640px) 400px, 90vw" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: "#eff4ff" }}>
                  <User className="w-16 h-16" style={{ color: "#a8c8ff" }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
