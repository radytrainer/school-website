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
import { donationUseSchema, type DonationUseInput } from "@/lib/validations";
import { createDonationUse, updateDonationUse, getAdminDonationUseById } from "@/actions/donate";

interface PageProps { params: Promise<{ id: string }>; }

const PRESET_ICONS = ["📚", "💻", "🏆", "🏫", "💙", "🎓", "🍎", "⚽", "🎨", "🔬"];

export default function DonationUseFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<DonationUseInput>({
      resolver: zodResolver(donationUseSchema),
      defaultValues: { icon: "💙", is_active: true, sort_order: 0 },
    });

  const icon = watch("icon");

  useEffect(() => {
    if (!isNew) {
      getAdminDonationUseById(id).then((data) => {
        if (data) Object.entries(data).forEach(([k, v]) => { if (v !== null) setValue(k as keyof DonationUseInput, v as string); });
        setLoading(false);
      });
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: DonationUseInput) => {
    const result = isNew ? await createDonationUse(data) : await updateDonationUse(id, data);
    if (result.success) { toast.success(isNew ? "Card created!" : "Card updated!"); router.push(`/${locale}/admin/donate`); }
    else toast.error(result.error ?? "Failed to save");
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/donate`}><ArrowLeft className="w-4 h-4 mr-1" />{locale === "km" ? "ត្រឡប់" : "Back"}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? (locale === "km" ? "បន្ថែមកាតបរិច្ចាគ" : "New Donation Card") : (locale === "km" ? "កែកាតបរិច្ចាគ" : "Edit Donation Card")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Content</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ចំណងជើង (ខ្មែរ) *</Label>
                  <Input {...register("title_km")} className="font-khmer" placeholder="ចំណងជើង" />
                  {errors.title_km && <p className="text-xs text-red-500">{errors.title_km.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Title (English) *</Label>
                  <Input {...register("title_en")} placeholder="Title" />
                  {errors.title_en && <p className="text-xs text-red-500">{errors.title_en.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ការពិពណ៌នា (ខ្មែរ)</Label>
                  <textarea
                    {...register("description_km")}
                    rows={4}
                    className="font-khmer w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="ការពិពណ៌នា..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Description (English)</Label>
                  <textarea
                    {...register("description_en")}
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Description..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Settings</h2>

              <div className="space-y-1.5">
                <Label>Icon</Label>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {PRESET_ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setValue("icon", emoji)}
                      className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center border transition-colors ${icon === emoji ? "border-school-blue-800 bg-school-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <Input {...register("icon")} placeholder="Or paste any emoji" />
              </div>

              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" min={0} {...register("sort_order")} placeholder="0" />
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
              {isNew ? "Create Card" : "Update Card"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
