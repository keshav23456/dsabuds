'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  if (user) return null;
  return <>{children}</>;
}
