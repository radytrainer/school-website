"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { resolveImageUrl } from "@/lib/utils";
import { leadershipSchema, type LeadershipInput } from "@/lib/validations";
import { createLeadership, updateLeadershipMember, getAdminLeadershipById } from "@/actions/leadership";

interface PageProps { params: Promise<{ id: string }>; }

export default function LeadershipFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<LeadershipInput>({
      resolver: zodResolver(leadershipSchema),
      defaultValues: { is_active: true, sort_order: 0 },
    });

  const photoUrl = watch("photo_url");

  useEffect(() => {
    if (!isNew) {
      getAdminLeadershipById(id).then((data) => {
        if (data) Object.entries(data).forEach(([k, v]) => { if (v !== null) setValue(k as keyof LeadershipInput, v as string); });
        setLoading(false);
      });
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: LeadershipInput) => {
    const result = isNew ? await createLeadership(data) : await updateLeadershipMember(id, data);
    if (result.success) { toast.success(isNew ? "Leader created!" : "Leader updated!"); router.push(`/${locale}/admin/about`); }
    else toast.error(result.error ?? "Failed to save");
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/about`}><ArrowLeft className="w-4 h-4 mr-1" />{locale === "km" ? "ត្រឡប់" : "Back"}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? (locale === "km" ? "បន្ថែមអ្នកដឹកនាំ" : "New Leader") : (locale === "km" ? "កែអ្នកដឹកនាំ" : "Edit Leader")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Name</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ឈ្មោះ (ខ្មែរ) *</Label>
                  <Input {...register("name_km")} className="font-khmer" placeholder="ឈ្មោះ" />
                  {errors.name_km && <p className="text-xs text-red-500">{errors.name_km.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Name (English) *</Label>
                  <Input {...register("name_en")} placeholder="Name" />
                  {errors.name_en && <p className="text-xs text-red-500">{errors.name_en.message}</p>}
                </div>
              </div>

              <h2 className="font-semibold text-gray-900 pt-2">Position</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>តួនាទី (ខ្មែរ)</Label>
                  <Input {...register("position_km")} className="font-khmer" placeholder="ឧ. នាយកសាលា" />
                </div>
                <div className="space-y-1.5">
                  <Label>Position (English)</Label>
                  <Input {...register("position_en")} placeholder="e.g. School Principal" />
                </div>
              </div>

              <h2 className="font-semibold text-gray-900 pt-2">Subject Currently Taught (if any)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>មុខវិជ្ជា (ខ្មែរ)</Label>
                  <Input {...register("subject_km")} className="font-khmer" placeholder="ឧ. គណិតវិទ្យា" />
                </div>
                <div className="space-y-1.5">
                  <Label>Subject (English)</Label>
                  <Input {...register("subject_en")} placeholder="e.g. Mathematics" />
                </div>
              </div>

              <h2 className="font-semibold text-gray-900 pt-2">Specialization / Major</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ជំនាញ (ខ្មែរ)</Label>
                  <Input {...register("specialization_km")} className="font-khmer" placeholder="ឧ. ប្រវត្តិវិទ្យា" />
                </div>
                <div className="space-y-1.5">
                  <Label>Specialization (English)</Label>
                  <Input {...register("specialization_en")} placeholder="e.g. History" />
                </div>
              </div>

              <h2 className="font-semibold text-gray-900 pt-2">Educational Attainment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>សញ្ញាបត្រ (ខ្មែរ)</Label>
                  <Input {...register("qualification_km")} className="font-khmer" placeholder="ឧ. បរិញ្ញាបត្រជាន់ខ្ពស់" />
                </div>
                <div className="space-y-1.5">
                  <Label>Qualification (English)</Label>
                  <Input {...register("qualification_en")} placeholder="e.g. Master's Degree" />
                </div>
              </div>

              <h2 className="font-semibold text-gray-900 pt-2">Biography</h2>
              <p className="text-xs text-gray-400 -mt-2">
                Shown as a quoted message on the featured principal card (first leader by sort order).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ជីវប្រវត្ដិ (ខ្មែរ)</Label>
                  <textarea
                    {...register("bio_km")}
                    rows={4}
                    className="font-khmer w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="សារពីនាយក..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Biography (English)</Label>
                  <textarea
                    {...register("bio_en")}
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Message from the principal..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Settings</h2>
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? "unset"} onValueChange={(v) => field.onChange(v === "unset" ? undefined : v)}>
                      <SelectTrigger><SelectValue placeholder="Not set" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unset">Not set</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input {...register("phone")} placeholder="e.g. 012 345 678" />
              </div>
              <div className="space-y-1.5">
                <Label>Date of Birth</Label>
                <p className="text-xs text-gray-400">Admin records only — not shown on the public site.</p>
                <Input type="date" {...register("date_of_birth")} />
              </div>
              <div className="space-y-1.5">
                <Label>Grade Levels Taught (if any)</Label>
                <Controller
                  name="grade_levels"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {[7, 8, 9, 10, 11, 12].map((grade) => {
                        const checked = (field.value ?? []).includes(grade);
                        return (
                          <button
                            key={grade}
                            type="button"
                            onClick={() =>
                              field.onChange(
                                checked
                                  ? (field.value ?? []).filter((g: number) => g !== grade)
                                  : [...(field.value ?? []), grade].sort((a: number, b: number) => a - b)
                              )
                            }
                            className={`w-10 h-9 rounded-md text-sm font-medium border transition-colors ${
                              checked
                                ? "bg-school-blue-800 text-white border-school-blue-800"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {grade}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <p className="text-xs text-gray-400">Lowest number = Principal (featured card). Others show as vice directors.</p>
                <Input type="number" min={0} {...register("sort_order")} placeholder="0" />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Controller name="is_active" control={control} render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">Photo</h2>
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto">
                {photoUrl ? (
                  <Image src={resolveImageUrl(photoUrl)} alt="" fill className="object-cover object-top" />
                ) : (
                  <User className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <Input {...register("photo_url")} placeholder="https://... or Google Drive link" />
            </div>

            <Button type="submit" className="w-full bg-school-blue-800 hover:bg-school-blue-900" disabled={isSubmitting} size="lg">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isNew ? "Create Leader" : "Update Leader"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
