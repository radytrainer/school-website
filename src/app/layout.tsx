import type { Metadata } from "next";
import { Inter, Battambang, Moul } from "next/font/google";
import { getLocale } from "next-intl/server";
import { generateSchoolJsonLd } from "@/lib/structured-data";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const battambang = Battambang({
  subsets: ["khmer"],
  weight: ["400", "700"],
  variable: "--font-battambang",
  display: "swap",
});

// Loaded for deliberate, scoped decorative use (e.g. a page's Khmer title),
// applied only via the font-khmer-title class — never as a global default,
// since forcing it onto every heading site-wide was explicitly undesired.
const moul = Moul({
  subsets: ["khmer"],
  weight: "400",
  variable: "--font-khmer-moul",
  display: "swap",
});

// Title/description live in `[locale]/layout.tsx` (the more specific segment,
// which wins metadata resolution) so there's a single source of truth per
// locale. This root layout only sets what's locale-independent.
// Favicon/apple-icon are picked up automatically from icon.png, apple-icon.png,
// and favicon.ico in this directory (Next.js file-based icon convention) —
// no `icons` field needed here. Those are square crops of the school crest;
// the original /images/logo/logo.png is on a tall non-square canvas, which
// is why search engines couldn't extract a clean icon from it.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const schoolJsonLd = generateSchoolJsonLd();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schoolJsonLd) }}
          suppressHydrationWarning
        />
      </head>
      <body className={`${inter.variable} ${battambang.variable} ${moul.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
