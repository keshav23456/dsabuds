import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { listUserQuestionsQuerySchema } from "@/lib/validation/api.validation";

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const userId = authResult.user.userId;

  const parsed = await listUserQuestionsQuerySchema.safeParseAsync(
    Object.fromEntries(req.nextUrl.searchParams)
  );
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }
  const { status, take: takeQ, skip: skipQ } = parsed.data;
  const take = takeQ ?? 200;
  const skip = skipQ ?? 0;

  const items = await prisma.userQuestionBank.findMany({
    where: { userId, ...(status ? { status } : {}) },
    take,
    skip,
    orderBy: [{ updatedAt: "desc" }],
    select: {
      userId: true,
      questionId: true,
      status: true,
      solvedAt: true,
      updatedAt: true,
      question: {
        select: {
          id: true,
          title: true,
          displayName: true,
          difficulty: true,
          leetcodeUrl: true,
        },
      },
    },
  });

  return NextResponse.json({ userQuestions: items }, { status: 200 });
}
