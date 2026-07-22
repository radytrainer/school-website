const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export function generateSchoolJsonLd() {
  const nameEn = process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "Kamrieng High School";
  const nameKm = process.env.NEXT_PUBLIC_SCHOOL_NAME_KM ?? "វិទ្យាល័យកំរៀង";

  return {
    "@context": "https://schema.org",
    "@type": "HighSchool",
    name: nameEn,
    alternateName: nameKm,
    description: `${nameEn} (${nameKm}) is a public high school in Kamrieng district, Battambang province, Cambodia.`,
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo/logo.png`,
    image: `${BASE_URL}/images/logo/logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ou Da Village, Ou Da Commune",
      addressLocality: process.env.NEXT_PUBLIC_SCHOOL_DISTRICT ?? "Kamrieng",
      addressRegion: process.env.NEXT_PUBLIC_SCHOOL_PROVINCE ?? "Battambang",
      addressCountry: "KH",
    },
    telephone: process.env.NEXT_PUBLIC_SCHOOL_PHONE,
    email: process.env.NEXT_PUBLIC_SCHOOL_EMAIL,
    sameAs: [
      process.env.NEXT_PUBLIC_SCHOOL_FACEBOOK,
      process.env.NEXT_PUBLIC_SCHOOL_TIKTOK,
    ].filter(Boolean),
  };
}

export function generateNewsArticleJsonLd({
  title,
  description,
  imageUrl,
  publishDate,
  slug,
  locale,
}: {
  title: string;
  description?: string;
  imageUrl?: string;
  publishDate?: string;
  slug: string;
  locale: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    image: imageUrl,
    datePublished: publishDate,
    url: `${BASE_URL}/${locale}/news/${slug}`,
    publisher: {
      "@type": "Organization",
      name: process.env.NEXT_PUBLIC_SCHOOL_NAME_EN,
      url: BASE_URL,
    },
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
