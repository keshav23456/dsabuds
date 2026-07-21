import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserFromRequest(req)?.userId ?? null;
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = Math.min(Number(limitParam ?? 100), 200);

  const randomRows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "QuestionBank" ORDER BY RANDOM() LIMIT ${limit}
  `;
  const ids = randomRows.map((r) => r.id);

  if (ids.length === 0) {
    return NextResponse.json({ questions: [] }, { status: 200 });
  }

  const questions = await prisma.questionBank.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      displayName: true,
      difficulty: true,
      leetcodeUrl: true,
      sourcePlatform: true,
      sourceUrl: true,
      sourceRating: true,
      acceptanceRate: true,
      frequency: true,
      tags: true,
      ...(userId
        ? {
            userStatuses: {
              where: { userId },
              select: { status: true, solvedAt: true, updatedAt: true },
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ questions }, { status: 200 });
}
