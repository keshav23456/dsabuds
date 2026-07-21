import { prisma } from "@/lib/prisma";
import { deleteCacheByPattern } from "@/lib/cache";

export async function recalculateUserPoints(userId: string): Promise<number> {
  try {
    const connections = await prisma.platformConnection.findMany({
      where: { userId },
      select: {
        platform: true,
        problemsSolved: true,
        rating: true,
        stars: true,
      },
    });

    let totalPoints = 0;

    for (const conn of connections) {
      const platform = conn.platform.toLowerCase();
      const solved = conn.problemsSolved ?? 0;
      const rating = conn.rating ?? 0;
      const stars = conn.stars ?? 0;

      let raw = 0;
      let maxRaw = 1;
      let maxScore = 1000;

      if (platform === "leetcode") {
        raw = solved * 10 + rating * 1;
        maxRaw = 20000;
        maxScore = 1000;
      } else if (platform === "codeforces") {
        raw = solved * 15 + rating * 1.5;
        maxRaw = 18600;
        maxScore = 1000;
      } else if (platform === "codechef") {
        raw = solved * 8 + stars * 100 + rating * 0.5;
        maxRaw = 9700;
        maxScore = 500;
      } else if (platform === "gfg") {
        raw = solved * 5;
        maxRaw = 5000;
        maxScore = 500;
      }

      if (maxRaw > 0) {
        const ratio = raw / maxRaw;
        const normalized = Math.sqrt(Math.max(0, ratio));
        const platformScore = Math.min(maxScore, Math.round(normalized * maxScore));
        totalPoints += platformScore;
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { points: Math.round(totalPoints) },
    });

    await deleteCacheByPattern("leaderboard:*");

    console.log(`Recalculated points for user ${userId}: ${totalPoints}`);
    return totalPoints;
  } catch (error) {
    console.error(`Error recalculating points for user ${userId}:`, error);
    throw error;
  }
}
