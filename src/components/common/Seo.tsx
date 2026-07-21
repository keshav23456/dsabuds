import type { Metadata } from 'next';
import { SITE, absoluteUrl } from '@/config/seo';

// The source app was a client-rendered SPA, so `Seo.jsx` imperatively wrote
// <head> tags on mount via a react-helmet-style effect. Next.js App Router
// generates <head> server-side via the `metadata` export in page/layout
// files, so this file is repurposed as `buildMetadata()` — a helper that
// page components call to construct a Next.js `Metadata` object with the
// same defaults/fallbacks as the original <Seo /> component.
//
// JSON-LD is not part of Next's `Metadata` type; pages that need it should
// render a `<script type="application/ld+json">` themselves using the data
// from `@/config/seo` (organizationSchema, websiteSchema, breadcrumbSchema, etc).

interface BuildMetadataOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  type?: string;
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  noindex = false,
  type = 'website',
}: BuildMetadataOptions = {}): Metadata {
  const fullTitle = title ? `${title} | ${SITE.name}` : SITE.defaultTitle;
  const ogTitle = title || SITE.defaultTitle;
  const desc = description || SITE.description;
  const url = absoluteUrl(path || '/');
  const img = image ? absoluteUrl(image) : SITE.defaultImage;

  return {
    title: fullTitle,
    description: desc,
    alternates: {
      canonical: url,
    },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: ogTitle,
      description: desc,
      url,
      images: [img],
      type: type as 'website',
      siteName: SITE.name,
      locale: SITE.locale,
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE.twitter,
      title: ogTitle,
      description: desc,
      images: [img],
    },
  };
}
