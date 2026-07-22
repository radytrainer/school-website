"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Plus, Edit, Trash2, Loader2, Save, User, FileText, Users, Milestone as MilestoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { getLocalizedText, resolveImageUrl } from "@/lib/utils";
import { upsertSchoolInfo } from "@/actions/settings";
import { getAdminLeadershipList, deleteLeadership } from "@/actions/leadership";
import { getAdminMilestonesList, deleteMilestone } from "@/actions/milestones";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { Leadership, Milestone } from "@/types";

const SECTIONS = [
  { key: "history", label_en: "History", label_km: "ប្រវត្តិសាលា" },
  { key: "vision", label_en: "Vision", label_km: "ចក្ខុវិស័យ" },
  { key: "mission", label_en: "Mission", label_km: "បេសកកម្ម" },
  { key: "values", label_en: "Core Values", label_km: "គុណតម្លៃស្នូល" },
] as const;

export default function AdminAboutPage() {
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [schoolInfo, setSchoolInfo] = useState<Record<string, { km: string; en: string }>>({});
  const [leadership, setLeadership] = useState<Leadership[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: info }, leaders, ms] = await Promise.all([
      supabase.from("school_info").select("*"),
      getAdminLeadershipList(),
      getAdminMilestonesList(),
    ]);

    const infoMap: Record<string, { km: string; en: string }> = {};
    (info ?? []).forEach((i: { section: string; content_km: string; content_en: string }) => {
      infoMap[i.section] = { km: i.content_km ?? "", en: i.content_en ?? "" };
    });
    setSchoolInfo(infoMap);
    setLeadership(leaders);
    setMilestones(ms);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaveSection = async (section: string) => {
    setSaving(section);
    const info = schoolInfo[section] ?? { km: "", en: "" };
    const result = await upsertSchoolInfo(section, info.km, info.en);
    setSaving(null);
    if (result.success) toast.success("Saved");
    else toast.error(result.error ?? "Failed to save");
  };

  const handleDeleteLeader = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const result = await deleteLeadership(id);
    if (result.success) { toast.success("Leader deleted"); fetchAll(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  const handleDeleteMilestone = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const result = await deleteMilestone(id);
    if (result.success) { toast.success("Milestone deleted"); fetchAll(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === "km" ? "គ្រប់គ្រងទំព័រអំពីសាលា" : "About Page Management"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {locale === "km"
            ? "គ្រប់គ្រងមាតិកា គណៈគ្រប់គ្រង និងដំណាក់កាលសំខាន់ៗ សម្រាប់ទំព័រអំពីសាលាសាធារណៈ"
            : "Manage the content, leadership, and milestones shown on the public About page"}
        </p>
      </div>

      <Tabs defaultValue="content">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="content" className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />Content</TabsTrigger>
          <TabsTrigger value="leadership" className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Leadership</TabsTrigger>
          <TabsTrigger value="milestones" className="flex items-center gap-1.5"><MilestoneIcon className="w-3.5 h-3.5" />Milestones</TabsTrigger>
        </TabsList>

        {/* ── Content ── */}
        <TabsContent value="content" className="space-y-5 mt-4">
          {SECTIONS.map(({ key, label_en, label_km }) => (
            <div key={key} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">{locale === "km" ? label_km : label_en}</h2>
                <Button size="sm" onClick={() => handleSaveSection(key)} disabled={saving === key}>
                  {saving === key ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                  Save
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">ខ្មែរ</label>
                  <RichTextEditor
                    khmer
                    value={schoolInfo[key]?.km ?? ""}
                    onChange={(html) => setSchoolInfo((p) => ({ ...p, [key]: { ...(p[key] ?? { km: "", en: "" }), km: html } }))}
                    placeholder="សរសេរមាតិកា..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">English</label>
                  <RichTextEditor
                    value={schoolInfo[key]?.en ?? ""}
                    onChange={(html) => setSchoolInfo((p) => ({ ...p, [key]: { ...(p[key] ?? { km: "", en: "" }), en: html } }))}
                    placeholder="Write content..."
                  />
                </div>
              </div>
              {key === "values" && (
                <p className="text-xs text-gray-400">
                  Tip: use a bulleted list (the list button in the toolbar) — each item becomes a value shown on the public page.
                </p>
              )}
            </div>
          ))}
        </TabsContent>

        {/* ── Leadership ── */}
        <TabsContent value="leadership" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">{leadership.length} members</p>
            <Button asChild size="sm" className="bg-school-blue-800 hover:bg-school-blue-900">
              <Link href={`/${locale}/admin/about/leadership/new`}>
                <Plus className="w-4 h-4 mr-1.5" />
                {locale === "km" ? "បន្ថែម" : "Add Leader"}
              </Link>
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {leadership.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No leadership members yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 w-12">#</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 w-12">Photo</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Position</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leadership.map((leader) => {
                      const name = getLocalizedText(leader.name_km, leader.name_en, locale);
                      return (
                        <tr key={leader.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-400">{leader.sort_order}</td>
                          <td className="px-4 py-3">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center">
                              {leader.photo_url ? (
                                <Image src={resolveImageUrl(leader.photo_url)} alt="" fill className="object-cover object-top" />
                              ) : (
                                <User className="w-4 h-4 text-gray-300" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className={`font-medium text-gray-900 ${locale === "km" ? "font-khmer" : ""}`}>{name}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {getLocalizedText(leader.position_km, leader.position_en, locale)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={leader.is_active ? "success" : "warning"} className="text-xs">
                              {leader.is_active ? "Active" : "Hidden"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                <Link href={`/${locale}/admin/about/leadership/${leader.id}`}>
                                  <Edit className="w-4 h-4 text-blue-500" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteLeader(leader.id, name)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Milestones ── */}
        <TabsContent value="milestones" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">{milestones.length} milestones</p>
            <Button asChild size="sm" className="bg-school-blue-800 hover:bg-school-blue-900">
              <Link href={`/${locale}/admin/about/milestones/new`}>
                <Plus className="w-4 h-4 mr-1.5" />
                {locale === "km" ? "បន្ថែម" : "Add Milestone"}
              </Link>
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {milestones.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No milestones yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 w-12">#</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 w-10"></th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 w-24">Year</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {milestones.map((m) => {
                      const title = getLocalizedText(m.title_km, m.title_en, locale);
                      return (
                        <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-400">{m.sort_order}</td>
                          <td className="px-4 py-3">
                            <span className="block w-3 h-3 rounded-full" style={{ background: m.color }} />
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">{m.year}</td>
                          <td className="px-4 py-3">
                            <p className={`text-gray-900 max-w-[380px] ${locale === "km" ? "font-khmer" : ""}`}>{title}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={m.is_active ? "success" : "warning"} className="text-xs">
                              {m.is_active ? "Active" : "Hidden"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                <Link href={`/${locale}/admin/about/milestones/${m.id}`}>
                                  <Edit className="w-4 h-4 text-blue-500" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteMilestone(m.id, title)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
