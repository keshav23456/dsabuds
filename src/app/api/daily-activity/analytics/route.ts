import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import {
  fetchLeetCodeCalendar,
  fetchLeetCodeUserStats,
} from "@/lib/ingestion/leetcode";
import { fetchCodeforcesCalendar } from "@/lib/ingestion/codeforces";
import { fetchGfgCalendar } from "@/lib/ingestion/index";
import {
  getCachedOrFetch,
  computeCurrentStreak,
  toMidnightUTC,
} from "@/lib/dailyActivityHelpers";

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;
    const userNameParam =
      req.nextUrl.searchParams.get("userName") || req.nextUrl.searchParams.get("username");

    if (userNameParam) {
      const targetUser = await prisma.user.findUnique({
        where: { userName: userNameParam },
        select: { id: true },
      });
      if (targetUser) {
        userId = targetUser.id;
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    } else {
      const user = getUserFromRequest(req);
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      userId = user.userId;
    }

    const platform = req.nextUrl.searchParams.get("platform") ?? "all";
    const yearParamRaw = req.nextUrl.searchParams.get("year");
    const yearParam = yearParamRaw ? Number(yearParamRaw) : null;

    const connections = await prisma.platformConnection.findMany({
      where: { userId, synced: true },
    });

    const leetcodeConn = connections.find((c) => c.platform === "LEETCODE");
    const codeforcesConn = connections.find((c) => c.platform === "CODEFORCES");
    const gfgConn = connections.find((c) => c.platform === "GFG");

    const yearsSet = new Set<number>([new Date().getUTCFullYear()]);

    const localActivities = await prisma.dailyActivity.findMany({
      where: { userId },
      select: { date: true },
    });
    localActivities.forEach((act) => {
      yearsSet.add(act.date.getUTCFullYear());
    });

    if (leetcodeConn) {
      try {
        const lcData = await getCachedOrFetch(
          `lc_cal_${leetcodeConn.username.toLowerCase()}_all`,
          () => fetchLeetCodeCalendar({ username: leetcodeConn.username })
        );
        if (Array.isArray(lcData?.activeYears)) {
          lcData.activeYears.forEach((y: number) => yearsSet.add(Number(y)));
        }
      } catch (e: any) {
        console.warn("LeetCode active-years fetch failed:", e.message || e);
      }
    }

    if (codeforcesConn) {
      try {
        const cfData = await getCachedOrFetch(
          `cf_cal_${codeforcesConn.username.toLowerCase()}`,
          () => fetchCodeforcesCalendar({ username: codeforcesConn.username })
        );
        if (cfData?.submissionCalendar) {
          Object.keys(cfData.submissionCalendar).forEach((ts) => {
            const yr = new Date(Number(ts) * 1000).getUTCFullYear();
            if (yr > 2010) yearsSet.add(yr);
          });
        }
      } catch (e: any) {
        console.warn("Codeforces active-years fetch failed:", e.message || e);
      }
    }

    if (gfgConn) {
      try {
        const gfgData = await getCachedOrFetch(
          `gfg_cal_${gfgConn.username.toLowerCase()}`,
          () => fetchGfgCalendar({ username: gfgConn.username })
        );
        if (gfgData?.submissionCalendar) {
          Object.keys(gfgData.submissionCalendar).forEach((ts) => {
            const yr = new Date(Number(ts) * 1000).getUTCFullYear();
            if (yr > 2010) yearsSet.add(yr);
          });
        }
      } catch (e: any) {
        console.warn("GFG active-years fetch failed:", e.message || e);
      }
    }

    const activeYears = Array.from(yearsSet).sort((a, b) => b - a);

    const targetYear = yearParam ?? new Date().getUTCFullYear();
    const startDate = new Date(Date.UTC(targetYear, 0, 1));
    const endDate = new Date(Date.UTC(targetYear, 11, 31, 23, 59, 59));

    const minTs = Math.floor(startDate.getTime() / 1000);
    const maxTs = Math.floor(endDate.getTime() / 1000);

    const mergedActivity: Record<number, number> = {};

    if (platform === "all" || platform === "local") {
      const localActivity = await prisma.dailyActivity.findMany({
        where: {
          userId,
          date: { gte: toMidnightUTC(startDate), lte: toMidnightUTC(endDate) },
        },
      });

      localActivity.forEach((act) => {
        const ts = Math.floor(act.date.getTime() / 1000);
        mergedActivity[ts] = (mergedActivity[ts] || 0) + act.count;
      });
    }

    let lcNativeStreak = 0;
    let cfCalendar: Record<string, number> | null = null;
    let gfgCalendar: Record<string, number> | null = null;

    if ((platform === "all" || platform === "leetcode") && leetcodeConn) {
      try {
        const lcData = await getCachedOrFetch(
          `lc_cal_${leetcodeConn.username.toLowerCase()}_${yearParam ?? "current"}`,
          () => fetchLeetCodeCalendar({ username: leetcodeConn.username, year: yearParam })
        );
        if (lcData) {
          lcNativeStreak = lcData.streak ?? 0;
          const lcCalendar = lcData.submissionCalendar ?? {};
          for (const [ts, count] of Object.entries(lcCalendar)) {
            const tsNum = Number(ts);
            if (tsNum >= minTs && tsNum <= maxTs) {
              mergedActivity[tsNum] = (mergedActivity[tsNum] || 0) + (count as number);
            }
          }
        }
      } catch (e: any) {
        console.error("Error fetching LeetCode calendar:", e.message || e);
      }
    } else if (leetcodeConn) {
      try {
        const lcAllData = await getCachedOrFetch(
          `lc_cal_${leetcodeConn.username.toLowerCase()}_all`,
          () => fetchLeetCodeCalendar({ username: leetcodeConn.username })
        );
        if (lcAllData) {
          lcNativeStreak = lcAllData.streak ?? 0;
        }
      } catch {
        /* silently ignore */
      }
    }

    if ((platform === "all" || platform === "codeforces") && codeforcesConn) {
      try {
        const cfData = await getCachedOrFetch(
          `cf_cal_${codeforcesConn.username.toLowerCase()}`,
          () => fetchCodeforcesCalendar({ username: codeforcesConn.username })
        );
        if (cfData?.submissionCalendar) {
          cfCalendar = cfData.submissionCalendar;
          for (const [ts, count] of Object.entries(cfData.submissionCalendar)) {
            const tsNum = Number(ts);
            if (tsNum >= minTs && tsNum <= maxTs) {
              mergedActivity[tsNum] = (mergedActivity[tsNum] || 0) + (count as number);
            }
          }
        }
      } catch (e: any) {
        console.error("Error fetching Codeforces calendar:", e.message || e);
      }
    } else if (codeforcesConn) {
      try {
        const cfData = await getCachedOrFetch(
          `cf_cal_${codeforcesConn.username.toLowerCase()}`,
          () => fetchCodeforcesCalendar({ username: codeforcesConn.username })
        );
        cfCalendar = cfData?.submissionCalendar ?? null;
      } catch {
        /* silently ignore */
      }
    }

    if ((platform === "all" || platform === "gfg") && gfgConn) {
      try {
        const gfgData = await getCachedOrFetch(
          `gfg_cal_${gfgConn.username.toLowerCase()}`,
          () => fetchGfgCalendar({ username: gfgConn.username })
        );
        if (gfgData?.submissionCalendar) {
          gfgCalendar = gfgData.submissionCalendar;
          for (const [ts, count] of Object.entries(gfgData.submissionCalendar)) {
            const tsNum = Number(ts);
            if (tsNum >= minTs && tsNum <= maxTs) {
              mergedActivity[tsNum] = (mergedActivity[tsNum] || 0) + (count as number);
            }
          }
        }
      } catch (e: any) {
        console.error("Error fetching GFG calendar:", e.message || e);
      }
    } else if (gfgConn) {
      try {
        const gfgData = await getCachedOrFetch(
          `gfg_cal_${gfgConn.username.toLowerCase()}`,
          () => fetchGfgCalendar({ username: gfgConn.username })
        );
        gfgCalendar = gfgData?.submissionCalendar ?? null;
      } catch {
        /* silently ignore */
      }
    }

    const heatmap: { date: string; count: number }[] = [];
    let activitySubmissions = 0;
    let activeDays = 0;

    const sortedTimestamps = Object.keys(mergedActivity)
      .map(Number)
      .sort((a, b) => a - b);

    let currentStreak = 0;
    let bestStreak = 0;
    let lastDayTs = 0;

    for (const ts of sortedTimestamps) {
      const count = mergedActivity[ts];
      activitySubmissions += count;
      activeDays += 1;

      if (lastDayTs === 0 || ts - lastDayTs === 86400) {
        currentStreak += 1;
      } else if (ts - lastDayTs > 86400) {
        currentStreak = 1;
      }
      if (currentStreak > bestStreak) bestStreak = currentStreak;
      lastDayTs = ts;

      heatmap.push({
        date: new Date(ts * 1000).toISOString().split("T")[0],
        count,
      });
    }

    const allConnections = await prisma.platformConnection.findMany({
      where: { userId, synced: true },
      select: {
        platform: true,
        username: true,
        rating: true,
        problemsSolved: true,
        rankLabel: true,
        stars: true,
        lastSyncedAt: true,
        topicBreakdown: true,
      },
    });

    let totalSolved = 0;
    const platformBreakdown: any[] = [];

    for (const conn of allConnections) {
      const solved = conn.problemsSolved ?? 0;
      const pKey = conn.platform.toLowerCase();
      if (platform === "all" || platform === pKey) {
        totalSolved += solved;
      }

      let platformStreak = 0;
      if (pKey === "leetcode") platformStreak = lcNativeStreak;
      else if (pKey === "codeforces") platformStreak = computeCurrentStreak(cfCalendar);
      else if (pKey === "gfg") platformStreak = computeCurrentStreak(gfgCalendar);

      platformBreakdown.push({
        platform: conn.platform,
        username: conn.username,
        rating: conn.rating,
        rankLabel: conn.rankLabel,
        stars: conn.stars,
        solved,
        lastSyncedAt: conn.lastSyncedAt,
        topicBreakdown: conn.topicBreakdown ?? {},
        currentStreak: platformStreak,
      });
    }

    let lcDifficulty: {
      easy: number;
      medium: number;
      hard: number;
      total: number;
    } | null = null;
    if (leetcodeConn) {
      try {
        const lcStats = await getCachedOrFetch(
          `lc_stats_${leetcodeConn.username.toLowerCase()}`,
          () => fetchLeetCodeUserStats({ username: leetcodeConn.username })
        );
        lcDifficulty = {
          easy: lcStats.easySolved ?? 0,
          medium: lcStats.mediumSolved ?? 0,
          hard: lcStats.hardSolved ?? 0,
          total: lcStats.problemsSolved ?? 0,
        };
      } catch {
        /* silently ignore */
      }
    }

    const avgDaily = activeDays > 0 ? (activitySubmissions / activeDays).toFixed(1) : "0";

    const stats = [
      { label: "Avg. Daily Problems", value: avgDaily, color: "#10B981" },
      { label: "Active Days", value: String(activeDays), color: "#3B82F6" },
      { label: "Total Solved", value: String(totalSolved), color: "#F59E0B" },
      { label: "Best Streak", value: `${bestStreak} days`, color: "#8B5CF6" },
    ];

    return NextResponse.json(
      {
        heatmap,
        stats,
        activeYears,
        platformBreakdown,
        lcDifficulty,
        totalSolved,
        activeDays,
        bestStreak,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in getUnifiedAnalytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
