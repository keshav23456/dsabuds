import { fetchJson, sleep } from "./http";
import { mapDifficultyFromLeetCode, normalizeTag } from "./mappers";
import type { PrismaClient } from "@prisma/client";

const LEETCODE_GQL = "https://leetcode.com/graphql";

const PROBLEMSET_QUERY = `
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
  problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
    total: totalNum
    questions: data {
      acRate
      difficulty
      title
      titleSlug
      paidOnly: isPaidOnly
      topicTags { name slug }
    }
  }
}
`.trim();

export const LEETCODE_CALENDAR_QUERY = `
query userProfileCalendar($username: String!, $year: Int) {
  matchedUser(username: $username) {
    userCalendar(year: $year) {
      activeYears
      streak
      totalActiveDays
      submissionCalendar
    }
  }
}
`.trim();

export const USER_PROFILE_QUERY = `
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      ranking
      reputation
      starRating
    }
    submitStats {
      acSubmissionNum {
        difficulty
        count
      }
      totalSubmissionNum {
        difficulty
        count
      }
    }
  }
}
`.trim();

export const TAGS_QUERY = `
query getUserTagStats($username: String!) {
  matchedUser(username: $username) {
    tagProblemCounts {
      advanced { tagName tagSlug problemsSolved }
      intermediate { tagName tagSlug problemsSolved }
      fundamental { tagName tagSlug problemsSolved }
    }
  }
}
`.trim();

export async function leetcodeGraphqlRequest({
  query,
  variables,
  cookies,
}: {
  query: string;
  variables: Record<string, unknown>;
  cookies?: string | null;
}): Promise<any> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(cookies ? { cookie: cookies } : {}),
  };

  const json = await fetchJson(LEETCODE_GQL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (json?.errors?.length) {
    throw new Error(json.errors[0]?.message ?? "LeetCode GraphQL error");
  }

  return json.data;
}

export function buildLeetCodeCookiesFromEnv(): string | null {
  const session = process.env.LEETCODE_SESSION;
  const csrf = process.env.LEETCODE_CSRF_TOKEN;
  const parts: string[] = [];
  if (session) parts.push(`LEETCODE_SESSION=${session}`);
  if (csrf) parts.push(`csrftoken=${csrf}`);
  return parts.length ? parts.join("; ") : null;
}

export async function fetchLeetCodeUserStats({ username }: { username: string }): Promise<any> {
  try {
    if (!username) throw new Error("LeetCode username is required");

    const cookies = buildLeetCodeCookiesFromEnv();
    await sleep(800);

    const data = await leetcodeGraphqlRequest({
      query: USER_PROFILE_QUERY,
      variables: { username },
      cookies,
    });

    const user = data?.matchedUser;
    if (!user) {
      throw new Error(`LeetCode user '${username}' not found`);
    }

    const submitStats = user.submitStats?.acSubmissionNum ?? [];
    const easyItem = submitStats.find((s: any) => s.difficulty === "Easy");
    const mediumItem = submitStats.find((s: any) => s.difficulty === "Medium");
    const hardItem = submitStats.find((s: any) => s.difficulty === "Hard");
    const allItem = submitStats.find((s: any) => s.difficulty === "All");

    const easySolved = easyItem?.count ?? 0;
    const mediumSolved = mediumItem?.count ?? 0;
    const hardSolved = hardItem?.count ?? 0;
    const totalSolved = allItem?.count ?? easySolved + mediumSolved + hardSolved;

    const ranking = user.profile?.ranking ?? null;

    let contestRating: number | null = null;
    let globalRanking: number | null = null;
    try {
      const CONTEST_QUERY = `
        query userContestRankingInfo($username: String!) {
          userContestRanking(username: $username) {
            rating
            globalRanking
          }
        }
      `.trim();
      const contestData = await leetcodeGraphqlRequest({
        query: CONTEST_QUERY,
        variables: { username },
        cookies,
      });
      if (contestData?.userContestRanking) {
        contestRating = contestData.userContestRanking.rating
          ? Math.round(contestData.userContestRanking.rating)
          : null;
        globalRanking = contestData.userContestRanking.globalRanking ?? null;
      }
    } catch (contestErr: any) {
      console.warn(`Could not fetch LeetCode contest ranking for ${username}:`, contestErr.message);
    }

    let topicBreakdown: Record<string, number> = {};
    try {
      const tagData = await leetcodeGraphqlRequest({
        query: TAGS_QUERY,
        variables: { username },
        cookies,
      });
      if (tagData?.matchedUser?.tagProblemCounts) {
        const categories = ["advanced", "intermediate", "fundamental"];
        for (const cat of categories) {
          const list = tagData.matchedUser.tagProblemCounts[cat] || [];
          for (const item of list) {
            if (item.tagName && item.problemsSolved) {
              const name = item.tagName;
              topicBreakdown[name] = (topicBreakdown[name] || 0) + item.problemsSolved;
            }
          }
        }
      }
    } catch (tagErr: any) {
      console.warn(`Could not fetch LeetCode tag stats for ${username}:`, tagErr.message);
    }

    const rankLabel = globalRanking
      ? `#${globalRanking.toLocaleString()}`
      : ranking
        ? `#${ranking.toLocaleString()}`
        : null;

    return {
      username: user.username,
      problemsSolved: totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      rating: contestRating,
      globalRanking,
      ranking,
      rankLabel,
      reputation: user.profile?.reputation ?? null,
      starRating: user.profile?.starRating ?? null,
      topicBreakdown,
    };
  } catch (error: any) {
    console.error(`Error fetching LeetCode stats for ${username}:`, error);
    throw new Error(`LeetCode stats fetch failed: ${error.message}`);
  }
}

