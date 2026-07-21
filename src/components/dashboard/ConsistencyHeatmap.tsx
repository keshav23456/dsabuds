'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Activity, Calendar, Zap } from 'lucide-react';
import { activityService } from '@/services/activityService';

interface HeatmapDay {
  date: string;
  count: number;
}

interface Theme {
  colors: string[];
  accent: string;
  ring: string;
  badge: string;
  yearActive: string;
  pillActive: string;
  pillIdle: string;
}

const THEMES: Record<string, Theme> = {
  all: {
    colors: ['#0D1117', '#312E81', '#4F46E5', '#6366F1', '#818CF8'],
    accent: '#6366F1',
    ring: 'hover:ring-indigo-500/50',
    badge: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
    yearActive: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/20',
    pillActive: 'bg-indigo-500 text-white border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]',
    pillIdle: 'border-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-indigo-500/10 hover:border-indigo-500/30',
  },
  leetcode: {
    colors: ['#0D1117', '#78350F', '#B45309', '#F59E0B', '#FDE047'],
    accent: '#F59E0B',
    ring: 'hover:ring-amber-500/50',
    badge: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
    yearActive: 'bg-amber-500/10 text-amber-300 border border-amber-500/40 hover:bg-amber-500/20',
    pillActive: 'bg-amber-500 text-[#0D1117] border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
    pillIdle: 'border-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-amber-500/10 hover:border-amber-500/30',
  },
  codeforces: {
    colors: ['#0D1117', '#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA'],
    accent: '#3B82F6',
    ring: 'hover:ring-blue-500/50',
    badge: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
    yearActive: 'bg-blue-500/10 text-blue-300 border border-blue-500/40 hover:bg-blue-500/20',
    pillActive: 'bg-blue-500 text-white border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]',
    pillIdle: 'border-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-blue-500/10 hover:border-blue-500/30',
  },
};

const CELL = 12;
const GAP = 3;
const MONTH_GAP = 10;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface ConsistencyHeatmapProps {
  data?: HeatmapDay[];
  platform?: string;
  isAnalytics?: boolean;
  isReadOnly?: boolean;
}

