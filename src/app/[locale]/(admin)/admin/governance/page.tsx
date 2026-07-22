"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Plus, Edit, Trash2, Loader2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GovernanceItem, GovernanceSection } from "@/types";
import { getLocalizedText } from "@/lib/utils";
import { toast } from "sonner";
import { deleteGovernanceItem, getAdminGovernanceList } from "@/actions/governance";
import { getGovernanceIcon } from "@/lib/governance-icons";

const SECTIONS: { value: GovernanceSection; label_en: string; label_km: string }[] = [
  { value: "structure", label_en: "Structure & Management Systems", label_km: "រចនាសម្ព័ន្ធ និងប្រព័ន្ធគ្រប់គ្រង" },
  { value: "culture", label_en: "Learning Activities & Student Growth", label_km: "សកម្មភាពសិក្សា និងអភិវឌ្ឍន៍សិស្ស" },
];

export default function AdminGovernancePage() {
  const locale = useLocale();
  const [items, setItems] = useState<GovernanceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setItems(await getAdminGovernanceList());
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const result = await deleteGovernanceItem(id);
    if (result.success) { toast.success("Item deleted"); fetchItems(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === "km" ? "គ្រប់គ្រងអភិបាលកិច្ច" : "Governance Management"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {locale === "km"
            ? "គ្រប់គ្រងមាតិកា សម្រាប់ទំព័រអភិបាលកិច្ចសាធារណៈ"
            : "Manage the two content lists shown on the public Governance page"}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
        </div>
      ) : (
        SECTIONS.map((section) => {
          const sectionItems = items.filter((i) => i.section === section.value);
          return (
            <div key={section.value} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {locale === "km" ? section.label_km : section.label_en}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">{sectionItems.length} items</p>
                </div>
                <Button asChild size="sm" className="bg-school-blue-800 hover:bg-school-blue-900">
                  <Link href={`/${locale}/admin/governance/new?section=${section.value}`}>
                    <Plus className="w-4 h-4 mr-1.5" />
                    {locale === "km" ? "បន្ថែម" : "Add Item"}
                  </Link>
                </Button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {sectionItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    {locale === "km" ? "មិនទាន់មានធាតុទេ" : "No items yet"}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-gray-500 w-12">#</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500 w-12">Icon</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                          <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {sectionItems.map((item) => {
                          const title = getLocalizedText(item.title_km, item.title_en, locale);
                          const Icon = getGovernanceIcon(item.icon);
                          return (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-gray-400">{item.sort_order}</td>
                              <td className="px-4 py-3">
                                <div className="w-8 h-8 rounded-lg bg-school-blue-50 flex items-center justify-center">
                                  <Icon className="w-4 h-4 text-school-blue-800" />
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <p className={`font-medium text-gray-900 max-w-[440px] ${locale === "km" ? "font-khmer" : ""}`}>
                                  {title}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={item.is_active ? "success" : "warning"} className="text-xs">
                                  {item.is_active ? "Active" : "Hidden"}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                    <Link href={`/${locale}/admin/governance/${item.id}`}>
                                      <Edit className="w-4 h-4 text-blue-500" />
                                    </Link>
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id, title)}>
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
            </div>
          );
        })
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <Landmark className="w-8 h-8 mx-auto mb-2 opacity-40" />
          {locale === "km" ? "មិនទាន់មានទិន្នន័យអភិបាលកិច្ចទេ" : "No governance content yet"}
        </div>
      )}
    </div>
  );
}
