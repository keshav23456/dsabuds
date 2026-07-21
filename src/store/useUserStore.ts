import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  userName: string;
  email: string;
  avatarUrl?: string | null;
  college?: string | null;
  branch?: string | null;
  socialLinks?: Record<string, string> | null;
  year: string;
  role?: string | null;
  branchChangesCount?: number;
  points?: number;
  overallRank?: number | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

interface UserStoreState {
  user: User | null;
  branch: string;
  setUser: (user: User | null) => void;
  setBranch: (branch: string) => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  user: null,
  branch: '',
  setUser: (user) => {
    set({
      user,
      branch: user?.branch || '',
    });
  },
  setBranch: (branch) => set((state) => {
    const updatedUser = state.user ? { ...state.user, branch } : null;
    return {
      branch,
      user: updatedUser,
    };
  }),
}));