export async function fetchLeetCodeCalendar({
  username,
  year,
}: {
  username: string;
  year?: number | null;
}): Promise<any> {
  try {
    if (!username) throw new Error("LeetCode username is required");

    const cookies = buildLeetCodeCookiesFromEnv();
    await sleep(800);

    const data = await leetcodeGraphqlRequest({
      query: LEETCODE_CALENDAR_QUERY,
      variables: { username, year },
      cookies,
    });

    const calendar = data?.matchedUser?.userCalendar;
    if (!calendar) return null;

    let submissionCalendar: Record<string, number> = {};
    try {
      if (calendar.submissionCalendar) {
        submissionCalendar = JSON.parse(calendar.submissionCalendar);
      }
    } catch (e) {
      console.error("Failed to parse LeetCode submissionCalendar:", e);
    }

    return {
      activeYears: calendar.activeYears || [],
      streak: calendar.streak || 0,
      totalActiveDays: calendar.totalActiveDays || 0,
      submissionCalendar,
    };
  } catch (error: any) {
    console.error(`Error fetching LeetCode calendar for ${username}:`, error);
    throw new Error(`LeetCode calendar fetch failed: ${error.message}`);
  }
}

export async function syncLeetCodeProblemsByTags({
  prisma,
  tagSlugs = [],
  maxItems = 200,
  maxSkip = 2000,
  dryRun = false,
}: {
  prisma: PrismaClient;
  tagSlugs?: string[];
  maxItems?: number;
  maxSkip?: number;
  dryRun?: boolean;
}): Promise<{ processed: number; upserted: number; tagLinks: number; pages: number; maxItems: number }> {
  const cookies = buildLeetCodeCookiesFromEnv();

  let upserted = 0;
  let tagLinks = 0;
  let pages = 0;
  let processed = 0;

  const uniqueTagSlugs = [...new Set(tagSlugs.map(normalizeTag))].filter(Boolean);
  const targets: (string | null)[] = uniqueTagSlugs.length ? uniqueTagSlugs : [null];

  for (const tagSlug of targets) {
    let skip = 0;
    const limit = 50;

    while (true) {
      pages += 1;
      await sleep(900);

      const variables = {
        categorySlug: "",
        limit,
        skip,
        filters: tagSlug ? { tags: [tagSlug] } : {},
      };

      const data = await leetcodeGraphqlRequest({
        query: PROBLEMSET_QUERY,
        variables,
        cookies,
      });

      const block = data?.problemsetQuestionList as
        | {
            total?: number;
            questions?: Array<{
              titleSlug?: string;
              title?: string;
              difficulty?: string;
              acRate?: number | null;
              paidOnly?: boolean;
              topicTags?: Array<{ name?: string }>;
            }>;
          }
        | undefined;
      const questions = block?.questions ?? [];
      const total = block?.total ?? 0;

      if (dryRun) {
        if (skip >= 100) break;
      } else {
        for (const q of questions) {
          if (processed >= maxItems) break;
          const titleSlug = q.titleSlug;
          if (!titleSlug) continue;

          const url = `https://leetcode.com/problems/${titleSlug}/`;
          const difficulty = mapDifficultyFromLeetCode(q.difficulty);
          const title = q.title ?? titleSlug;

          const topicTags = Array.isArray(q.topicTags) ? q.topicTags : [];
          const cleanTags = topicTags.map((t) => t?.name).filter((n): n is string => Boolean(n));

          await prisma.question.upsert({
            where: {
              sourcePlatform_sourceId: {
                sourcePlatform: "LEETCODE",
                sourceId: titleSlug,
              },
            },
            create: {
              title,
              displayName: title,
              difficulty,
              leetcodeUrl: url,
              sourcePlatform: "LEETCODE",
              sourceId: titleSlug,
              sourceSlug: titleSlug,
              slug: titleSlug,
              sourceUrl: url,
              acceptanceRate: typeof q.acRate === "number" ? q.acRate : (q.acRate ?? null),
              paidOnly: Boolean(q.paidOnly),
              tags: cleanTags,
            },
            update: {
              title,
              displayName: title,
              difficulty,
              leetcodeUrl: url,
              sourceSlug: titleSlug,
              slug: titleSlug,
              sourceUrl: url,
              acceptanceRate: typeof q.acRate === "number" ? q.acRate : (q.acRate ?? null),
              paidOnly: Boolean(q.paidOnly),
              tags: cleanTags,
            },
            select: { id: true },
          });

          upserted += 1;
          tagLinks += cleanTags.length;
          processed += 1;
        }
      }

      skip += limit;
      if (skip >= total) break;
      if (questions.length === 0) break;
      if (skip > maxSkip) break;
      if (processed >= maxItems) break;
    }
  }

  return { processed, upserted, tagLinks, pages, maxItems };
}
