'use client';

import { createContext, useContext } from 'react';

export interface PlatformConnection {
  id: string;
  platform: string;
  username: string;
  rating?: number | null;
  stars?: number | null;
  problemsSolved?: number | null;
  rankLabel?: string | null;
  synced: boolean;
  lastSyncedAt?: string | null;
  topicBreakdown?: unknown;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardAnalytics {
  heatmap: { date: string; count: number }[];
  stats: { label: string; value: string; color: string }[];
  activeYears: number[];
  platformBreakdown: unknown[];
  lcDifficulty: { easy: number; medium: number; hard: number; total: number } | null;
  totalSolved: number;
  activeDays: number;
  bestStreak: number;
  [key: string]: unknown;
}

export interface DashboardShellContextValue {
  platforms: PlatformConnection[];
  analytics: DashboardAnalytics | null;
  error: string | null;
  setError: (error: string | null) => void;
  refetch: (force?: boolean) => Promise<void>;
  firstLoad: boolean;
}

export const DashboardShellContext = createContext<DashboardShellContextValue | null>(null);

export function useDashboardShell() {
  const ctx = useContext(DashboardShellContext);
  if (!ctx) {
    throw new Error('useDashboardShell must be used within the dashboard layout');
  }
  return ctx;
}
