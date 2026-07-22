"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Loader2, Save, MapPin, Facebook, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { upsertSetting } from "@/actions/settings";
import { resolveImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import TiktokIcon from "@/components/icons/TiktokIcon";

type SettingsMap = Record<string, string>;

const DEFAULT_IMAGE = "/images/home/hero-campus-morning.png";

const DETAIL_FIELDS: { key: string; label_en: string; label_km: string; khmer?: boolean }[] = [
  { key: "school_address_km", label_en: "Address (Khmer)", label_km: "អាសយដ្ឋាន (ខ្មែរ)", khmer: true },
  { key: "school_address_en", label_en: "Address (English)", label_km: "អាសយដ្ឋាន (English)" },
  { key: "school_phone", label_en: "Phone Number", label_km: "លេខទូរស័ព្ទ" },
  { key: "school_email", label_en: "Email Address", label_km: "អ៊ីមែល" },
  { key: "school_hours_km", label_en: "Working Hours (Khmer)", label_km: "ម៉ោងធ្វើការ (ខ្មែរ)", khmer: true },
  { key: "school_hours_en", label_en: "Working Hours (English)", label_km: "ម៉ោងធ្វើការ (English)" },
];

const SOCIAL_FIELDS: { key: string; label_en: string; label_km: string }[] = [
  { key: "school_facebook", label_en: "Facebook URL", label_km: "តំណ Facebook" },
  { key: "school_tiktok", label_en: "TikTok URL", label_km: "តំណ TikTok" },
];

export default function AdminContactPage() {
  const locale = useLocale();
  const km = locale === "km";
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("settings")
      .select("key, value")
      .then(({ data }) => {
        const map: SettingsMap = {};
        (data ?? []).forEach((s: { key: string; value: string }) => { map[s.key] = s.value; });
        setSettings(map);
        setLoading(false);
      });
  }, []);

  const handleChange = (key: string, value: string) => setSettings((p) => ({ ...p, [key]: value }));

  const handleSaveAll = async () => {
    setSaving(true);
    const keys = [...DETAIL_FIELDS, ...SOCIAL_FIELDS].map((f) => f.key).concat(["contact_image_url"]);
    const results = await Promise.all(keys.map((key) => upsertSetting(key, settings[key] ?? "")));
    setSaving(false);
    if (results.every((r) => r.success)) toast.success(km ? "រក្សាទុកបានជោគជ័យ!" : "Saved successfully!");
    else toast.error(km ? "មានបញ្ហាក្នុងការរក្សាទុក" : "Some fields failed to save");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {km ? "គ្រប់គ្រងទំព័រទំនាក់ទំនង" : "Contact Page Management"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {km
              ? "កែសម្រួលព័ត៌មាន រូបភាព និងបណ្ដាញសង្គម ដែលបង្ហាញនៅលើទំព័រទំនាក់ទំនងសាធារណៈ"
              : "Manage the details, photo, and social links shown on the public Contact page"}
          </p>
        </div>
        <Button onClick={handleSaveAll} disabled={saving} className="bg-school-blue-800 hover:bg-school-blue-900">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {km ? "រក្សាទុកទាំងអស់" : "Save All Changes"}
        </Button>
      </div>

      {/* Contact details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-school-blue-800" />
          <h2 className="font-semibold text-gray-900">{km ? "ព័ត៌មានទំនាក់ទំនង" : "Contact Details"}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DETAIL_FIELDS.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label>{km ? field.label_km : field.label_en}</Label>
              <Input
                className={field.khmer ? "font-khmer" : ""}
                value={settings[field.key] ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Social media */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Facebook className="w-4 h-4 text-school-blue-800" />
          <h2 className="font-semibold text-gray-900">{km ? "បណ្ដាញសង្គម" : "Social Media"}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOCIAL_FIELDS.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                {field.key === "school_facebook" ? <Facebook className="w-3.5 h-3.5" /> : <TiktokIcon className="w-3.5 h-3.5" />}
                {km ? field.label_km : field.label_en}
              </Label>
              <Input
                value={settings[field.key] ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder="https://..."
              />
            </div>
          ))}
        </div>
      </div>

      {/* Campus photo */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-school-blue-800" />
          <h2 className="font-semibold text-gray-900">{km ? "រូបភាពសាលា" : "Campus Photo"}</h2>
        </div>
        <p className="text-xs text-gray-400">
          {km ? "រូបភាពនេះបង្ហាញនៅផ្នែកខាងឆ្វេងនៃទំព័រទំនាក់ទំនង" : "Shown alongside the contact form on the public Contact page"}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-4 items-start">
          <div className="space-y-1.5">
            <Label>{km ? "តំណរូបភាព" : "Image URL"}</Label>
            <Input
              value={settings.contact_image_url ?? ""}
              onChange={(e) => handleChange("contact_image_url", e.target.value)}
              placeholder={DEFAULT_IMAGE}
            />
          </div>
          <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            <Image
              src={resolveImageUrl(settings.contact_image_url) || DEFAULT_IMAGE}
              alt="Preview"
              fill
              className="object-cover"
              sizes="160px"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveAll} disabled={saving} className="bg-school-blue-800 hover:bg-school-blue-900" size="lg">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {km ? "រក្សាទុកទាំងអស់" : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}
