import { prisma } from "@/lib/prisma";
import { syncUserStats } from "@/lib/ingestion";
import type { Platform } from "@prisma/client";

export async function syncPlatformConnection(userId: string, platform: Platform, username: string) {
  const stats = (await syncUserStats({ platform, username })) as {
    problemsSolved?: number;
    rating?: number | null;
    maxRating?: number | null;
    rankLabel?: string | null;
    maxRank?: string | null;
    starRating?: number | null;
    stars?: number | null;
    topicBreakdown?: Record<string, number>;
  };

  const updated = await prisma.platformConnection.update({
    where: { userId_platform: { userId, platform } },
    data: {
      problemsSolved: stats.problemsSolved,
      rating: stats.rating ?? stats.maxRating ?? null,
      rankLabel: stats.rankLabel ?? stats.maxRank ?? null,
      stars: stats.starRating ?? stats.stars ?? null,
      synced: true,
      lastSyncedAt: new Date(),
      topicBreakdown: stats.topicBreakdown ?? {},
    },
  });

  return updated;
}
