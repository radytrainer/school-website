import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase";
import ContactPageClient from "@/components/public/ContactPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact");
  return { title: t("title") };
}

async function getContactInfo(locale: string) {
  const supabase = createServerClient();
  const { data } = await supabase.from("settings").select("key, value");
  const settings: Record<string, string> = {};
  (data ?? []).forEach((s: { key: string; value: string }) => { settings[s.key] = s.value; });

  const km = locale === "km";
  return {
    address:
      (km ? settings.school_address_km : settings.school_address_en) ??
      (km ? "ភ្នំពេញ, កម្ពុជា" : "Phnom Penh, Cambodia"),
    phone: settings.school_phone ?? "+855 23 000 000",
    email: settings.school_email ?? "info@school.edu.kh",
    hours:
      (km ? settings.school_hours_km : settings.school_hours_en) ??
      (km ? "ច័ន្ទ - សុក្រ: ម៉ោង ៧:០០ - ១១:០០, ១៤:០០ - ១៧:០០" : "Mon - Fri: 7:00 - 11:00, 14:00 - 17:00"),
  };
}

export default async function ContactPage() {
  const locale = await getLocale();
  const { address, phone, email, hours } = await getContactInfo(locale);

  return <ContactPageClient address={address} phone={phone} email={email} hours={hours} />;
}
