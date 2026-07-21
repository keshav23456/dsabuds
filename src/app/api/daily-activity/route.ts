import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { listDailyActivityQuerySchema } from "@/lib/validation/api.validation";
import { toMidnightUTC } from "@/lib/dailyActivityHelpers";

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const userId = authResult.user.userId;

  const parsed = await listDailyActivityQuerySchema.safeParseAsync(
    Object.fromEntries(req.nextUrl.searchParams)
  );
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }
  const { take: takeQ, skip: skipQ, from: fromQ, to: toQ } = parsed.data;
  const take = takeQ ?? 60;
  const skip = skipQ ?? 0;

  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const from = fromQ ? toMidnightUTC(fromQ) : toMidnightUTC(defaultFrom);
  const to = toQ ? toMidnightUTC(toQ) : toMidnightUTC(now);

  const activities = await prisma.dailyActivity.findMany({
    where: {
      userId,
      date: { gte: from, lte: to },
    },
    take,
    skip,
    orderBy: [{ date: "asc" }],
    select: {
      id: true,
      date: true,
      count: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ dailyActivity: activities }, { status: 200 });
}
