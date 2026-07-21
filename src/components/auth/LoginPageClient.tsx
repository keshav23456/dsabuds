'use client';

import Link from "next/link";
import { Navbar } from "@/components/layout";
import { PublicRoute } from "@/components/auth/PublicRoute";
import { LoginForm } from "@/components/auth/LoginForm";

export function LoginPageClient() {
  return (
    <PublicRoute>
      <div className="bg-[#000000] min-h-screen pt-24 sm:pt-32 md:pt-40">
        <Navbar />
        <div className="flex flex-col justify-center items-center">
          <div className="w-full px-4 sm:px-6">
            <LoginForm />
          </div>
          <div className="w-full max-w-120 mt-6 mb-6 cursor-pointer mx-auto px-4 sm:px-6 group">
            <Link href="/register" className="w-full block">
              <p className="text-[#6c7280] group-hover:text-[#35b9f1] transition-colors duration-200 w-full text-sm sm:text-base text-center">
                // Not a member? <span className="underline">Register here</span>
              </p>
            </Link>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
