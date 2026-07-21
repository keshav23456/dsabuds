import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const redirectUrl =
    req.headers.get("referer") || process.env.BASE_URL || "http://localhost:3000";
  const res = NextResponse.redirect(redirectUrl);
  clearAuthCookie(res);
  return res;
}
