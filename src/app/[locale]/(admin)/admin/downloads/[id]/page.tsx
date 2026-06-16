"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { downloadSchema, type DownloadInput } from "@/lib/validations";
import { createDownload, updateDownload } from "@/actions/downloads";
import { supabase } from "@/lib/supabase";
import type { DownloadCategory } from "@/types";

interface PageProps { params: Promise<{ id: string }>; }

export default function DownloadFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);
  const [categories, setCategories] = useState<DownloadCategory[]>([]);

  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } =
    useForm<DownloadInput>({ resolver: zodResolver(downloadSchema), defaultValues: { status: "draft" } });

  useEffect(() => {
    const init = async () => {
      const { data: cats } = await supabase.from("download_categories").select("*").order("sort_order");
      setCategories((cats ?? []) as DownloadCategory[]);
      if (!isNew) {
        const { data } = await supabase.from("downloads").select("*").eq("id", id).single();
        if (data) Object.entries(data).forEach(([k, v]) => { if (v !== null) setValue(k as keyof DownloadInput, v as string); });
        setLoading(false);
      }
    };
    init();
  }, [id, isNew, setValue]);

  const onSubmit = async (data: DownloadInput) => {
    const result = isNew ? await createDownload(data) : await updateDownload(id, data);
    if (result.success) { toast.success(isNew ? "File added!" : "File updated!"); router.push(`/${locale}/admin/downloads`); }
    else toast.error(result.error ?? "Failed to save");
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/downloads`}><ArrowLeft className="w-4 h-4 mr-1" />{locale === "km" ? "ត្រឡប់" : "Back"}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? (locale === "km" ? "បន្ថែមឯកសារ" : "Add File") : (locale === "km" ? "កែឯកសារ" : "Edit File")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">File Info</h2>
              <div className="space-y-1.5">
                <Label>ចំណងជើង (ខ្មែរ) *</Label>
                <Input {...register("title_km")} className="font-khmer" placeholder="ចំណងជើងឯកសារ" />
                {errors.title_km && <p className="text-xs text-red-500">{errors.title_km.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Title (English) *</Label>
                <Input {...register("title_en")} placeholder="File title" />
                {errors.title_en && <p className="text-xs text-red-500">{errors.title_en.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ការពិពណ៌នា (ខ្មែរ)</Label>
                  <textarea {...register("description_km")} rows={3} className="font-khmer w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="ការពិពណ៌នា..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Description (English)</Label>
                  <textarea {...register("description_en")} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Description..." />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>File URL *</Label>
                <Input {...register("file_url")} placeholder="https://..." />
                {errors.file_url && <p className="text-xs text-red-500">{errors.file_url.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>File Type</Label>
                  <Input {...register("file_type")} placeholder="application/pdf" />
                </div>
                <div className="space-y-1.5">
                  <Label>File Size (bytes)</Label>
                  <Input type="number" {...register("file_size", { valueAsNumber: true })} placeholder="0" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Settings</h2>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Controller name="status" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Controller name="category_id" control={control} render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No category</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{locale === "km" ? cat.name_km : cat.name_en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-1.5">
                <Label>Academic Year</Label>
                <Input {...register("academic_year")} placeholder="2023-2024" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-school-blue-800 hover:bg-school-blue-900" disabled={isSubmitting} size="lg">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isNew ? "Add File" : "Update File"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
