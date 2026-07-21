'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/constants';

export function useNavigation() {
  const router = useRouter();

  return {
    goToHome: () => router.push(ROUTES.HOME),
    goToRegister: () => router.push(ROUTES.REGISTER),
    goToLogin: () => router.push(ROUTES.LOGIN),
    goToDashboard: () => router.push(ROUTES.DASHBOARD),
    goToProfile: () => router.push(ROUTES.PROFILE),
    goBack: () => router.back(),
  };
}