export function ConsistencyHeatmap({
  data: initialData = [],
  platform,
  isAnalytics = false,
  isReadOnly = false,
}: ConsistencyHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(platform || 'all');
  const [selectedYear] = useState(new Date().getUTCFullYear());

  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const theme: Theme = isAnalytics
    ? {
        colors: ['#161B22', '#0e3a4e', '#166282', '#248ebc', '#35b9f1'],
        accent: '#35b9f1',
        ring: 'hover:ring-[#35b9f1]/50',
        badge: 'text-[#35b9f1] bg-[#35b9f1]/10 border-[#35b9f1]/20',
        yearActive: 'bg-[#35b9f1]/10 text-[#35b9f1] border border-[#35b9f1]/40 hover:bg-[#35b9f1]/20',
        pillActive: 'bg-[#35b9f1] text-[#0D1117] border-[#35b9f1] font-bold shadow-[0_0_12px_rgba(53,185,241,0.3)]',
        pillIdle: 'border-[#1F2937] text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[#35b9f1]/10 hover:border-[#35b9f1]/30',
      }
    : THEMES[selectedPlatform] ?? THEMES.all;

  useEffect(() => {
    if (platform) setSelectedPlatform(platform);
  }, [platform]);

  useEffect(() => {
    if (initialData && initialData.length > 0) setHeatmapData(initialData);
  }, [initialData]);

  useEffect(() => {
    if (isReadOnly) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res: any = await activityService.getAnalytics({ platform: selectedPlatform, year: selectedYear });
        if (cancelled) return;
        if (res?.heatmap) setHeatmapData(res.heatmap);
      } catch (e) {
        console.error('Heatmap fetch failed:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlatform, selectedYear, isReadOnly]);

  const weeks = useMemo(() => {
    const startOfYear = new Date(Date.UTC(selectedYear, 0, 1));
    const startDate = new Date(startOfYear);
    startDate.setUTCDate(startDate.getUTCDate() - startOfYear.getUTCDay());

    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const curYear = todayUTC.getUTCFullYear();

    if (selectedYear > curYear) return [] as { date: string; count: number; inYear: boolean }[][];

    const lastDay = selectedYear === curYear ? todayUTC : new Date(Date.UTC(selectedYear, 11, 31));

    const endDate = new Date(lastDay);
    endDate.setUTCDate(endDate.getUTCDate() + (6 - lastDay.getUTCDay()));

    const todayStr = todayUTC.toISOString().slice(0, 10);
    const days: { date: string; count: number; inYear: boolean }[] = [];
    const cur = new Date(startDate);
    while (cur <= endDate) {
      const ds = cur.toISOString().slice(0, 10);
      const hit = heatmapData.find((x) => x.date === ds);
      const inYear = cur.getUTCFullYear() === selectedYear;
      const isFuture = selectedYear === curYear && ds > todayStr;
      days.push({ date: ds, count: hit?.count ?? 0, inYear: inYear && !isFuture });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    const wks = [];
    for (let i = 0; i < days.length; i += 7) wks.push(days.slice(i, i + 7));
    return wks;
  }, [heatmapData, selectedYear]);

  const stats = useMemo(() => {
    const active = heatmapData.filter((d) => d.count > 0);
    const total = active.reduce((s, d) => s + d.count, 0);
    const sorted = [...active].sort((a, b) => (a.date < b.date ? -1 : 1));
    let maxStreak = 0;
    let cur = 0;
    sorted.forEach((entry, i) => {
      if (i === 0) {
        cur = 1;
      } else {
        const prev = new Date(sorted[i - 1].date);
        const now = new Date(entry.date);
        cur = now.getTime() - prev.getTime() === 86_400_000 ? cur + 1 : 1;
      }
      if (cur > maxStreak) maxStreak = cur;
    });
    return { total, activeDays: active.length, maxStreak };
  }, [heatmapData]);

  const gridData = useMemo(() => {
    const columns: { date: string; count: number; inYear: boolean }[][] = [];
    const monthStartCols = new Map<number, number>();
    let prevMonth: number | null = null;

    for (const week of weeks) {
      const monthSet = new Set<number>();
      week.forEach((d) => {
        if (d.inYear) monthSet.add(parseInt(d.date.slice(5, 7)));
      });
      const months = [...monthSet].sort((a, b) => a - b);

      if (months.length <= 1) {
        const mo: number | null = months[0] ?? prevMonth;
        if (mo && mo !== prevMonth) {
          monthStartCols.set(mo, columns.length);
        } else if (prevMonth === null && mo) {
          monthStartCols.set(mo, columns.length);
        }
        columns.push(week);
        if (mo) prevMonth = mo;
      } else {
        const newMo = months[months.length - 1];

        columns.push(
          week.map((d) => {
            if (d.inYear && parseInt(d.date.slice(5, 7)) === newMo) {
              return { ...d, inYear: false };
            }
            return d;
          })
        );

        monthStartCols.set(newMo, columns.length);
        columns.push(
          week.map((d) => {
            if (d.inYear && parseInt(d.date.slice(5, 7)) !== newMo) {
              return { ...d, inYear: false };
            }
            return d;
          })
        );

        prevMonth = newMo;
      }
    }

    const boundaries = new Set<number>();
    const firstMonth = monthStartCols.size > 0 ? Math.min(...monthStartCols.keys()) : 1;
    for (const [mo, colIdx] of monthStartCols) {
      if (mo > firstMonth) boundaries.add(colIdx);
    }

    const positions: number[] = [];
    let x = 0;
    for (let ci = 0; ci < columns.length; ci++) {
      if (ci > 0) x += boundaries.has(ci) ? MONTH_GAP : GAP;
      positions.push(x);
      x += CELL;
    }

    const sortedMonthStarts = Array.from(monthStartCols.entries()).sort((a, b) => a[1] - b[1]);
    const labels: { index: number; label: string; left: number }[] = [];
    for (let i = 0; i < sortedMonthStarts.length; i++) {
      const [mo, startColIdx] = sortedMonthStarts[i];
      const endColIdx = i < sortedMonthStarts.length - 1 ? sortedMonthStarts[i + 1][1] - 1 : columns.length - 1;

      const startX = positions[startColIdx] ?? 0;
      const endX = (positions[endColIdx] ?? startX) + CELL;
      const midpoint = (startX + endX) / 2;

      labels.push({ index: startColIdx, label: MONTHS[mo - 1], left: midpoint });
    }

    return {
      columns,
      monthBoundarySet: boundaries,
      colXPositions: positions,
      totalGridWidth: x,
      monthLabels: labels,
    };
  }, [weeks]);

  const { columns, monthBoundarySet, totalGridWidth, monthLabels } = gridData;

  const colour = (count: number, inYear: boolean) => {
    if (!inYear) return 'transparent';
    if (!count) return theme.colors[0];
    const c = theme.colors;
    if (count <= 2) return c[1];
    if (count <= 5) return c[2];
    if (count <= 9) return c[3];
    return c[4];
  };

  const formatTooltipDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const gridWidth = totalGridWidth;

  const statCards = [
    { label: 'Submissions', value: stats.total, sublabel: `in ${selectedYear}`, icon: Activity, color: theme.accent },
    { label: 'Active Days', value: stats.activeDays, sublabel: 'coding consistency', icon: Calendar, color: theme.accent },
    { label: 'Max Streak', value: stats.maxStreak, sublabel: 'consecutive days', icon: Zap, color: theme.accent },
  ];

  if (isAnalytics) {
    return (
      <div className="space-y-2 font-mono select-none relative heatmap-wrapper">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-bold text-[#E5E7EB]">{stats.total} problems this year</span>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-[#9CA3AF] mr-1">Less</span>
            <div className="w-2.5 h-2.5 bg-[#161B22] border border-[#1F2937] rounded-[2px]" />
            <div className="w-2.5 h-2.5 bg-[#0e3a4e] rounded-[2px]" />
            <div className="w-2.5 h-2.5 bg-[#166282] rounded-[2px]" />
            <div className="w-2.5 h-2.5 bg-[#248ebc] rounded-[2px]" />
            <div className="w-2.5 h-2.5 bg-[#35b9f1] rounded-[2px]" />
            <span className="text-[9px] text-[#9CA3AF] ml-1">More</span>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-visible scrollbar-thin pb-2 pt-4 px-2 heatmap-container relative">
          <div style={{ width: gridWidth + 32, minWidth: gridWidth + 32 }} className="relative">
            <div className="relative h-[16px] mb-[6px] flex items-center">
              <div className="w-8 shrink-0" />
              <div className="relative flex-1 h-full">
                {monthLabels.map(({ index, label, left }) => (
                  <span
                    key={index}
                    className="absolute top-0 text-[10px] text-[#9CA3AF] select-none tracking-normal font-bold"
                    style={{ left: `${left}px`, transform: 'translateX(-50%)' }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-0 items-start">
              <div className="flex flex-col shrink-0 select-none text-[9px] text-[#9CA3AF] text-right pr-2 w-8 gap-[3px]">
                <div className="h-[12px] flex items-center justify-end text-transparent select-none pointer-events-none">Sun</div>
                <div className="h-[12px] flex items-center justify-end font-bold">Mon</div>
                <div className="h-[12px] flex items-center justify-end text-transparent select-none pointer-events-none">Tue</div>
                <div className="h-[12px] flex items-center justify-end font-bold">Wed</div>
                <div className="h-[12px] flex items-center justify-end text-transparent select-none pointer-events-none">Thu</div>
                <div className="h-[12px] flex items-center justify-end font-bold">Fri</div>
                <div className="h-[12px] flex items-center justify-end text-transparent select-none pointer-events-none">Sat</div>
              </div>

              <div className="flex overflow-visible">
                {columns.map((col, ci) => (
                  <div
                    key={ci}
                    className="flex flex-col gap-[3px] overflow-visible"
                    style={{ marginLeft: ci === 0 ? 0 : monthBoundarySet.has(ci) ? MONTH_GAP : GAP }}
                  >
                    {col.map((day) => {
                      const isCellInYear = day.inYear;
                      const bgCol = colour(day.count, isCellInYear);

                      return (
                        <div
                          key={day.date}
                          onMouseEnter={(e) => {
                            if (!isCellInYear) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredDay(day);
                            setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 6 });
                          }}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`w-3 h-3 rounded-[4px] cursor-pointer transition-[box-shadow] duration-100
                                      ${!isCellInYear ? 'opacity-0 pointer-events-none' : 'hover:brightness-125'}`}
                          style={{ backgroundColor: bgCol, boxSizing: 'border-box' }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {hoveredDay &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              className="fixed z-50 bg-[#161B22] border border-[#1F2937] rounded-xl p-3.5 shadow-[0_12px_24px_rgba(0,0,0,0.5)] text-xs w-48 text-[#E5E7EB] pointer-events-none"
              style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px`, transform: 'translate(-50%, -100%)', marginTop: '-4px' }}
            >
              <div className="font-bold border-b border-[#1F2937] pb-1.5 mb-1.5 text-xs text-white">
                {formatTooltipDate(hoveredDay.date)}
              </div>
              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#9CA3AF]">
                    {selectedPlatform === 'all'
                      ? 'Submissions'
                      : selectedPlatform === 'leetcode'
                        ? 'LeetCode'
                        : selectedPlatform === 'codeforces'
                          ? 'Codeforces'
                          : selectedPlatform === 'codechef'
                            ? 'CodeChef'
                            : 'GFG'}
                    :
                  </span>
                  <span className="font-bold text-[#35b9f1]">{hoveredDay.count}</span>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    );
  }

  return (
    <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 relative pb-11 heatmap-wrapper h-full flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-[#E6EDF3] text-lg tracking-tight">Consistency Visualizer</h3>
          {loading && (
            <span className={`text-[10px] font-mono border px-2.5 py-1 rounded-md animate-pulse ${theme.badge}`}>syncing…</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All' },
            { id: 'leetcode', label: 'LeetCode' },
            { id: 'codeforces', label: 'Codeforces' },
          ].map(({ id, label }) => {
            const t = THEMES[id];
            return (
              <button
                key={id}
                onClick={() => setSelectedPlatform(id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono border
                            transition-all duration-150 cursor-pointer
                            ${selectedPlatform === id ? t.pillActive : `bg-[#0D1117] ${t.pillIdle}`}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-[#0D1117]/60 border border-[#21262D] rounded-xl p-4 flex items-center justify-between hover:border-gray-700/80 transition-all duration-300"
            >
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-[#8B949E] uppercase tracking-wider block">{card.label}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl tracking-tight" style={{ color: card.color }}>
                    {card.value}
                  </span>
                  <span className="text-[10px] font-medium font-mono text-[#484F58]">{card.sublabel}</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#161B22] border border-[#21262D] text-gray-400">
                <Icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto overflow-y-visible scrollbar-thin pb-1 pt-10 px-2 heatmap-container relative">
        <div style={{ width: gridWidth + 32, minWidth: gridWidth + 32 }} className="relative">
          <div className="relative h-[16px] mb-[6px] flex items-center">
            <div className="w-8 shrink-0" />
            <div className="relative flex-1 h-full">
              {monthLabels.map(({ index, label, left }) => (
                <span
                  key={index}
                  className="absolute top-0 text-[11px] text-[#8B949E] select-none tracking-normal font-mono"
                  style={{ left: `${left}px`, transform: 'translateX(-50%)' }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-0 items-start">
            <div className="flex flex-col shrink-0 select-none text-[10px] text-[#8B949E] font-mono text-right pr-2 w-8 gap-[3px]">
              <div className="h-[12px] flex items-center justify-end text-transparent select-none pointer-events-none">Sun</div>
              <div className="h-[12px] flex items-center justify-end text-[#8B949E]">Mon</div>
              <div className="h-[12px] flex items-center justify-end text-transparent select-none pointer-events-none">Tue</div>
              <div className="h-[12px] flex items-center justify-end text-[#8B949E]">Wed</div>
              <div className="h-[12px] flex items-center justify-end text-transparent select-none pointer-events-none">Thu</div>
              <div className="h-[12px] flex items-center justify-end text-[#8B949E]">Fri</div>
              <div className="h-[12px] flex items-center justify-end text-transparent select-none pointer-events-none">Sat</div>
            </div>

            <div className="flex overflow-visible">
              {columns.map((col, ci) => (
                <div
                  key={ci}
                  className="flex flex-col gap-[3px] overflow-visible"
                  style={{ marginLeft: ci === 0 ? 0 : monthBoundarySet.has(ci) ? MONTH_GAP : GAP }}
                >
                  {col.map((day) => {
                    const isCellInYear = day.inYear;
                    const bgCol = colour(day.count, isCellInYear);
                    const hasBorder = day.count === 0 && isCellInYear;

                    return (
                      <div
                        key={day.date}
                        onMouseEnter={(e) => {
                          if (!isCellInYear) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredDay(day);
                          setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 6 });
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-3 h-3 rounded-[4px] cursor-pointer transition-[box-shadow] duration-100
                                    ${!isCellInYear ? 'opacity-0 pointer-events-none' : 'hover:brightness-125'}
                                    ${hasBorder ? 'border border-[#21262D]' : 'border border-transparent'}`}
                        style={{ backgroundColor: bgCol, boxSizing: 'border-box' }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end mt-[8px] gap-4 font-mono text-[10px] text-[#8B949E]">
            {[
              { label: '0', count: 0, inYear: true },
              { label: '1–2', count: 1, inYear: true },
              { label: '3–5', count: 3, inYear: true },
              { label: '6–9', count: 6, inYear: true },
              { label: '10+', count: 10, inYear: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-[4px] select-none">
                <div
                  className={`w-3 h-3 rounded-[4px] border ${item.count === 0 ? 'border-[#21262D] bg-[#0D1117]' : 'border-transparent'}`}
                  style={{ backgroundColor: colour(item.count, item.inYear), boxSizing: 'border-box' }}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {hoveredDay &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed z-50 bg-[#0D1117] border border-[#30363D] rounded-xl p-3.5 shadow-[0_12px_24px_rgba(0,0,0,0.5)] text-xs w-52 text-[#E6EDF3] pointer-events-none"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px`, transform: 'translate(-50%, -100%)', marginTop: '-4px' }}
          >
            <div className="border-b border-[#30363D] pb-1.5 mb-1.5 text-xs text-white">{formatTooltipDate(hoveredDay.date)}</div>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-[#8B949E]">
                  {selectedPlatform === 'all' ? 'Submissions' : selectedPlatform === 'leetcode' ? 'LeetCode' : 'Codeforces'}:
                </span>
                <span className="text-white bg-[#21262D] px-2 py-0.5 rounded text-[10px]">{hoveredDay.count}</span>
              </div>
              {hoveredDay.count === 0 && <div className="text-[#484F58] text-[10px]">No submissions</div>}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
