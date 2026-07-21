import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

export interface RankableUser {
  id: string;
  points?: number | null;
  college?: string | null;
  branch?: string | null;
  year?: string | null;
  email?: string | null;
  [key: string]: unknown;
}

export const enrichUserWithRanks = async <T extends RankableUser | null>(
  user: T
): Promise<(T extends null ? null : T & Record<string, unknown>) | null> => {
  if (!user) return null;
  const points = user.points ?? 0;

  if (points <= 0) {
    return {
      ...user,
      overallRank: null,
      collegeRank: null,
      branchRank: null,
      yearRank: null,
      classRank: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  const cacheKey = `user:ranks:${user.id}:${points}`;

  try {
    const cachedRanks = await getCache<Record<string, unknown>>(cacheKey);
    if (cachedRanks) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...user, ...cachedRanks } as any;
    }
  } catch (err) {
    console.error("Error reading user ranks cache:", err);
  }

  const [overallRank, collegeRank, branchRank, yearRank, classRank] = await Promise.all([
    prisma.user.count({ where: { points: { gt: points } } }).then((n: number) => n + 1),
    user.college
      ? prisma.user.count({ where: { college: user.college, points: { gt: points } } }).then((n: number) => n + 1)
      : Promise.resolve(null),
    user.branch
      ? prisma.user.count({ where: { branch: user.branch, points: { gt: points } } }).then((n: number) => n + 1)
      : Promise.resolve(null),
    user.year
      ? prisma.user.count({ where: { year: user.year, points: { gt: points } } }).then((n: number) => n + 1)
      : Promise.resolve(null),
    user.branch && user.year
      ? prisma.user
          .count({
            where: {
              branch: user.branch,
              year: user.year,
              ...(user.college ? { college: user.college } : {}),
              points: { gt: points },
            },
          })
          .then((n: number) => n + 1)
      : Promise.resolve(null),
  ]);

  const ranks = { overallRank, collegeRank, branchRank, yearRank, classRank };

  try {
    await setCache(cacheKey, ranks, 300);
  } catch (err) {
    console.error("Error writing user ranks cache:", err);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { ...user, ...ranks } as any;
};

export const isNsutOnly = (user: { email?: string | null } | null | undefined): boolean => {
  if (!user) return false;
  const email = user.email?.toLowerCase() || "";
  return email.endsWith("nsut.ac.in");
};
