import type { Metadata } from "next";
import { buildMetadata } from "@/components/common";
import { breadcrumbSchema } from "@/config/seo";
import { ContactPage } from "@/components/contact/ContactPage";

export const metadata: Metadata = buildMetadata({
  title: "Contact DSABuddy",
  description:
    "Get in touch with the DSABuddy team. Questions, feedback, partnership ideas, or bug reports — we'd love to hear from you.",
  path: "/contact",
});

const jsonLd = breadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
]);

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactPage />
    </>
  );
}
