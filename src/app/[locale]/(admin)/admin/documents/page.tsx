"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Plus, Search, Edit, Trash2, Loader2, FileText, FileSpreadsheet, File as FileIcon, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Document, DocumentCategory } from "@/types";
import { getLocalizedText, getFileExtension } from "@/lib/utils";
import { toast } from "sonner";
import { deleteDocument, getAdminDocumentsList } from "@/actions/documents";

const CATEGORY_COLORS: Record<DocumentCategory, string> = {
  report: "bg-blue-50 text-blue-700",
  result: "bg-purple-50 text-purple-700",
  form: "bg-green-50 text-green-700",
  policy: "bg-orange-50 text-orange-700",
  other: "bg-gray-100 text-gray-600",
};

const CATEGORIES: DocumentCategory[] = ["report", "result", "form", "policy", "other"];

function FileTypeIcon({ fileName }: { fileName: string }) {
  const ext = getFileExtension(fileName);
  if (ext === "pdf") return <FileText className="w-4 h-4 text-red-500 shrink-0" />;
  if (ext === "doc" || ext === "docx") return <FileText className="w-4 h-4 text-blue-600 shrink-0" />;
  if (ext === "xls" || ext === "xlsx") return <FileSpreadsheet className="w-4 h-4 text-green-600 shrink-0" />;
  return <FileIcon className="w-4 h-4 text-gray-400 shrink-0" />;
}

export default function AdminDocumentsPage() {
  const locale = useLocale();
  const [items, setItems] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | "all">("all");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    let list = await getAdminDocumentsList();
    if (categoryFilter !== "all") list = list.filter((d) => d.category === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((d) => d.title_en?.toLowerCase().includes(q) || d.title_km?.toLowerCase().includes(q));
    }
    setItems(list);
    setLoading(false);
  }, [categoryFilter, search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const result = await deleteDocument(id);
    if (result.success) { toast.success("Document deleted"); fetchItems(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === "km" ? "គ្រប់គ្រងឯកសារ" : "Documents Management"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} documents</p>
        </div>
        <Button asChild className="bg-school-blue-800 hover:bg-school-blue-900">
          <Link href={`/${locale}/admin/documents/new`}>
            <Plus className="w-4 h-4 mr-2" />
            {locale === "km" ? "បន្ថែម" : "New Document"}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder={locale === "km" ? "ស្វែងរក..." : "Search..."} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={categoryFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter("all")} className={categoryFilter === "all" ? "bg-school-blue-800" : ""}>
            {locale === "km" ? "ទាំងអស់" : "All"}
          </Button>
          {CATEGORIES.map((c) => (
            <Button key={c} variant={categoryFilter === c ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter(c)} className={`capitalize ${categoryFilter === c ? "bg-school-blue-800" : ""}`}>
              {c}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>{locale === "km" ? "រកមិនឃើញ" : "No documents found"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 w-12">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">File</th>
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
                        <p className={`font-medium text-gray-900 truncate max-w-[220px] ${locale === "km" ? "font-khmer" : ""}`}>{title}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${CATEGORY_COLORS[item.category]}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <FileTypeIcon fileName={item.file_name} />
                          <span className="truncate max-w-[160px]">{item.file_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={item.is_active ? "success" : "destructive"} className="text-xs">
                          {item.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={`/${locale}/admin/documents/${item.id}`} aria-label="Edit"><Edit className="w-4 h-4 text-blue-500" /></Link>
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
