"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { governanceItemSchema, type GovernanceItemInput } from "@/lib/validations";
import { createGovernanceItem, updateGovernanceItem, getAdminGovernanceItemById } from "@/actions/governance";
import { GOVERNANCE_ICON_OPTIONS } from "@/lib/governance-icons";
import type { GovernanceSection } from "@/types";

interface PageProps { params: Promise<{ id: string }>; }

export default function GovernanceFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(!isNew);

  const defaultSection = (searchParams.get("section") as GovernanceSection) ?? "structure";

  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } =
    useForm<GovernanceItemInput>({
      resolver: zodResolver(governanceItemSchema),
      defaultValues: { section: defaultSection, icon: "ClipboardCheck", is_active: true, sort_order: 0 },
    });

  useEffect(() => {
    if (!isNew) {
      getAdminGovernanceItemById(id).then((data) => {
        if (data) Object.entries(data).forEach(([k, v]) => { if (v !== null) setValue(k as keyof GovernanceItemInput, v as string); });
        setLoading(false);
      });
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: GovernanceItemInput) => {
    const result = isNew ? await createGovernanceItem(data) : await updateGovernanceItem(id, data);
    if (result.success) { toast.success(isNew ? "Item created!" : "Item updated!"); router.push(`/${locale}/admin/governance`); }
    else toast.error(result.error ?? "Failed to save");
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/governance`}><ArrowLeft className="w-4 h-4 mr-1" />{locale === "km" ? "ត្រឡប់" : "Back"}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? (locale === "km" ? "បន្ថែមធាតុ" : "New Governance Item") : (locale === "km" ? "កែធាតុ" : "Edit Governance Item")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Content</h2>

              <div className="space-y-1.5">
                <Label>ចំណងជើង (ខ្មែរ) *</Label>
                <textarea
                  {...register("title_km")}
                  rows={2}
                  className="font-khmer w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="ចំណងជើង..."
                />
                {errors.title_km && <p className="text-xs text-red-500">{errors.title_km.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Title (English) *</Label>
                <textarea
                  {...register("title_en")}
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Title..."
                />
                {errors.title_en && <p className="text-xs text-red-500">{errors.title_en.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Settings</h2>

              <div className="space-y-1.5">
                <Label>Section</Label>
                <Controller name="section" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="structure">Structure & Management Systems</SelectItem>
                      <SelectItem value="culture">Learning Activities & Student Growth</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>

              <div className="space-y-1.5">
                <Label>Icon</Label>
                <Controller name="icon" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GOVERNANCE_ICON_OPTIONS.map(({ value, label, Icon }) => (
                        <SelectItem key={value} value={value}>
                          <span className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>

              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <input
                  type="number"
                  min={0}
                  {...register("sort_order")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="0"
                />
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
              {isNew ? "Create Item" : "Update Item"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
