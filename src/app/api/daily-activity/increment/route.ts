import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { incrementDailyActivityBodySchema } from "@/lib/validation/api.validation";
import { toMidnightUTC } from "@/lib/dailyActivityHelpers";

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const userId = authResult.user.userId;

  const body = await req.json().catch(() => ({}));
  const parsed = await incrementDailyActivityBodySchema.safeParseAsync(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }

  const date = toMidnightUTC(parsed.data.date ?? new Date());
  const incrementBy = parsed.data.incrementBy ?? 1;

  const record = await prisma.dailyActivity.upsert({
    where: {
      userId_date: { userId, date },
    },
    create: { userId, date, count: incrementBy },
    update: { count: { increment: incrementBy } },
    select: { id: true, date: true, count: true, updatedAt: true },
  });

  return NextResponse.json({ dailyActivity: record }, { status: 200 });
}
