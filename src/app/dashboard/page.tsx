'use client';

import { Dashboard } from '@/components/dashboard/Dashboard';
import { useDashboardShell } from '@/components/dashboard/DashboardShellContext';
import { useUserStore } from '@/store/useUserStore';

export default function DashboardPage() {
  const user = useUserStore((state) => state.user);
  const { platforms, analytics, refetch } = useDashboardShell();

  return <Dashboard user={user} platforms={platforms} analytics={analytics} onUpdate={refetch} />;
}
