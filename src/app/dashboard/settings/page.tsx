'use client';

import { Settings } from '@/components/dashboard/Settings';
import { useDashboardShell } from '@/components/dashboard/DashboardShellContext';

export default function SettingsPage() {
  const { platforms, refetch } = useDashboardShell();

  return <Settings platforms={platforms} onUpdate={refetch} />;
}
