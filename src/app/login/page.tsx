import type { Metadata } from "next";
import { buildMetadata } from "@/components/common";
import { LoginPageClient } from "@/components/auth/LoginPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Login",
  description:
    "Log in to your DSABuddy account to start tracking your DSA practice across LeetCode, Codeforces, CodeChef, and GeeksforGeeks.",
  path: "/login",
  noindex: true,
});

export default function Page() {
  return <LoginPageClient />;
}
