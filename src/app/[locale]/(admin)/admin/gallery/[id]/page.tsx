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
import { gallerySchema, type GalleryInput } from "@/lib/validations";
import { createGalleryItem, updateGalleryItem } from "@/actions/gallery";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface PageProps { params: Promise<{ id: string }>; }

export default function GalleryFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);
  const [previewUrl, setPreviewUrl] = useState("");

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<GalleryInput>({ resolver: zodResolver(gallerySchema), defaultValues: { status: "draft", media_type: "image" } });

  const imageUrl = watch("image_url");
  useEffect(() => { if (imageUrl) setPreviewUrl(imageUrl); }, [imageUrl]);

  useEffect(() => {
    if (!isNew) {
      supabase.from("gallery").select("*").eq("id", id).single().then(({ data }) => {
        if (data) {
          Object.entries(data).forEach(([k, v]) => { if (v !== null) setValue(k as keyof GalleryInput, v as string); });
          if (data.image_url) setPreviewUrl(data.image_url as string);
        }
        setLoading(false);
      });
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: GalleryInput) => {
    const result = isNew ? await createGalleryItem(data) : await updateGalleryItem(id, data);
    if (result.success) { toast.success(isNew ? "Gallery item created!" : "Gallery item updated!"); router.push(`/${locale}/admin/gallery`); }
    else toast.error(result.error ?? "Failed to save");
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/gallery`}><ArrowLeft className="w-4 h-4 mr-1" />{locale === "km" ? "ត្រឡប់" : "Back"}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? (locale === "km" ? "បន្ថែមរូបភាព" : "Add Image") : (locale === "km" ? "កែរូបភាព" : "Edit Image")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Content</h2>
              <div className="space-y-1.5">
                <Label>ចំណងជើង (ខ្មែរ)</Label>
                <Input {...register("title_km")} className="font-khmer" placeholder="ចំណងជើង" />
              </div>
              <div className="space-y-1.5">
                <Label>Title (English)</Label>
                <Input {...register("title_en")} placeholder="Image title" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ការពិពណ៌នា (ខ្មែរ)</Label>
                  <textarea {...register("caption_km")} rows={3} className="font-khmer w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="ការពិពណ៌នារូប..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Caption (English)</Label>
                  <textarea {...register("caption_en")} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Image caption..." />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Image URL *</Label>
                <Input {...register("image_url")} placeholder="https://..." />
                {errors.image_url && <p className="text-xs text-red-500">{errors.image_url.message}</p>}
              </div>
              {previewUrl && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border">
                  <Image src={previewUrl} alt="Preview" fill className="object-contain" />
                </div>
              )}
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
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input {...register("category")} placeholder="e.g. sports, events" />
              </div>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" {...register("sort_order", { valueAsNumber: true })} placeholder="0" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-school-blue-800 hover:bg-school-blue-900" disabled={isSubmitting} size="lg">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isNew ? "Add to Gallery" : "Update Image"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
