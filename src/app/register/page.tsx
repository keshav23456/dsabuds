import type { Metadata } from "next";
import { buildMetadata } from "@/components/common";
import { RegisterPageClient } from "@/components/auth/RegisterPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Create Your Account",
  description:
    "Create your DSABuddy account to start tracking your DSA practice across LeetCode, Codeforces, CodeChef, and GeeksforGeeks.",
  path: "/register",
  noindex: true,
});

export default function Page() {
  return <RegisterPageClient />;
}
