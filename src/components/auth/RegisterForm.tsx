'use client';

import { Button, Divider } from "@/components/common";
import { FormField, SocialButton } from "@/components/layout";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authService } from "@/services";
import { useUserStore } from "@/store/useUserStore";
import { API_BASE_URL } from "@/config/constants";
import { getErrorMessage } from "@/utils";

const GOOGLE_LOGO_SRC = "/icons/google.svg";

// NOTE: the old app's RegisterForm sent users through a two-step
// send-signup-otp -> verify-otp flow (`POST /auth/send-signup-otp`). That
// endpoint does not exist in this project's API routes (only
// login/signup/logout/me/update-password under /api/auth), and
// `authService` here has no `sendSignupOtp` method. The actual
// `/api/auth/signup` route creates the account directly with no OTP step,
// so this form registers in a single step to match what the backend
// actually supports. See final report for this gap.

export const RegisterForm = () => {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const [formData, setFormData] = useState({
    name: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    year: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const UG_YEAR_PATTERN = /(?:^|[._-])ug(\d{2})/i;
  const PG_YEAR_PATTERN = /(?:^|[._-])pg(\d{2})/i;

  const deriveYear = (email: string) => {
    const emailStr = String(email || "");
    const ugMatch = emailStr.match(UG_YEAR_PATTERN);
    if (ugMatch) return String(2004 + parseInt(ugMatch[1], 10));
    const pgMatch = emailStr.match(PG_YEAR_PATTERN);
    if (pgMatch) return String(2002 + parseInt(pgMatch[1], 10));
    return null;
  };

  const isAllowedEmail = (email: string) => {
    const lower = String(email || "").toLowerCase();
    const parts = lower.split('@');
    if (parts.length !== 2) return false;
    const domain = parts[1];
    return (
      domain === "nsut.ac.in" ||
      domain === "dtu.ac.in" ||
      domain.endsWith(".nsut.ac.in") ||
      domain.endsWith(".dtu.ac.in")
    );
  };

  const allowedEmail = isAllowedEmail(formData.email);
  const canParseYear = deriveYear(formData.email);
  const showManualYear = allowedEmail && !canParseYear;

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth/google`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAllowedEmail(formData.email)) {
      setError("Only NSUT (@nsut.ac.in) and DTU (@dtu.ac.in) email addresses are allowed to register.");
      return;
    }

    if (showManualYear) {
      if (!formData.year.trim()) {
        setError("Please enter your graduation year.");
        return;
      }
      const parsed = parseInt(formData.year, 10);
      if (isNaN(parsed) || parsed < 2020 || parsed > 2100) {
        setError("Please enter a valid graduation year between 2020 and 2100.");
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password do not match");
      return;
    }

    try {
      setLoading(true);
      const res: any = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userName: formData.userName,
        ...(showManualYear ? { year: formData.year } : {}),
      });
      setUser(res.user || res);
      router.push("/onboarding");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center w-full">
      <div className="mt-6 sm:mt-10 w-full max-w-md border-t-primary border-t-2 p-6 sm:p-10 rounded-2xl bg-[#0D1117] border border-[#1F2937] mx-auto">
        <div className="w-full text-center mx-auto mb-6">
          <h2 className="font-normal italic text-white font-serif text-3xl">
            Create Account
          </h2>
          <p className="text-content text-sm mt-1">Initialize your profile to join the competition</p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-500 font-semibold bg-red-950/40 p-3 rounded-lg border border-red-500/30">
            {error}
          </div>
        )}
        <form onSubmit={handleRegisterSubmit} className="mx-auto w-full flex flex-col justify-center items-center">
          <FormField label="Name" placeholder="enter_name" name="name" value={formData.name} onChange={handleChange} required />

          <FormField
            label="Username"
            placeholder="enter_username"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            required
          />

          <FormField
            label="Email Address"
            type="email"
            placeholder="enter_email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {showManualYear && (
            <FormField
              label="Graduation Year"
              type="text"
              placeholder="e.g. 2027"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            />
          )}

          <div className="w-full flex flex-col sm:flex-row gap-4">
            <FormField
              label="Password"
              type="password"
              placeholder="******"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <FormField
              label="Confirm Password"
              type="password"
              placeholder="******"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" variant="accent" className="w-full text-sm sm:text-base mt-4 justify-center" disabled={loading}>
            {loading ? "Initializing..." : "Initialize Account"}
          </Button>
        </form>

        <Divider text="OR" className="mt-6 mb-6" />

        <SocialButton icon={GOOGLE_LOGO_SRC} text="Continue with Google" onClick={handleGoogleLogin} />
      </div>
    </div>
  );
};
