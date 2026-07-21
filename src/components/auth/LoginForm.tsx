'use client';

import { LockKeyhole, LogIn, UserRound } from "lucide-react";
import { Button, Divider } from "@/components/common";
import { FormField, SocialButton } from "@/components/layout";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { authService, userService } from "@/services";
import { useUserStore } from "@/store/useUserStore";
import { API_BASE_URL } from "@/config/constants";
import { getErrorMessage } from "@/utils";

const GOOGLE_LOGO_SRC = "/icons/google.svg";

export const LoginForm = () => {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    if (errorParam === "email_not_allowed" || errorParam === "email_not_nsut") {
      setError("Only NSUT (@nsut.ac.in) and DTU (@dtu.ac.in) email addresses are allowed.");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorParam === "auth_token_missing") {
      setError("Authentication token missing. Please try again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorParam) {
      setError("Authentication failed. Please try again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.identifier.trim() || !formData.password.trim()) {
      setError("Email/Username and password are required.");
      return;
    }
    try {
      setLoading(true);
      // authService.login is typed for `{ email, password }` but the backend's
      // /api/auth/login route actually expects `{ identifier, password }`
      // (identifier = email OR username). Cast to bypass the mismatched type.
      await authService.login({
        identifier: formData.identifier,
        password: formData.password,
      } as unknown as Parameters<typeof authService.login>[0]);
      const userRes: any = await userService.getMe();
      const u = userRes.user || userRes;
      setUser(u);
      router.push('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 sm:mt-10 w-full max-w-md border-t-primary border-t-2 p-6 sm:p-10 rounded-2xl bg-[#0D1117] border border-[#1F2937] mx-auto">
      <div>
        <div className="w-full text-center mx-auto mb-6">
          <h2 className="font-normal italic text-white font-serif text-3xl">
            Welcome Back
          </h2>
          <p className="text-content text-sm mt-1">Ready to crush some more problems?</p>
        </div>

        {error && (
          <div className="mt-4 mb-4 text-sm text-red-500 font-semibold bg-red-950/40 p-3 rounded-lg border border-red-500/30">
            {error}
          </div>
        )}

        <div>
          <form onSubmit={handleSubmit} className="mx-auto w-full flex flex-col justify-center items-center">
            <FormField
              label="EMAIL ADDRESS OR USERNAME"
              icon={UserRound}
              type="text"
              placeholder="std::cin >> email_or_username"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              required
            />

            <FormField
              label="PASSWORD"
              icon={LockKeyhole}
              type="password"
              placeholder="******"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Button type="submit" variant="accent" className="mt-4 w-full flex gap-3 text-sm sm:text-base justify-center" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Log In</span>
                </>
              )}
            </Button>
          </form>
        </div>

        <Divider text="OR" className="mt-6 mb-6" />

        <SocialButton icon={GOOGLE_LOGO_SRC} text="Continue with Google" onClick={handleGoogleLogin} />
      </div>
    </div>
  );
};
