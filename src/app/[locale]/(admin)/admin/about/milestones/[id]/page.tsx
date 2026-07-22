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
import { milestoneSchema, type MilestoneInput } from "@/lib/validations";
import { createMilestone, updateMilestone, getAdminMilestoneById } from "@/actions/milestones";

interface PageProps { params: Promise<{ id: string }>; }

const PRESET_COLORS = ["#00376f", "#c0392b", "#fdbc13", "#0f766e", "#7c3aed"];

export default function MilestoneFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<MilestoneInput>({
      resolver: zodResolver(milestoneSchema),
      defaultValues: { color: "#00376f", is_active: true, sort_order: 0 },
    });

  const color = watch("color");

  useEffect(() => {
    if (!isNew) {
      getAdminMilestoneById(id).then((data) => {
        if (data) Object.entries(data).forEach(([k, v]) => { if (v !== null) setValue(k as keyof MilestoneInput, v as string); });
        setLoading(false);
      });
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: MilestoneInput) => {
    const result = isNew ? await createMilestone(data) : await updateMilestone(id, data);
    if (result.success) { toast.success(isNew ? "Milestone created!" : "Milestone updated!"); router.push(`/${locale}/admin/about`); }
    else toast.error(result.error ?? "Failed to save");
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/about`}><ArrowLeft className="w-4 h-4 mr-1" />{locale === "km" ? "ត្រឡប់" : "Back"}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? (locale === "km" ? "បន្ថែមដំណាក់កាល" : "New Milestone") : (locale === "km" ? "កែដំណាក់កាល" : "Edit Milestone")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Content</h2>

              <div className="space-y-1.5">
                <Label>Year *</Label>
                <Input {...register("year")} placeholder="e.g. 2000 or 2024–2025" className="max-w-[200px]" />
                {errors.year && <p className="text-xs text-red-500">{errors.year.message}</p>}
              </div>

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
                <Label>Accent Color</Label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setValue("color", c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? "border-gray-900 scale-110" : "border-transparent"}`}
                      style={{ background: c }}
                    />
                  ))}
                  <Controller
                    name="color"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="color"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-7 h-7 rounded-full border border-gray-200 cursor-pointer"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <p className="text-xs text-gray-400">Timeline position (0 = first).</p>
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
              {isNew ? "Create Milestone" : "Update Milestone"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
