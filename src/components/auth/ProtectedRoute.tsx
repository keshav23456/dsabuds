'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { userService } from '@/services';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [checking, setChecking] = useState(!user);

  useEffect(() => {
    if (user) { setChecking(false); return; }
    userService.getMe()
      .then((res: any) => setUser(res.user || res))
      .catch(() => {})
      .finally(() => setChecking(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!checking && !user) {
      router.replace('/login');
    }
  }, [checking, user, router]);

  if (checking) return null;
  if (!user) return null;
  return <>{children}</>;
}
