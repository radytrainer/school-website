"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Plus, Search, Edit, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import type { Gallery } from "@/types";
import { formatShortDate, getLocalizedText } from "@/lib/utils";
import { toast } from "sonner";
import { deleteGalleryItem } from "@/actions/gallery";

const STATUS_COLORS: Record<string, "default" | "success" | "warning" | "destructive"> = {
  published: "success",
  draft: "warning",
  archived: "destructive",
};

export default function AdminGalleryPage() {
  const locale = useLocale();
  const [items, setItems] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("gallery").select("*").order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data } = await query;
    let list = (data ?? []) as Gallery[];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((g) => g.title_en?.toLowerCase().includes(q) || g.title_km?.toLowerCase().includes(q));
    }
    setItems(list);
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const result = await deleteGalleryItem(id);
    if (result.success) { toast.success("Gallery item deleted"); fetchItems(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === "km" ? "គ្រប់គ្រងវិចិត្រសាល" : "Gallery Management"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} items</p>
        </div>
        <Button asChild className="bg-school-blue-800 hover:bg-school-blue-900">
          <Link href={`/${locale}/admin/gallery/new`}>
            <Plus className="w-4 h-4 mr-2" />
            {locale === "km" ? "បន្ថែម" : "Add Image"}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder={locale === "km" ? "ស្វែងរក..." : "Search gallery..."} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {["all", "published", "draft"].map((s) => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-school-blue-800" : ""}>
              {s === "all" ? (locale === "km" ? "ទាំងអស់" : "All") : s}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">{locale === "km" ? "រកមិនឃើញ" : "No gallery items found"}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item) => {
            const title = getLocalizedText(item.title_km, item.title_en, locale);
            return (
              <div key={item.id} className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="aspect-square relative bg-gray-100">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={title} fill className="object-cover" sizes="200px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button asChild variant="secondary" size="icon" className="h-8 w-8">
                      <Link href={`/${locale}/admin/gallery/${item.id}`}><Edit className="w-3.5 h-3.5" /></Link>
                    </Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id, title)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  <p className={`text-xs font-medium text-gray-700 truncate ${locale === "km" ? "font-khmer" : ""}`}>{title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant={STATUS_COLORS[item.status] ?? "default"} className="text-[10px]">{item.status}</Badge>
                    <span className="text-[10px] text-gray-400">{formatShortDate(item.created_at, locale)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
