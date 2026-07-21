import type { PrismaClient } from "@prisma/client";
import { fetchCodeforcesUserStats, syncCodeforcesProblemsByTags } from "./codeforces";
import { fetchLeetCodeUserStats, syncLeetCodeProblemsByTags } from "./leetcode";
import { fetchCodechefUserStats } from "./codechef";
import { fetchGfgUserStats, fetchGfgCalendar } from "./gfg";

export { fetchGfgCalendar };

export async function syncProblems({
  prisma,
  platforms = ["codeforces", "leetcode"],
  tagSlugs = [],
  maxItems = 200,
  maxSkip = 2000,
  dryRun = false,
}: {
  prisma: PrismaClient;
  platforms?: string[];
  tagSlugs?: string[];
  maxItems?: number;
  maxSkip?: number;
  dryRun?: boolean;
}): Promise<Record<string, unknown>> {
  const wanted = new Set(platforms.map((p) => String(p).toLowerCase()));

  const results: Record<string, unknown> = {};

  if (wanted.has("codeforces")) {
    try {
      results.codeforces = await syncCodeforcesProblemsByTags({ prisma, tagSlugs, maxItems, dryRun });
    } catch (error) {
      console.error("Codeforces sync failed:", error);
      results.codeforces = { error: error instanceof Error ? error.message : String(error) };
    }
  }

  if (wanted.has("leetcode")) {
    try {
      results.leetcode = await syncLeetCodeProblemsByTags({ prisma, tagSlugs, maxItems, maxSkip, dryRun });
    } catch (error) {
      console.error("LeetCode sync failed:", error);
      results.leetcode = { error: error instanceof Error ? error.message : String(error) };
    }
  }

  return results;
}

export async function syncUserStats({
  platform,
  username,
}: {
  platform: string;
  username: string;
}): Promise<any> {
  const platformLower = String(platform).toLowerCase();

  if (platformLower === "leetcode") {
    return await fetchLeetCodeUserStats({ username });
  }

  if (platformLower === "codeforces") {
    return await fetchCodeforcesUserStats({ username });
  }

  if (platformLower === "codechef") {
    return await fetchCodechefUserStats({ username });
  }

  if (platformLower === "gfg") {
    return await fetchGfgUserStats({ username });
  }

  throw new Error(`Platform '${platform}' user stats sync not implemented`);
}
