import type { Metadata } from 'next';
import { buildMetadata } from '@/components/common';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export const metadata: Metadata = buildMetadata({ title: 'Dashboard', noindex: true });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
