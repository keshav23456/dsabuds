import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const userId = authResult.user.userId;

  const connections = await prisma.platformConnection.findMany({
    where: { userId },
    orderBy: [{ platform: "asc" }],
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
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ platformConnections: connections }, { status: 200 });
}
