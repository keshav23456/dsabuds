import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  const userId = user?.userId ?? null;

  const sheets = await prisma.sheet.findMany({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      author: true,
      sourceUrl: true,
      coverImage: true,
      totalProblems: true,
    },
  });

  let solvedBySheet: Record<string, number> = {};
  if (userId && sheets.length > 0) {
    const solvedProblems = await prisma.userSheetProblem.findMany({
      where: {
        userId,
        status: "SOLVED",
        sheetProblem: { sheetId: { in: sheets.map((s) => s.id) } },
      },
      select: {
        sheetProblemId: true,
      },
    });
    const solvedProblemIds = solvedProblems.map((g) => g.sheetProblemId);
    if (solvedProblemIds.length > 0) {
      const probs = await prisma.sheetProblem.findMany({
        where: { id: { in: solvedProblemIds } },
        select: { sheetId: true },
      });
      solvedBySheet = probs.reduce((acc: Record<string, number>, p) => {
        acc[p.sheetId] = (acc[p.sheetId] || 0) + 1;
        return acc;
      }, {});
    }
  }

  return NextResponse.json(
    {
      sheets: sheets.map((s) => ({
        ...s,
        solvedCount: solvedBySheet[s.id] || 0,
      })),
    },
    { status: 200 }
  );
}
