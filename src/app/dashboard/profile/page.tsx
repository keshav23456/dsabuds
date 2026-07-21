'use client';

import { ProfilePage } from '@/components/profile/ProfilePage';
import { useUserStore } from '@/store/useUserStore';

export default function DashboardProfilePage() {
  const user = useUserStore((state) => state.user);

  return <ProfilePage embedded username={user?.userName} />;
}
