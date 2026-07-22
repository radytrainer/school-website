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
import { bankAccountSchema, type BankAccountInput } from "@/lib/validations";
import { createBankAccount, updateBankAccount, getAdminBankAccountById } from "@/actions/donate";

interface PageProps { params: Promise<{ id: string }>; }

const PRESET_COLORS = ["#0066cc", "#e62020", "#00376f", "#fdbc13", "#16a34a", "#7c3aed"];

export default function BankAccountFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<BankAccountInput>({
      resolver: zodResolver(bankAccountSchema),
      defaultValues: { currency: "USD / KHR", logo_color: "#00376f", is_active: true, sort_order: 0 },
    });

  const logoColor = watch("logo_color");

  useEffect(() => {
    if (!isNew) {
      getAdminBankAccountById(id).then((data) => {
        if (data) Object.entries(data).forEach(([k, v]) => { if (v !== null) setValue(k as keyof BankAccountInput, v as string); });
        setLoading(false);
      });
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: BankAccountInput) => {
    const result = isNew ? await createBankAccount(data) : await updateBankAccount(id, data);
    if (result.success) { toast.success(isNew ? "Bank account created!" : "Bank account updated!"); router.push(`/${locale}/admin/donate`); }
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
          {isNew ? (locale === "km" ? "បន្ថែមគណនីធនាគារ" : "New Bank Account") : (locale === "km" ? "កែគណនីធនាគារ" : "Edit Bank Account")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Bank</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ឈ្មោះធនាគារ (ខ្មែរ) *</Label>
                  <Input {...register("bank_name_km")} className="font-khmer" placeholder="ឧ. ធនាគារ ABA" />
                  {errors.bank_name_km && <p className="text-xs text-red-500">{errors.bank_name_km.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Bank Name (English) *</Label>
                  <Input {...register("bank_name_en")} placeholder="e.g. ABA Bank" />
                  {errors.bank_name_en && <p className="text-xs text-red-500">{errors.bank_name_en.message}</p>}
                </div>
              </div>

              <h2 className="font-semibold text-gray-900 pt-2">Account Holder</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ឈ្មោះគណនី (ខ្មែរ) *</Label>
                  <Input {...register("account_name_km")} className="font-khmer" placeholder="ឧ. វិទ្យាល័យកំរៀង" />
                  {errors.account_name_km && <p className="text-xs text-red-500">{errors.account_name_km.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Account Name (English) *</Label>
                  <Input {...register("account_name_en")} placeholder="e.g. Kamrieng High School" />
                  {errors.account_name_en && <p className="text-xs text-red-500">{errors.account_name_en.message}</p>}
                </div>
              </div>

              <h2 className="font-semibold text-gray-900 pt-2">Account Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Account Number *</Label>
                  <Input {...register("account_number")} className="font-mono" placeholder="000 123 456" />
                  {errors.account_number && <p className="text-xs text-red-500">{errors.account_number.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Input {...register("currency")} placeholder="USD / KHR" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Settings</h2>

              <div className="space-y-1.5">
                <Label>Brand Color</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setValue("logo_color", c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${logoColor === c ? "border-gray-900 scale-110" : "border-transparent"}`}
                      style={{ background: c }}
                    />
                  ))}
                  <Controller
                    name="logo_color"
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
              {isNew ? "Create Account" : "Update Account"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
