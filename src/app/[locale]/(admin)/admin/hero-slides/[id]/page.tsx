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
import { heroSlideSchema, type HeroSlideInput } from "@/lib/validations";
import { createHeroSlide, updateHeroSlide, getAdminHeroSlideById } from "@/actions/hero-slides";

interface PageProps { params: Promise<{ id: string }>; }

export default function HeroSlideFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);

  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } =
    useForm<HeroSlideInput>({
      resolver: zodResolver(heroSlideSchema),
      defaultValues: { cta_primary_href: "/contact", cta_secondary_href: "/about", sort_order: 0, is_active: true },
    });

  useEffect(() => {
    if (!isNew) {
      getAdminHeroSlideById(id).then((data) => {
        if (data) Object.entries(data).forEach(([k, v]) => { if (v !== null) setValue(k as keyof HeroSlideInput, v as string); });
        setLoading(false);
      });
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: HeroSlideInput) => {
    const result = isNew ? await createHeroSlide(data) : await updateHeroSlide(id, data);
    if (result.success) { toast.success(isNew ? "Slide created!" : "Slide updated!"); router.push(`/${locale}/admin/hero-slides`); }
    else toast.error(result.error ?? "Failed to save");
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/hero-slides`}><ArrowLeft className="w-4 h-4 mr-1" />{locale === "km" ? "ត្រឡប់" : "Back"}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? (locale === "km" ? "បន្ថែមស្លាយ" : "New Slide") : (locale === "km" ? "កែស្លាយ" : "Edit Slide")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Content</h2>

              <div className="space-y-1.5">
                <Label>ចំណងជើង (ខ្មែរ) *</Label>
                <Input {...register("title_km")} className="font-khmer" placeholder="ចំណងជើងស្លាយ" />
                {errors.title_km && <p className="text-xs text-red-500">{errors.title_km.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Title (English) *</Label>
                <Input {...register("title_en")} placeholder="Slide title" />
                {errors.title_en && <p className="text-xs text-red-500">{errors.title_en.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>អត្ថបទរង (ខ្មែរ)</Label>
                  <textarea {...register("subtitle_km")} rows={3} className="font-khmer w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="អត្ថបទរង..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Subtitle (English)</Label>
                  <textarea {...register("subtitle_en")} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Subtitle..." />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Background Image</h2>
              <div className="space-y-1.5">
                <Label>Image URL</Label>
                <Input {...register("image_url")} placeholder="https://drive.google.com/... or direct image link" />
                <p className="text-xs text-gray-400">Paste a Google Drive share link or a direct image URL. Leave blank to use a decorative gradient background instead.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Buttons</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ប៊ូតុងចម្បង (ខ្មែរ)</Label>
                  <Input {...register("cta_primary_km")} className="font-khmer" placeholder="ចុះឈ្មោះ" />
                </div>
                <div className="space-y-1.5">
                  <Label>Primary Button (English)</Label>
                  <Input {...register("cta_primary_en")} placeholder="Enroll Now" />
                </div>
                <div className="space-y-1.5">
                  <Label>តំណប៊ូតុងចម្បង</Label>
                  <Input {...register("cta_primary_href")} placeholder="/contact" />
                </div>
                <div className="space-y-1.5">
                  <Label>ប៊ូតុងទី២ (ខ្មែរ)</Label>
                  <Input {...register("cta_secondary_km")} className="font-khmer" placeholder="មើលព័ត៌មាន" />
                </div>
                <div className="space-y-1.5">
                  <Label>Secondary Button (English)</Label>
                  <Input {...register("cta_secondary_en")} placeholder="View Prospectus" />
                </div>
                <div className="space-y-1.5">
                  <Label>តំណប៊ូតុងទី២</Label>
                  <Input {...register("cta_secondary_href")} placeholder="/about" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Settings</h2>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" {...register("sort_order")} placeholder="0" />
                <p className="text-xs text-gray-400">Lower numbers show first. Only the first 5 active slides appear on the homepage.</p>
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
              {isNew ? "Create Slide" : "Update Slide"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
