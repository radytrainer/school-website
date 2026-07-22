"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Plus, Edit, Trash2, Loader2, Save, FileText, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getLocalizedText } from "@/lib/utils";
import {
  getAdminReportSectionsList,
  deleteReportSection,
  getAdminReportMeta,
  updateReportMeta,
} from "@/actions/report";
import type { ReportSectionRecord } from "@/types";
import type { ReportMetaInput } from "@/lib/validations";

export default function AdminReportPage() {
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<ReportSectionRecord[]>([]);
  const [meta, setMeta] = useState<ReportMetaInput>({ academicYear: "", reportDate_km: "", reportDate_en: "" });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [sectionRows, metaRow] = await Promise.all([getAdminReportSectionsList(), getAdminReportMeta()]);
    setSections(sectionRows);
    setMeta(metaRow);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete section "${title}"? This cannot be undone.`)) return;
    const result = await deleteReportSection(id);
    if (result.success) { toast.success("Section deleted"); fetchAll(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  const handleSaveMeta = async () => {
    setSaving(true);
    const result = await updateReportMeta(meta);
    setSaving(false);
    if (result.success) toast.success("Saved");
    else toast.error(result.error ?? "Failed to save");
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
          {locale === "km" ? "គ្រប់គ្រងរបាយការណ៍ប្រតិបត្តិការសាលា" : "School Report Management"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {locale === "km"
            ? "គ្រប់គ្រងខ្លឹមសារនីមួយៗនៃរបាយការណ៍ប្រតិបត្តិការសាលា (18 ផ្នែក) ដែលបង្ហាញនៅទំព័រសាធារណៈ"
            : "Manage the content of each section in the public School Operations Report (18 Ministry-format sections)"}
        </p>
      </div>

      <Tabs defaultValue="sections">
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="sections" className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />Sections</TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-1.5"><Settings2 className="w-3.5 h-3.5" />Report Info</TabsTrigger>
        </TabsList>

        {/* ── Sections ── */}
        <TabsContent value="sections" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">{sections.length} sections</p>
            <Button asChild size="sm" className="bg-school-blue-800 hover:bg-school-blue-900">
              <Link href={`/${locale}/admin/report/new`}>
                <Plus className="w-4 h-4 mr-1.5" />
                {locale === "km" ? "បន្ថែមផ្នែក" : "Add Section"}
              </Link>
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {sections.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No sections yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 w-14">#</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 w-28">Subsections</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 w-24">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sections.map((section) => {
                      const title = getLocalizedText(section.title_km, section.title_en, locale);
                      const blockCount = section.subsections.reduce((sum, s) => sum + s.blocks.length, 0);
                      return (
                        <tr key={section.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <span
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ background: "#eef3ff", color: "#00376f" }}
                            >
                              {section.number}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className={`font-medium text-gray-900 max-w-[420px] ${locale === "km" ? "font-khmer" : ""}`}>{title}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {section.subsections.length} sub · {blockCount} blocks
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={section.is_active ? "success" : "warning"} className="text-xs">
                              {section.is_active ? "Active" : "Hidden"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                <Link href={`/${locale}/admin/report/${section.id}`}>
                                  <Edit className="w-4 h-4 text-blue-500" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(section.id, title)}>
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

        {/* ── Report Info ── */}
        <TabsContent value="info" className="space-y-4 mt-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 max-w-lg">
            <h2 className="font-semibold text-gray-900">Report Metadata</h2>
            <p className="text-xs text-gray-400">
              Shown in the hero banner of the public School Operations Report page.
            </p>
            <div className="space-y-1.5">
              <Label>Academic Year</Label>
              <Input value={meta.academicYear} onChange={(e) => setMeta({ ...meta, academicYear: e.target.value })} placeholder="2024-2025" />
            </div>
            <div className="space-y-1.5">
              <Label>ថ្ងៃខែធ្វើបច្ចុប្បន្នភាព (ខ្មែរ)</Label>
              <Input
                className="font-khmer"
                value={meta.reportDate_km}
                onChange={(e) => setMeta({ ...meta, reportDate_km: e.target.value })}
                placeholder="ថ្ងៃទី១៦ ខែកុម្ភៈ ឆ្នាំ២០២៦"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Last Updated Date (English)</Label>
              <Input
                value={meta.reportDate_en}
                onChange={(e) => setMeta({ ...meta, reportDate_en: e.target.value })}
                placeholder="16 February 2026"
              />
            </div>
            <Button size="sm" onClick={handleSaveMeta} disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
              Save
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
