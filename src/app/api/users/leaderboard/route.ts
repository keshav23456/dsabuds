import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { getCache, setCache } from "@/lib/cache";
import { paginationQuerySchema } from "@/lib/validation/api.validation";

const PLATFORM_SORT_MAP: Record<string, "LEETCODE" | "CODEFORCES" | "CODECHEF"> = {
  leetcode: "LEETCODE",
  codeforces: "CODEFORCES",
  codechef: "CODECHEF",
};

const getRequestingUserRank = async (
  requestingUserId: string | null,
  requestingUserPoints: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  whereClause: any,
  sortBy: string | undefined,
  platformKey: "LEETCODE" | "CODEFORCES" | "CODECHEF" | undefined
) => {
  if (!requestingUserId) return null;

  if (platformKey) {
    const userConnection = await prisma.platformConnection.findFirst({
      where: { userId: requestingUserId, platform: platformKey },
      select: { rating: true },
    });
    const requestingUserRating = userConnection?.rating ?? -1;

    const [higherRatingCount, equalRatingHigherPointsCount] = await Promise.all([
      prisma.user.count({
        where: {
          ...whereClause,
          platformConnections: {
            some: { platform: platformKey, rating: { gt: requestingUserRating } },
          },
        },
      }),
      prisma.user.count({
        where: {
          ...whereClause,
          OR: [
            {
              points: { gt: requestingUserPoints },
              platformConnections: {
                some: { platform: platformKey, rating: requestingUserRating },
              },
            },
            ...(requestingUserRating === -1
              ? [
                  {
                    points: { gt: requestingUserPoints },
                    platformConnections: { none: { platform: platformKey } },
                  },
                ]
              : []),
          ],
        },
      }),
    ]);

    return higherRatingCount + equalRatingHigherPointsCount + 1;
  }

  const rank = await prisma.user
    .count({ where: { ...whereClause, points: { gt: requestingUserPoints } } })
    .then((n) => n + 1);

  return rank;
};

export async function GET(req: NextRequest) {
  const query = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = await paginationQuerySchema.safeParseAsync(query);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }
  const { take: takeParsed, skip: skipParsed, filter, sortBy } = parsed.data;

  const take = takeParsed ?? 50;
  const skip = skipParsed ?? 0;
  const requestingUserId = getUserFromRequest(req)?.userId ?? null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = { points: { gt: 0 } };
  let requestingUser: { college: string | null; branch: string | null; year: string | null; points: number } | null = null;
  if (requestingUserId) {
    requestingUser = await prisma.user.findUnique({
      where: { id: requestingUserId },
      select: { college: true, branch: true, year: true, points: true },
    });
  }

  let filterValue: string | null = null;
  if (filter && requestingUser) {
    if (filter === "college" && requestingUser.college) {
      whereClause.college = requestingUser.college;
      filterValue = requestingUser.college;
    } else if (filter === "branch" && requestingUser.branch) {
      whereClause.branch = requestingUser.branch;
      filterValue = requestingUser.branch;
    } else if (filter === "year" && requestingUser.year) {
      whereClause.year = requestingUser.year;
      filterValue = requestingUser.year;
    } else if (filter === "class" && requestingUser.branch && requestingUser.year) {
      whereClause.branch = requestingUser.branch;
      whereClause.year = requestingUser.year;
      if (requestingUser.college) {
        whereClause.college = requestingUser.college;
      }
      filterValue = `${requestingUser.college || "none"}_${requestingUser.branch}_${requestingUser.year}`;
    }
  }

  const cacheKey = `leaderboard:${filter ?? "all"}:${filterValue ?? "none"}:${sortBy ?? "points"}:${take}:${skip}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let leaderboardResult: any = null;
  const cachedLeaderboard = await getCache<Record<string, unknown>>(cacheKey);

  if (cachedLeaderboard) {
    leaderboardResult = cachedLeaderboard;
  } else {
    const platformKey = sortBy ? PLATFORM_SORT_MAP[sortBy] : undefined;

    if (platformKey) {
      const allUsers = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          userName: true,
          avatarUrl: true,
          branch: true,
          year: true,
          points: true,
          platformConnections: {
            where: { platform: platformKey },
            select: { rating: true },
            take: 1,
          },
        },
      });

      allUsers.sort((a, b) => {
        const ratingA = a.platformConnections[0]?.rating ?? -1;
        const ratingB = b.platformConnections[0]?.rating ?? -1;
        if (ratingB !== ratingA) {
          return ratingB - ratingA;
        }
        return (b.points ?? 0) - (a.points ?? 0);
      });

      let rank = 0;
      let prevRating: number | null = null;
      const usersWithRank = allUsers.map((u, idx) => {
        const { platformConnections, ...rest } = u;
        const rating = platformConnections[0]?.rating ?? -1;
        if (idx === 0 || rating !== prevRating) {
          rank = idx + 1;
        }
        prevRating = rating;
        return {
          ...rest,
          overallRank: rank,
          displayValue: platformConnections[0]?.rating ?? null,
          displayLabel: `${sortBy} rating`,
        };
      });

      const paginatedUsers = usersWithRank.slice(skip, skip + take);
      leaderboardResult = { users: paginatedUsers };
    } else {
      const pageUsers = await prisma.user.findMany({
        where: whereClause,
        orderBy: [{ points: "desc" }, { createdAt: "asc" }],
        skip,
        take,
        select: {
          id: true,
          name: true,
          userName: true,
          avatarUrl: true,
          branch: true,
          year: true,
          points: true,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let usersWithRank: any[] = [];
      if (pageUsers.length > 0) {
        const rankOffset = await prisma.user.count({
          where: { ...whereClause, points: { gt: pageUsers[0].points } },
        });

        let rank = rankOffset + 1;
        let prevPoints = pageUsers[0].points;
        usersWithRank = pageUsers.map((u, i) => {
          if (i > 0 && u.points !== prevPoints) {
            rank = skip + i + 1;
          }
          prevPoints = u.points;
          return {
            ...u,
            overallRank: rank,
            displayValue: u.points,
            displayLabel: "points",
          };
        });
      }
      leaderboardResult = { users: usersWithRank };
    }

    try {
      await setCache(cacheKey, leaderboardResult, 300);
    } catch (err) {
      console.error("Error writing leaderboard cache:", err);
    }
  }

  let currentUserRank = null;
  if (requestingUserId && requestingUser) {
    const platformKey = sortBy ? PLATFORM_SORT_MAP[sortBy] : undefined;
    try {
      currentUserRank = await getRequestingUserRank(
        requestingUserId,
        requestingUser.points,
        whereClause,
        sortBy,
        platformKey
      );
    } catch (err) {
      console.error("Error calculating current user rank:", err);
    }
  }

  return NextResponse.json(
    {
      ...leaderboardResult,
      currentUserRank,
    },
    { status: 200 }
  );
}
