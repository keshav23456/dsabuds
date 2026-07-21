import type { Metadata } from "next";
import { buildMetadata } from "@/components/common";
import { organizationSchema, websiteSchema, webApplicationSchema } from "@/config/seo";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = buildMetadata({
  title: "DSABuddy — Track DSA Practice: LeetCode, Codeforces & More",
  description:
    "Track all your DSA practice in one place. Connect LeetCode, Codeforces, CodeChef & GFG to see unified stats, streaks, and leaderboards for interview prep.",
  path: "/",
});

const jsonLds = [organizationSchema, websiteSchema, webApplicationSchema];

export default function Home() {
  return (
    <>
      {jsonLds.map((schema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <LandingPage />
    </>
  );
}
