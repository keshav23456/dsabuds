import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupPostRequestBodySchema } from "@/lib/validation/request.validation";
import { signToken, setAuthCookie } from "@/lib/auth";
import { deriveGraduationYearFromEmail } from "@/lib/graduationYear";
import { sendWelcomeEmail } from "@/lib/mailer";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { key: "auth-signup", limit: 10, windowSeconds: 60 * 15 });
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const validationResult = await signupPostRequestBodySchema.safeParseAsync(body);

  if (!validationResult.success) {
    return NextResponse.json({ error: validationResult.error.format() }, { status: 400 });
  }

  const { name, userName, email, password, year: manualYear } = validationResult.data;

  const existingByEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  const existingByUserName = await prisma.user.findUnique({
    where: { userName },
    select: { id: true },
  });

  if (existingByEmail || existingByUserName) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  let year = deriveGraduationYearFromEmail(email);
  if (!year) {
    if (manualYear) {
      const parsedYear = parseInt(manualYear, 10);
      if (isNaN(parsedYear) || parsedYear < 2020 || parsedYear > 2100) {
        return NextResponse.json(
          { error: "Please provide a valid graduation year between 2020 and 2100." },
          { status: 400 }
        );
      }
      year = String(parsedYear);
    } else {
      return NextResponse.json(
        {
          error:
            "Could not determine graduation year from email. Please provide graduation year manually.",
        },
        { status: 400 }
      );
    }
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      name,
      userName,
      email,
      passwordHash,
      salt,
      year,
    },
    select: {
      id: true,
      name: true,
      userName: true,
      email: true,
      avatarUrl: true,
      branch: true,
      year: true,
      points: true,
      overallRank: true,
      branchChangesCount: true,
      createdAt: true,
    },
  });

  sendWelcomeEmail(user.email, user.name).catch((error: unknown) => {
    console.error("Failed to send welcome email to", user.email, error);
  });

  const token = signToken({ userId: user.id, email: user.email, userName: user.userName });

  const res = NextResponse.json({ message: "User created successfully", user }, { status: 201 });
  setAuthCookie(res, token);
  return res;
}
