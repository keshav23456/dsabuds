import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userNameParamSchema } from "@/lib/validation/api.validation";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userName: string }> }
) {
  const resolvedParams = await params;
  const parsed = await userNameParamSchema.safeParseAsync(resolvedParams);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }
  const { userName } = parsed.data;

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const user = await prisma.user.findUnique({
    where: { userName },
    select: {
      id: true,
      name: true,
      userName: true,
      avatarUrl: true,
      college: true,
      branch: true,
      year: true,
      role: true,
      points: true,
      createdAt: true,
      socialLinks: true,
      platformConnections: {
        select: {
          id: true,
          platform: true,
          username: true,
          rating: true,
          stars: true,
          problemsSolved: true,
          rankLabel: true,
          synced: true,
          lastSyncedAt: true,
          topicBreakdown: true,
        },
        orderBy: { platform: "asc" },
      },
      dailyActivity: {
        where: { date: { gte: oneYearAgo } },
        select: { date: true, count: true },
        orderBy: { date: "asc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const points = user.points ?? 0;
  const [overallRank, branchRank, yearRank, solvedQuestionsCount, solvedSheetProblemsCount] =
    await Promise.all([
      points > 0
        ? prisma.user.count({ where: { points: { gt: points } } }).then((n) => n + 1)
        : Promise.resolve(null),
      points > 0 && user.branch
        ? prisma.user
            .count({ where: { branch: user.branch, points: { gt: points } } })
            .then((n) => n + 1)
        : Promise.resolve(null),
      points > 0 && user.year
        ? prisma.user
            .count({ where: { year: user.year, points: { gt: points } } })
            .then((n) => n + 1)
        : Promise.resolve(null),
      prisma.userQuestionBank.count({ where: { userId: user.id, status: "SOLVED" } }),
      prisma.userSheetProblem.count({ where: { userId: user.id, status: "SOLVED" } }),
    ]);

  return NextResponse.json(
    {
      user: {
        ...user,
        overallRank,
        branchRank,
        yearRank,
        solvedQuestionsCount: solvedQuestionsCount ?? 0,
        solvedSheetProblemsCount: solvedSheetProblemsCount ?? 0,
      },
    },
    { status: 200 }
  );
}
