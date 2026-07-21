import { NextRequest, NextResponse } from "next/server";

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

export async function GET(req: NextRequest) {
  const referer = req.headers.get("referer") || process.env.BASE_URL || "http://localhost:3000";
  let origin = process.env.BASE_URL || "http://localhost:3000";
  try {
    const refererOrigin = new URL(referer).origin;
    origin = ALLOWED_ORIGINS.has(refererOrigin) ? refererOrigin : origin;
  } catch (e) {
    console.error("Failed to parse referer in OAuth setup:", e);
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    redirect_uri: `${process.env.BASE_URL}/api/oauth/google/callback`,
    response_type: "code",
    scope: "profile email",
    access_type: "online",
    prompt: "select_account",
    state: origin,
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}
