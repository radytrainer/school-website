"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft, Save, Loader2, FileEdit, Link2, SlidersHorizontal,
  FileText, FileSpreadsheet, File as FileIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { documentSchema, type DocumentInput } from "@/lib/validations";
import { createDocument, updateDocument, getAdminDocumentById } from "@/actions/documents";
import { getFileExtension } from "@/lib/utils";

interface PageProps { params: Promise<{ id: string }>; }

function FileNamePreview({ fileName }: { fileName: string }) {
  const ext = getFileExtension(fileName || "");
  if (!fileName) return null;

  let Icon = FileIcon;
  let color = "text-gray-400";
  let bg = "bg-gray-100";
  if (ext === "pdf") { Icon = FileText; color = "text-red-500"; bg = "bg-red-50"; }
  else if (ext === "doc" || ext === "docx") { Icon = FileText; color = "text-blue-600"; bg = "bg-blue-50"; }
  else if (ext === "xls" || ext === "xlsx") { Icon = FileSpreadsheet; color = "text-green-600"; bg = "bg-green-50"; }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${bg} ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {ext ? ext.toUpperCase() : "FILE"}
    </div>
  );
}

export default function DocumentFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<DocumentInput>({ resolver: zodResolver(documentSchema), defaultValues: { category: "other", is_active: true, sort_order: 0 } });

  const fileName = watch("file_name");

  useEffect(() => {
    if (!isNew) {
      getAdminDocumentById(id).then((data) => {
        if (data) Object.entries(data).forEach(([k, v]) => { if (v !== null) setValue(k as keyof DocumentInput, v as string); });
        setLoading(false);
      });
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: DocumentInput) => {
    const result = isNew ? await createDocument(data) : await updateDocument(id, data);
    if (result.success) { toast.success(isNew ? "Document created!" : "Document updated!"); router.push(`/${locale}/admin/documents`); }
    else toast.error(result.error ?? "Failed to save");
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/documents`}><ArrowLeft className="w-4 h-4 mr-1" />{locale === "km" ? "ត្រឡប់" : "Back"}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? (locale === "km" ? "បន្ថែមឯកសារ" : "New Document") : (locale === "km" ? "កែឯកសារ" : "Edit Document")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                <FileEdit className="w-4 h-4 text-school-blue-800" /> Content
              </h2>

              <div className="space-y-1.5">
                <Label>ចំណងជើង (ខ្មែរ) *</Label>
                <Input {...register("title_km")} className="font-khmer" placeholder="ចំណងជើងឯកសារ" />
                {errors.title_km && <p className="text-xs text-red-500">{errors.title_km.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Title (English) *</Label>
                <Input {...register("title_en")} placeholder="Document title" />
                {errors.title_en && <p className="text-xs text-red-500">{errors.title_en.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ការពិពណ៌នា (ខ្មែរ)</Label>
                  <textarea {...register("description_km")} rows={4} className="font-khmer w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="ការពិពណ៌នា..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Description (English)</Label>
                  <textarea {...register("description_en")} rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Description..." />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                <Link2 className="w-4 h-4 text-school-blue-800" /> File
              </h2>
              <div className="space-y-1.5">
                <Label>File URL *</Label>
                <Input {...register("file_url")} placeholder="https://drive.google.com/... or direct file link" />
                <p className="text-xs text-gray-400">Paste a Google Drive share link or a direct file URL.</p>
                {errors.file_url && <p className="text-xs text-red-500">{errors.file_url.message}</p>}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>File Name *</Label>
                  <FileNamePreview fileName={fileName} />
                </div>
                <Input {...register("file_name")} placeholder="Annual-Report-2025.pdf" />
                <p className="text-xs text-gray-400">Display name shown to visitors, including the extension.</p>
                {errors.file_name && <p className="text-xs text-red-500">{errors.file_name.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                <SlidersHorizontal className="w-4 h-4 text-school-blue-800" /> Settings
              </h2>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Controller name="category" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="result">Exam Results</SelectItem>
                      <SelectItem value="form">Form</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" {...register("sort_order")} placeholder="0" />
                <p className="text-xs text-gray-400">Lower numbers appear first on the public page.</p>
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Controller name="is_active" control={control} render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )} />
              </div>
            </div>

            <Button type="submit" className="w-full bg-school-blue-800 hover:bg-school-blue-900" disabled={isSubmitting} size="lg">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isNew ? "Create Document" : "Update Document"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
