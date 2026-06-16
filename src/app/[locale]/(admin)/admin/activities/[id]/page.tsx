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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { activitySchema, type ActivityInput } from "@/lib/validations";
import { createActivity, updateActivity } from "@/actions/activities";
import type { ActivityCategory } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ActivityFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [loading, setLoading] = useState(!isNew);

  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } =
    useForm<ActivityInput>({
      resolver: zodResolver(activitySchema),
      defaultValues: { status: "draft", is_featured: false },
    });

  useEffect(() => {
    const init = async () => {
      const { data: cats } = await supabase.from("activity_categories").select("*").order("sort_order");
      setCategories((cats ?? []) as ActivityCategory[]);

      if (!isNew) {
        const { data } = await supabase.from("activities").select("*").eq("id", id).single();
        if (data) Object.entries(data).forEach(([k, v]) => { if (v !== null) setValue(k as keyof ActivityInput, v as string); });
        setLoading(false);
      }
    };
    init();
  }, [id, isNew, setValue]);

  const onSubmit = async (data: ActivityInput) => {
    const result = isNew ? await createActivity(data) : await updateActivity(id, data);
    if (result.success) {
      toast.success(isNew ? "Activity created!" : "Activity updated!");
      router.push(`/${locale}/admin/activities`);
    } else {
      toast.error(result.error ?? "Failed to save");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/activities`}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            {locale === "km" ? "ត្រឡប់" : "Back"}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? (locale === "km" ? "បន្ថែមសកម្មភាព" : "New Activity") : (locale === "km" ? "កែសកម្មភាព" : "Edit Activity")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Content</h2>

              <div className="space-y-1.5">
                <Label>ចំណងជើង (ខ្មែរ) *</Label>
                <Input {...register("title_km")} className="font-khmer" placeholder="ចំណងជើងសកម្មភាព" />
                {errors.title_km && <p className="text-xs text-red-500">{errors.title_km.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Title (English) *</Label>
                <Input {...register("title_en")} placeholder="Activity title" />
                {errors.title_en && <p className="text-xs text-red-500">{errors.title_en.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Activity Date</Label>
                  <Input type="date" {...register("activity_date")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Input {...register("location")} placeholder="Location" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>សង្ខេប (ខ្មែរ)</Label>
                  <textarea {...register("description_km")} rows={4} className="font-khmer w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="ការពិពណ៌នា..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Description (English)</Label>
                  <textarea {...register("description_en")} rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Activity description..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>មាតិកា (ខ្មែរ)</Label>
                  <textarea {...register("content_km")} rows={8} className="font-khmer w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="HTML មាតិកា..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Content (English)</Label>
                  <textarea {...register("content_en")} rows={8} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="HTML content..." />
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
              <div className="flex items-center justify-between">
                <Label>Featured</Label>
                <Controller name="is_featured" control={control} render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">Category</h2>
              <Controller name="category_id" control={control} render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {locale === "km" ? cat.name_km : cat.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">Image</h2>
              <Input {...register("featured_image")} placeholder="Image URL" />
            </div>

            <Button type="submit" className="w-full bg-school-blue-800 hover:bg-school-blue-900" disabled={isSubmitting} size="lg">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isNew ? "Create Activity" : "Update Activity"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
