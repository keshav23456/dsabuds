const memoryCache = new Map<string, { data: any; expiresAt: number }>();

export const clearAnalyticsCache = (username?: string | null) => {
  if (!username) return;
  const lower = username.toLowerCase();
  for (const key of memoryCache.keys()) {
    if (key.includes(lower)) {
      memoryCache.delete(key);
    }
  }
};

export const getCachedOrFetch = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs = 15 * 60 * 1000
): Promise<T> => {
  const cached = memoryCache.get(key);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }
  const data = await fetchFn();
  memoryCache.set(key, { data, expiresAt: now + ttlMs });
  return data;
};

export const toMidnightUTC = (d: Date | string | number): Date => {
  const date = new Date(d);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

export const computeCurrentStreak = (
  submissionCalendar: Record<string, number> | null | undefined
): number => {
  if (!submissionCalendar || Object.keys(submissionCalendar).length === 0) return 0;

  const activeDaySet = new Set<number>();
  for (const tsStr of Object.keys(submissionCalendar)) {
    const tsNum = Number(tsStr);
    const d = new Date(tsNum * 1000);
    const midnightTs = Math.floor(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000
    );
    activeDaySet.add(midnightTs);
  }

  const nowUtc = new Date();
  const todayTs = Math.floor(
    Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate()) / 1000
  );
  const yesterdayTs = todayTs - 86400;

  let startTs = todayTs;
  if (!activeDaySet.has(todayTs)) {
    if (activeDaySet.has(yesterdayTs)) {
      startTs = yesterdayTs;
    } else {
      return 0;
    }
  }

  let streak = 0;
  let cursor = startTs;
  while (activeDaySet.has(cursor)) {
    streak++;
    cursor -= 86400;
  }
  return streak;
};
