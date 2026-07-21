'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Sidebar } from './Sidebar';
import { DashboardSkeleton } from './DashboardSkeleton';
import { DashboardShellContext, type PlatformConnection, type DashboardAnalytics } from './DashboardShellContext';
import { useUserStore } from '@/store/useUserStore';
import apiClient from '@/lib/apiClient';
import { authService } from '@/services';

let lastDashboardFetchAt = 0;
const DASHBOARD_REFRESH_MS = 60 * 1000;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const storeUser = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [firstLoad, setFirstLoad] = useState(!storeUser);
  const [platforms, setPlatforms] = useState<PlatformConnection[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const didInit = useRef(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout failed:', e);
    }
    setUser(null);
    lastDashboardFetchAt = 0;
    window.location.href = '/login';
  };

  const fetchData = useCallback(async (force = false) => {
    if (!force && Date.now() - lastDashboardFetchAt < DASHBOARD_REFRESH_MS) {
      setFirstLoad(false);
      return;
    }

    try {
      setError(null);

      const [platRes, analyticsRes, userRes]: any[] = await Promise.all([
        apiClient.get('/platform-connections'),
        apiClient.get('/daily-activity/analytics'),
        apiClient.get('/auth/me'),
      ]);

      const p = platRes.platformConnections || platRes;
      setPlatforms(p);

      setAnalytics(analyticsRes);

      const updatedUser = userRes ? (userRes.user || userRes) : null;
      if (updatedUser) {
        setUser(updatedUser);
      }

      lastDashboardFetchAt = Date.now();
    } catch (e) {
      console.error('Failed to fetch dashboard data', e);
      setError('Failed to fetch some dashboard data. Please try again later.');
    } finally {
      setFirstLoad(false);
    }
  }, [setUser]);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProtectedRoute>
      <DashboardShellContext.Provider value={{ platforms, analytics, error, setError, refetch: fetchData, firstLoad }}>
        <div className="flex min-h-screen bg-[#000000]">
          <Sidebar user={storeUser} onLogout={handleLogout} />

          <div className="flex-1 ml-0 md:ml-20 flex flex-col h-screen overflow-hidden pt-16 md:pt-0">
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6 flex justify-between items-center">
                    <span>{error}</span>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-500 hover:text-red-400 font-bold"
                    >
                      ×
                    </button>
                  </div>
                )}
                {firstLoad && !storeUser ? <DashboardSkeleton /> : children}
              </div>
            </main>
          </div>
        </div>
      </DashboardShellContext.Provider>
    </ProtectedRoute>
  );
}
