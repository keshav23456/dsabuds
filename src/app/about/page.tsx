import type { Metadata } from "next";
import { buildMetadata } from "@/components/common";
import { breadcrumbSchema } from "@/config/seo";
import { AboutPage } from "@/components/about/AboutPage";

export const metadata: Metadata = buildMetadata({
  title: "About DSABuddy — The Team Behind Your DSA Tracker",
  description:
    "Meet the team building DSABuddy, the platform that unifies your DSA practice across LeetCode, Codeforces, CodeChef, and GeeksforGeeks to help you ace coding interviews.",
  path: "/about",
});

const jsonLd = breadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
]);

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutPage />
    </>
  );
}
