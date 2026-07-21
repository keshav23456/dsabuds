import type { Metadata } from "next";
import { buildMetadata } from "@/components/common";
import { breadcrumbSchema } from "@/config/seo";
import { LeaderboardPage } from "@/components/leaderboard/LeaderboardPage";

export const metadata: Metadata = buildMetadata({
  title: "DSA Practice Leaderboard — Top Coders on DSABuddy",
  description:
    "See how you rank against other coders. The DSABuddy leaderboard tracks combined DSA practice across LeetCode, Codeforces, CodeChef, and GeeksforGeeks.",
  path: "/leaderboard",
});

const jsonLd = breadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Leaderboard", path: "/leaderboard" },
]);

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LeaderboardPage />
    </>
  );
}
