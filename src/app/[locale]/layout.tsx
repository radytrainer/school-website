import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { AuthProvider } from "@/contexts/AuthContext";
import LocaleHtmlSync from "@/components/LocaleHtmlSync";
import { Toaster } from "sonner";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
const SCHOOL_NAME_EN = process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "Kamrieng High School";
const SCHOOL_NAME_KM = process.env.NEXT_PUBLIC_SCHOOL_NAME_KM ?? "វិទ្យាល័យកំរៀង";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: SCHOOL_NAME_EN,
    template: `%s | ${SCHOOL_NAME_EN}`,
  },
  description: `${SCHOOL_NAME_EN} (${SCHOOL_NAME_KM}) is a public high school in Kamrieng district, Battambang province, Cambodia — official website with news, student achievements, admissions documents, and more.`,
  keywords: [
    "Kamrieng High School",
    "Kamrieng",
    SCHOOL_NAME_KM,
    "high school Battambang",
    "Battambang high school",
    "school in Kamrieng",
    "Kamrieng district Battambang",
    "Cambodia high school",
  ],
  alternates: {
    languages: { km: "/km", en: "/en" },
  },
  openGraph: {
    type: "website",
    siteName: SCHOOL_NAME_EN,
    locale: "km_KH",
    alternateLocale: ["en_US"],
    images: ["/images/logo/logo.png"],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <LocaleHtmlSync />
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
        />
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
