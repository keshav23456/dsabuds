import type { Metadata } from "next";
import { buildMetadata } from "@/components/common";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { OnboardingPage } from "@/components/onboarding/OnboardingPage";

export const metadata: Metadata = buildMetadata({
  title: "Get Started",
  path: "/onboarding",
  noindex: true,
});

export default function Page() {
  return (
    <ProtectedRoute>
      <OnboardingPage />
    </ProtectedRoute>
  );
}
