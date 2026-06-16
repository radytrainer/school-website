"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Plus, Search, Edit, Trash2, Loader2, Pin, AlertTriangle, Calendar, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import type { Notice } from "@/types";
import { formatShortDate, getLocalizedText } from "@/lib/utils";
import { toast } from "sonner";
import { deleteNotice } from "@/actions/notices";

const TYPE_ICON: Record<string, React.ReactNode> = {
  urgent: <AlertTriangle className="w-4 h-4 text-red-500" />,
  exam: <Calendar className="w-4 h-4 text-blue-500" />,
  general: <Bell className="w-4 h-4 text-gray-400" />,
  event: <Calendar className="w-4 h-4 text-green-500" />,
};

const STATUS_COLORS: Record<string, "default" | "success" | "warning" | "destructive"> = {
  published: "success",
  draft: "warning",
  archived: "destructive",
};

export default function AdminNoticesPage() {
  const locale = useLocale();
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("notices").select("*").order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data } = await query;
    let list = (data ?? []) as Notice[];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((n) => n.title_en?.toLowerCase().includes(q) || n.title_km?.toLowerCase().includes(q));
    }
    setItems(list);
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const result = await deleteNotice(id);
    if (result.success) { toast.success("Notice deleted"); fetchItems(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === "km" ? "គ្រប់គ្រងសេចក្តីជូនដំណឹង" : "Notices Management"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} notices</p>
        </div>
        <Button asChild className="bg-school-blue-800 hover:bg-school-blue-900">
          <Link href={`/${locale}/admin/notices/new`}>
            <Plus className="w-4 h-4 mr-2" />
            {locale === "km" ? "បន្ថែម" : "New Notice"}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder={locale === "km" ? "ស្វែងរក..." : "Search..."} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {["all", "published", "draft", "archived"].map((s) => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-school-blue-800" : ""}>
              {s === "all" ? (locale === "km" ? "ទាំងអស់" : "All") : s}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">{locale === "km" ? "រកមិនឃើញ" : "No notices found"}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 w-8"></th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Valid Until</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const title = getLocalizedText(item.title_km, item.title_en, locale);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        {item.is_pinned && <Pin className="w-3.5 h-3.5 text-school-gold-500" />}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {TYPE_ICON[item.notice_type ?? "general"]}
                          <p className={`font-medium text-gray-900 truncate max-w-[220px] ${locale === "km" ? "font-khmer" : ""}`}>{title}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-gray-500 capitalize">{item.notice_type}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">
                        {item.end_date && formatShortDate(item.end_date, locale)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_COLORS[item.status] ?? "default"} className="text-xs capitalize">{item.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={`/${locale}/admin/notices/${item.id}`}><Edit className="w-4 h-4 text-blue-500" /></Link>
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
}
