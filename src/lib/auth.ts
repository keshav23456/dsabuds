import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export interface JwtPayload {
  userId: string;
  email: string;
  userName: string;
}

export function getUserFromRequest(req: NextRequest): JwtPayload | null {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function requireAuth(
  req: NextRequest
): { user: JwtPayload } | { error: NextResponse } {
  const user = getUserFromRequest(req);
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user };
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "7d" });
}

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
  domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined,
};

export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set("token", token, AUTH_COOKIE_OPTIONS);
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set("token", "", { ...AUTH_COOKIE_OPTIONS, maxAge: 0 });
}

export function requireSyncSecret(req: NextRequest): NextResponse | null {
  const required = process.env.SYNC_SECRET;
  if (!required) {
    return NextResponse.json({ error: "SYNC_SECRET is not configured on the server" }, { status: 500 });
  }

  const provided = req.headers.get("x-sync-key");
  if (!provided || provided !== required) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
