"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Plus, Search, Edit, Trash2, Loader2, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { HeroSlide } from "@/types";
import { getLocalizedText, resolveImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { deleteHeroSlide, getAdminHeroSlidesList } from "@/actions/hero-slides";

export default function AdminHeroSlidesPage() {
  const locale = useLocale();
  const [items, setItems] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    let list = await getAdminHeroSlidesList();
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.title_en?.toLowerCase().includes(q) || s.title_km?.toLowerCase().includes(q));
    }
    setItems(list);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const result = await deleteHeroSlide(id);
    if (result.success) { toast.success("Slide deleted"); fetchItems(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === "km" ? "គ្រប់គ្រងស្លាយដើមទំព័រ" : "Hero Slideshow"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {items.length} {locale === "km" ? "ស្លាយ" : "slides"} · {locale === "km" ? "បង្ហាញកំពូល ៥ ស្លាយសកម្ម" : "top 5 active slides shown on the homepage"}
          </p>
        </div>
        <Button asChild className="bg-school-blue-800 hover:bg-school-blue-900">
          <Link href={`/${locale}/admin/hero-slides/new`}>
            <Plus className="w-4 h-4 mr-2" />
            {locale === "km" ? "បន្ថែម" : "New Slide"}
          </Link>
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input placeholder={locale === "km" ? "ស្វែងរក..." : "Search..."} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Images className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>{locale === "km" ? "រកមិនឃើញ" : "No slides found"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 w-12">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Slide</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Sort Order</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, i) => {
                  const title = getLocalizedText(item.title_km, item.title_en, locale);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <div className="w-16 h-10 rounded overflow-hidden shrink-0 bg-gray-100">
                              <Image src={resolveImageUrl(item.image_url)} alt={title} width={64} height={40} className="object-cover w-full h-full" />
                            </div>
                          ) : (
                            <div className="w-16 h-10 rounded shrink-0" style={{ background: item.gradient }} />
                          )}
                          <p className={`font-medium text-gray-900 truncate max-w-[220px] ${locale === "km" ? "font-khmer" : ""}`}>{title}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500">{item.sort_order}</td>
                      <td className="px-4 py-3">
                        <Badge variant={item.is_active ? "success" : "destructive"} className="text-xs">
                          {item.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={`/${locale}/admin/hero-slides/${item.id}`} aria-label="Edit"><Edit className="w-4 h-4 text-blue-500" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Delete" onClick={() => handleDelete(item.id, title)}>
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
