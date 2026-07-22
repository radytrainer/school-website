import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/lib/queries";
import ContactPageClient from "@/components/public/ContactPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("contact");
  const description =
    locale === "km"
      ? "ទាក់ទងវិទ្យាល័យកំរៀង ខេត្តបាត់ដំបង — អាសយដ្ឋាន លេខទូរស័ព្ទ អ៊ីមែល និងម៉ោងធ្វើការ។"
      : "Get in touch with Kamrieng High School in Battambang province, Cambodia — address, phone, email, and office hours.";
  return {
    title: t("title"),
    description,
    alternates: { canonical: `/${locale}/contact`, languages: { km: "/km/contact", en: "/en/contact" } },
  };
}

async function getContactInfo(locale: string) {
  const settings = await getSiteSettings();
  const km = locale === "km";
  return {
    address:
      (km ? settings.school_address_km : settings.school_address_en) ??
      (km ? "ខេត្តបាត់ដំបង, កម្ពុជា" : "Battambang Province, Cambodia"),
    phone: settings.school_phone ?? "+855 23 000 000",
    email: settings.school_email ?? "info@school.edu.kh",
    hours:
      (km ? settings.school_hours_km : settings.school_hours_en) ??
      (km ? "ច័ន្ទ - សុក្រ: ម៉ោង ៧:០០ - ១១:០០, ១៤:០០ - ១៧:០០" : "Mon - Fri: 7:00 - 11:00, 14:00 - 17:00"),
    facebook: settings.school_facebook ?? "#",
    tiktok: settings.school_tiktok ?? "#",
    imageUrl: settings.contact_image_url || "/images/home/hero-campus-morning.png",
  };
}

export default async function ContactPage() {
  const locale = await getLocale();
  const { address, phone, email, hours, facebook, tiktok, imageUrl } = await getContactInfo(locale);

  return (
    <ContactPageClient
      address={address}
      phone={phone}
      email={email}
      hours={hours}
      facebook={facebook}
      tiktok={tiktok}
      imageUrl={imageUrl}
    />
  );
}
