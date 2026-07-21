import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDailyPotdEmail } from "@/lib/mailer";
import { requireSyncSecret } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const authError = requireSyncSecret(req);
  if (authError) return authError;

  const body = await req.json().catch(() => ({}));
  const { to, name, problemId } = body as { to?: string; name?: string; problemId?: string };

  if (!to) {
    return NextResponse.json({ error: 'Recipient email "to" is required' }, { status: 400 });
  }

  try {
    let problem = null;
    if (problemId) {
      problem = await prisma.question.findUnique({ where: { id: problemId } });
    }

    if (!problem) {
      const count = await prisma.question.count();
      if (count > 0) {
        const skip = Math.floor(Math.random() * count);
        const randomProblems = await prisma.question.findMany({ take: 1, skip });
        problem = randomProblems[0];
      }
    }

    const info = await sendDailyPotdEmail(to, name || "User", problem);
    return NextResponse.json({ message: "Daily POTD email sent successfully", problem, info }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error sending POTD email", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
