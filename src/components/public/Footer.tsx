import Image from "next/image";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Phone, Mail, MapPin, Facebook } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getSiteSettings } from "@/lib/queries";
import TiktokIcon from "@/components/icons/TiktokIcon";

async function getFooterContactInfo(locale: string) {
  const settings = await getSiteSettings();
  const km = locale === "km";
  return {
    address:
      (km ? settings.school_address_km : settings.school_address_en) ??
      (km ? "ខេត្តបាត់ដំបង, កម្ពុជា" : "Battambang Province, Cambodia"),
    phone: settings.school_phone ?? "+855 23 000 000",
    email: settings.school_email ?? "info@school.edu.kh",
    facebook: settings.school_facebook ?? "#",
    tiktok: settings.school_tiktok ?? "#",
  };
}

export default async function Footer() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const { address, phone, email, facebook, tiktok } = await getFooterContactInfo(locale);

  const quickLinks = [
    { label: t("nav.home"), href: `/${locale}` },
    { label: t("nav.about"), href: `/${locale}/about` },
    { label: t("nav.governance"), href: `/${locale}/governance` },
    { label: t("nav.news"), href: `/${locale}/news` },
    { label: t("nav.achievements"), href: `/${locale}/achievements` },
    { label: t("nav.operation"), href: `/${locale}/operation` },
    { label: t("nav.contact"), href: `/${locale}/contact` },
    { label: t("nav.donate"), href: `/${locale}/donate` },
  ];

  const schoolName =
    locale === "km"
      ? (process.env.NEXT_PUBLIC_SCHOOL_NAME_KM ?? "")
      : (process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "");

  return (
    <footer className="bg-school-blue-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                <Image src="/images/logo/logo.png" alt="School logo" fill className="object-cover" sizes="48px" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{schoolName}</h3>
                <p className="text-school-blue-200 text-xs">
                  {locale === "km" ? "ផ្តល់ការអប់រំប្រកបដោយគុណភាព" : "Quality Education Since 1960"}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-school-blue-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-school-gold-400" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-school-gold-400" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-school-gold-400" />
                <span>{email}</span>
              </div>
            </div>
            {/* Social */}
            <div className="flex gap-3 mt-4">
              <a
                href={facebook}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-school-gold-500 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={tiktok}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-black flex items-center justify-center transition-colors"
                aria-label="TikTok"
              >
                <TiktokIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-school-gold-400 mb-4">
              {t("footer.quick_links")}
            </h4>
            <ul className="space-y-2">
              {quickLinks.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-school-blue-200 hover:text-school-gold-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-school-gold-400 mb-4">
              {locale === "km" ? "ទំព័រ" : "Pages"}
            </h4>
            <ul className="space-y-2">
              {quickLinks.slice(4).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-school-blue-200 hover:text-school-gold-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-school-blue-800">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-school-blue-300">
          <p>
            © {new Date().getFullYear()} {schoolName}. {t("footer.rights")}.
          </p>
          <p>
            {locale === "km"
              ? "បង្កើតដោយសិស្ស Passerelles Numériques Cambodia (PNC)"
              : "Build by Passerelles Numériques Cambodia (PNC) Students"}{" "}
            ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
