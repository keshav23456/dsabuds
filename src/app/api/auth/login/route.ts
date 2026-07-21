import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginPostRequestBodySchema } from "@/lib/validation/request.validation";
import { signToken, setAuthCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { key: "auth-login", limit: 10, windowSeconds: 60 * 15 });
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const validationResult = await loginPostRequestBodySchema.safeParseAsync(body);

  if (!validationResult.success) {
    return NextResponse.json({ error: validationResult.error.format() }, { status: 400 });
  }

  const { identifier, password } = validationResult.data;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { userName: identifier }],
    },
    select: {
      id: true,
      email: true,
      userName: true,
      passwordHash: true,
    },
  });

  if (!existingUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!existingUser.passwordHash) {
    return NextResponse.json(
      { error: "Password login not available for this account" },
      { status: 400 }
    );
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.passwordHash);

  if (!isPasswordValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({
    userId: existingUser.id,
    email: existingUser.email,
    userName: existingUser.userName,
  });

  const res = NextResponse.json({ status: "success" }, { status: 200 });
  setAuthCookie(res, token);
  return res;
}


