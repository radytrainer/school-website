"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Plus, Edit, Trash2, Loader2, Save, Landmark, Heart, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { getLocalizedText, resolveImageUrl } from "@/lib/utils";
import { upsertSetting } from "@/actions/settings";
import { getAdminBankAccountsList, deleteBankAccount, getAdminDonationUsesList, deleteDonationUse } from "@/actions/donate";
import type { BankAccount, DonationUse } from "@/types";

export default function AdminDonatePage() {
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [donationUses, setDonationUses] = useState<DonationUse[]>([]);
  const [qrImageUrl, setQrImageUrl] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [banks, uses, { data: settingRows }] = await Promise.all([
      getAdminBankAccountsList(),
      getAdminDonationUsesList(),
      supabase.from("settings").select("key, value").eq("key", "donate_qr_image_url"),
    ]);
    setBankAccounts(banks);
    setDonationUses(uses);
    setQrImageUrl(settingRows?.[0]?.value ?? "");
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDeleteBank = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const result = await deleteBankAccount(id);
    if (result.success) { toast.success("Bank account deleted"); fetchAll(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  const handleDeleteUse = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const result = await deleteDonationUse(id);
    if (result.success) { toast.success("Item deleted"); fetchAll(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  const handleSaveQr = async () => {
    setSaving(true);
    const result = await upsertSetting("donate_qr_image_url", qrImageUrl);
    setSaving(false);
    if (result.success) toast.success("Saved");
    else toast.error(result.error ?? "Failed to save");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === "km" ? "គ្រប់គ្រងទំព័របរិច្ចាគ" : "Donate Page Management"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {locale === "km"
            ? "គ្រប់គ្រងគណនីធនាគារ ការប្រើប្រាស់ថវិកា និងកូដ QR សម្រាប់ទំព័របរិច្ចាគសាធារណៈ"
            : "Manage bank accounts, donation use-case cards, and the QR code shown on the public Donate page"}
        </p>
      </div>

      <Tabs defaultValue="banks">
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="banks" className="flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5" />Bank Accounts</TabsTrigger>
          <TabsTrigger value="uses" className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" />Why Donate</TabsTrigger>
          <TabsTrigger value="qr" className="flex items-center gap-1.5"><QrCode className="w-3.5 h-3.5" />QR Code</TabsTrigger>
        </TabsList>

        {/* ── Bank Accounts ── */}
        <TabsContent value="banks" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">{bankAccounts.length} accounts</p>
            <Button asChild size="sm" className="bg-school-blue-800 hover:bg-school-blue-900">
              <Link href={`/${locale}/admin/donate/banks/new`}>
                <Plus className="w-4 h-4 mr-1.5" />
                {locale === "km" ? "បន្ថែម" : "Add Bank Account"}
              </Link>
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {bankAccounts.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No bank accounts yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 w-12">#</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Bank</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Account Name</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Account Number</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bankAccounts.map((acc) => {
                      const bankName = getLocalizedText(acc.bank_name_km, acc.bank_name_en, locale);
                      return (
                        <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-400">{acc.sort_order}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                style={{ background: acc.logo_color }}
                              >
                                {bankName.slice(0, 3)}
                              </div>
                              <p className={`font-medium text-gray-900 ${locale === "km" ? "font-khmer" : ""}`}>{bankName}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {getLocalizedText(acc.account_name_km, acc.account_name_en, locale)}
                          </td>
                          <td className="px-4 py-3 font-mono text-gray-900">{acc.account_number}</td>
                          <td className="px-4 py-3">
                            <Badge variant={acc.is_active ? "success" : "warning"} className="text-xs">
                              {acc.is_active ? "Active" : "Hidden"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                <Link href={`/${locale}/admin/donate/banks/${acc.id}`}>
                                  <Edit className="w-4 h-4 text-blue-500" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteBank(acc.id, bankName)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Donation Uses ── */}
        <TabsContent value="uses" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">{donationUses.length} cards</p>
            <Button asChild size="sm" className="bg-school-blue-800 hover:bg-school-blue-900">
              <Link href={`/${locale}/admin/donate/uses/new`}>
                <Plus className="w-4 h-4 mr-1.5" />
                {locale === "km" ? "បន្ថែម" : "Add Card"}
              </Link>
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {donationUses.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No cards yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 w-12">#</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 w-14">Icon</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {donationUses.map((use) => {
                      const title = getLocalizedText(use.title_km, use.title_en, locale);
                      return (
                        <tr key={use.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-400">{use.sort_order}</td>
                          <td className="px-4 py-3 text-2xl">{use.icon}</td>
                          <td className="px-4 py-3">
                            <p className={`font-medium text-gray-900 max-w-[420px] ${locale === "km" ? "font-khmer" : ""}`}>{title}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={use.is_active ? "success" : "warning"} className="text-xs">
                              {use.is_active ? "Active" : "Hidden"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                <Link href={`/${locale}/admin/donate/uses/${use.id}`}>
                                  <Edit className="w-4 h-4 text-blue-500" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteUse(use.id, title)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── QR Code ── */}
        <TabsContent value="qr" className="space-y-4 mt-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 max-w-lg">
            <h2 className="font-semibold text-gray-900">Mobile Payment QR Code</h2>
            <p className="text-xs text-gray-400">
              Paste a URL to your real KHQR / mobile-payment QR code image (Google Drive share links work too). Leave blank to show the placeholder pattern.
            </p>
            <div className="flex items-start gap-4">
              <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                {qrImageUrl ? (
                  <Image src={resolveImageUrl(qrImageUrl)} alt="" fill className="object-contain" />
                ) : (
                  <QrCode className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  value={qrImageUrl}
                  onChange={(e) => setQrImageUrl(e.target.value)}
                  placeholder="https://... or Google Drive link"
                />
                <Button size="sm" onClick={handleSaveQr} disabled={saving}>
                  {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                  Save
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
