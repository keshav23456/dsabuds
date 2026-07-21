import { fetchJson, sleep } from "./http";
import { mapDifficultyFromCodeforcesRating, normalizeTag } from "./mappers";
import type { PrismaClient } from "@prisma/client";

const CODEFORCES_API_BASE = "https://codeforces.com/api";

function buildProblemUrl(contestId: number | null, index: string | null): string | null {
  if (!contestId || !index) return null;
  return `https://codeforces.com/problemset/problem/${contestId}/${index}`;
}

interface CodeforcesProblem {
  contestId?: number;
  index?: string;
  name?: string;
  rating?: number;
  tags?: string[];
}

export async function fetchCodeforcesProblems(): Promise<CodeforcesProblem[]> {
  const json = (await fetchJson(`${CODEFORCES_API_BASE}/problemset.problems`)) as {
    status?: string;
    comment?: string;
    result?: { problems?: CodeforcesProblem[] };
  };
  if (json?.status !== "OK") {
    throw new Error(json?.comment ?? "Codeforces API request failed");
  }
  return json.result?.problems ?? [];
}

export async function syncCodeforcesProblemsByTags({
  prisma,
  tagSlugs = [],
  maxItems = 200,
  dryRun = false,
}: {
  prisma: PrismaClient;
  tagSlugs?: string[];
  maxItems?: number;
  dryRun?: boolean;
}): Promise<{ matched: number; processed: number; upserted: number; tagLinks: number; maxItems: number }> {
  await sleep(2100);

  const desired = new Set(tagSlugs.map(normalizeTag));
  const problems = await fetchCodeforcesProblems();

  let matched = 0;
  let upserted = 0;
  let tagLinks = 0;
  let processed = 0;

  for (const p of problems) {
    const problemTags: string[] = Array.isArray(p.tags) ? p.tags : [];
    const normalized = problemTags.map(normalizeTag);

    const keep = desired.size === 0 || normalized.some((t) => desired.has(t));
    if (!keep) continue;
    matched += 1;

    if (processed >= maxItems) break;

    const contestId = p.contestId ?? null;
    const index = p.index ?? null;
    const sourceId = contestId && index ? `${contestId}${index}` : null;
    if (!sourceId) continue;

    const title = p.name ?? sourceId;
    const url = buildProblemUrl(contestId, index);
    const difficulty = mapDifficultyFromCodeforcesRating(p.rating);

    if (dryRun) {
      processed += 1;
      continue;
    }

    const cleanTags = problemTags.filter(Boolean);

    await prisma.question.upsert({
      where: {
        sourcePlatform_sourceId: {
          sourcePlatform: "CODEFORCES",
          sourceId,
        },
      },
      create: {
        title,
        displayName: `${sourceId}. ${title}`,
        difficulty,
        sourcePlatform: "CODEFORCES",
        sourceId,
        sourceSlug: index,
        slug: `cf-${sourceId.toLowerCase()}`,
        sourceUrl: url,
        sourceRating: p.rating ?? null,
        paidOnly: false,
        tags: cleanTags,
      },
      update: {
        title,
        displayName: `${sourceId}. ${title}`,
        difficulty,
        sourceSlug: index,
        slug: `cf-${sourceId.toLowerCase()}`,
        sourceUrl: url,
        sourceRating: p.rating ?? null,
        tags: cleanTags,
      },
      select: { id: true },
    });

    upserted += 1;
    tagLinks += cleanTags.length;
    processed += 1;
  }

  return { matched, processed, upserted, tagLinks, maxItems };
}

export async function fetchCodeforcesUserStats({ username }: { username: string }): Promise<any> {
  try {
    if (!username) throw new Error("Codeforces username (handle) is required");

    await sleep(1000);

    const infoJson = await fetchJson(`${CODEFORCES_API_BASE}/user.info?handles=${username}`);
    if (infoJson?.status !== "OK") {
      throw new Error(infoJson?.comment ?? `Codeforces user '${username}' not found`);
    }

    const user = infoJson.result?.[0];
    if (!user) {
      throw new Error(`Codeforces user '${username}' not found`);
    }

    await sleep(1000);

    let problemsSolved = 0;
    const topicBreakdown: Record<string, number> = {};
    try {
      const statusJson = await fetchJson(`${CODEFORCES_API_BASE}/user.status?handle=${username}`);
      if (statusJson?.status === "OK") {
        const submissions = statusJson.result ?? [];
        const uniqueSolved = new Set<string>();
        submissions.forEach((sub: any) => {
          if (sub.verdict === "OK" && sub.problem) {
            const probId = `${sub.problem.contestId}_${sub.problem.index}`;
            if (!uniqueSolved.has(probId)) {
              uniqueSolved.add(probId);
              const tags = sub.problem.tags || [];
              tags.forEach((tag: string) => {
                topicBreakdown[tag] = (topicBreakdown[tag] || 0) + 1;
              });
            }
          }
        });
        problemsSolved = uniqueSolved.size;
      }
    } catch (err) {
      console.error("Failed to fetch Codeforces submission status for solved count:", err);
    }

    return {
      username: user.handle,
      rating: user.rating ?? null,
      maxRating: user.maxRating ?? null,
      rankLabel: user.rank ?? null,
      maxRank: user.maxRank ?? null,
      problemsSolved,
      topicBreakdown,
    };
  } catch (error: any) {
    console.error(`Error fetching Codeforces stats for ${username}:`, error);
    throw new Error(`Codeforces stats fetch failed: ${error.message}`);
  }
}

export async function fetchCodeforcesCalendar({ username }: { username: string }): Promise<any> {
  try {
    if (!username) throw new Error("Codeforces username (handle) is required");

    await sleep(1000);

    const json = await fetchJson(`${CODEFORCES_API_BASE}/user.status?handle=${username}`);
    if (json?.status !== "OK") {
      throw new Error(json?.comment ?? `Codeforces status for '${username}' failed`);
    }

    const submissions = json.result ?? [];
    const submissionCalendar: Record<string, number> = {};

    submissions.forEach((sub: any) => {
      if (sub.verdict === "OK" && Number.isFinite(sub.creationTimeSeconds)) {
        const startOfDay = Math.floor(sub.creationTimeSeconds / 86400) * 86400;
        submissionCalendar[startOfDay] = (submissionCalendar[startOfDay] || 0) + 1;
      }
    });

    return {
      submissionCalendar,
      totalActiveDays: Object.keys(submissionCalendar).length,
    };
  } catch (error: any) {
    console.error(`Error fetching Codeforces calendar for ${username}:`, error);
    throw new Error(`Codeforces calendar fetch failed: ${error.message}`);
  }
}
