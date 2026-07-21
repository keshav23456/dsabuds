import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";
import { deriveGraduationYearFromEmail } from "@/lib/graduationYear";
import { sendWelcomeEmail } from "@/lib/mailer";

const ALLOWED_ORIGINS = new Set(
  [
    "https://dsabuddy.xyz",
    "https://www.dsabuddy.xyz",
    "http://localhost:4173",
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.BASE_URL?.replace(/\/$/, ""),
  ].filter(Boolean)
);

interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleUserInfo {
  id: string;
  email?: string;
  verified_email?: boolean;
  name?: string;
  picture?: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const rawState = searchParams.get("state") || "";
  const defaultOrigin = process.env.BASE_URL || "http://localhost:3000";
  const state = ALLOWED_ORIGINS.has(rawState) ? rawState : defaultOrigin;

  if (!code) {
    return NextResponse.redirect(`${state}/login?error=auth_failed`);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
        redirect_uri: `${process.env.BASE_URL}/api/oauth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData: GoogleTokenResponse = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Google token exchange failed:", tokenData);
      return NextResponse.redirect(`${state}/login?error=auth_failed`);
    }

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileRes.ok) {
      return NextResponse.redirect(`${state}/login?error=auth_failed`);
    }

    const profile: GoogleUserInfo = await profileRes.json();

    if (!profile.email) {
      return NextResponse.redirect(`${state}/login?error=auth_failed`);
    }

    const email = profile.email.toLowerCase();
    const parts = email.split("@");
    if (parts.length !== 2) {
      return NextResponse.redirect(`${state}/login?error=auth_failed`);
    }
    const domain = parts[1];
    const isAllowedEmail =
      domain === "nsut.ac.in" ||
      domain === "dtu.ac.in" ||
      domain.endsWith(".nsut.ac.in") ||
      domain.endsWith(".dtu.ac.in");

    if (!isAllowedEmail) {
      return NextResponse.redirect(`${state}/login?error=email_not_allowed`);
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      let year = deriveGraduationYearFromEmail(email);
      if (!year) year = "N/A";

      user = await prisma.user.create({
        data: {
          email,
          name: profile.name || email.split("@")[0],
          userName: `user_${profile.id}`,
          avatarUrl: profile.picture || null,
          year,
        },
      });

      sendWelcomeEmail(user.email, user.name).catch((error: unknown) => {
        console.error("Failed to send welcome email to", user!.email, error);
      });
    }

    const token = signToken({ userId: user.id, email: user.email, userName: user.userName });

    const needsOnboarding = !user.branch;
    const targetPath = needsOnboarding ? "/onboarding" : "/dashboard";
    const res = NextResponse.redirect(`${state}${targetPath}`);
    setAuthCookie(res, token);
    return res;
  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.redirect(`${state}/login?error=auth_failed`);
  }
}
