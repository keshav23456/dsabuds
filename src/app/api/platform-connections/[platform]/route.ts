import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { recalculateUserPoints } from "@/lib/points";
import { clearAnalyticsCache } from "@/lib/dailyActivityHelpers";
import {
  platformParamSchema,
  upsertPlatformConnectionBodySchema,
} from "@/lib/validation/api.validation";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const userId = authResult.user.userId;

  const rawParams = await params;
  const parsedParams = await platformParamSchema.safeParseAsync(rawParams);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.format() }, { status: 422 });
  }

  const body = await req.json().catch(() => ({}));
  const parsedBody = await upsertPlatformConnectionBodySchema.safeParseAsync(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.format() }, { status: 422 });
  }

  const { platform } = parsedParams.data;

  const record = await prisma.platformConnection.upsert({
    where: {
      userId_platform: { userId, platform },
    },
    create: { userId, platform, ...parsedBody.data },
    update: { ...parsedBody.data },
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
      updatedAt: true,
    },
  });

  if (record && record.username) {
    clearAnalyticsCache(record.username);
  }

  await recalculateUserPoints(userId);

  return NextResponse.json({ platformConnection: record }, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const userId = authResult.user.userId;

  const rawParams = await params;
  const parsedParams = await platformParamSchema.safeParseAsync(rawParams);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.format() }, { status: 422 });
  }

  const { platform } = parsedParams.data;

  const existing = await prisma.platformConnection.findUnique({
    where: { userId_platform: { userId, platform } },
    select: { username: true },
  });

  await prisma.platformConnection.delete({
    where: { userId_platform: { userId, platform } },
  });

  if (existing && existing.username) {
    clearAnalyticsCache(existing.username);
  }

  await recalculateUserPoints(userId);

  return new NextResponse(null, { status: 204 });
}
