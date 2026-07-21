'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/constants';
import type { User } from '@/store/useUserStore';

export function getInitials(name?: string | null) {
  if (!name) return '?';
  const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getDerivedRole(user?: User | null) {
  if (!user) return '';
  if (user.role) return user.role;
  const branchName = user.branch || '';
  const match = branchName.match(/\(([^)]+)\)/);
  const abbrev = match ? match[1] : (branchName || 'CS');
  const year = user.year || '2024';
  return `${abbrev} - ${year}`;
}

interface TopbarProps {
  user: User | null;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

export function Topbar({ user, onSectionChange, onLogout }: TopbarProps) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const avatarUrl = user?.avatarUrl;
  const showInitials = imgError || !avatarUrl;

  return (
    <div className="h-16 bg-[#000000] border-b border-neutral-900 flex items-center justify-between px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(ROUTES.HOME)}
          className="text-[#E5E7EB] font-bold text-xl hover:text-[#35b9f1] transition-colors cursor-pointer"
        >
          DSABuddy
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => onSectionChange('settings')}
          className="p-2 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
          title="Settings"
        >
          <svg className="w-5 h-5 text-[#525252] hover:text-[#35b9f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <button
          onClick={onLogout}
          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group cursor-pointer"
          title="Logout"
        >
          <svg className="w-5 h-5 text-[#525252] group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-neutral-900">
          {user ? (
            <>
              <div className="text-right">
                <p className="text-[#E5E7EB] text-sm font-medium">{user.name}</p>
                <p className="text-[#525252] text-xs font-mono">{getDerivedRole(user)}</p>
              </div>
              {showInitials ? (
                <div className="w-10 h-10 rounded-full border-2 border-[#35b9f1] flex items-center justify-center bg-gradient-to-br from-[#35b9f1]/20 to-[#35b9f1]/5 text-[#35b9f1] font-bold text-sm select-none">
                  {getInitials(user.name)}
                </div>
              ) : (
                <img
                  src={avatarUrl ?? undefined}
                  alt="User avatar"
                  onError={() => setImgError(true)}
                  className="w-10 h-10 rounded-full border-2 border-[#35b9f1] object-cover"
                />
              )}
            </>
          ) : (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="text-right space-y-1">
                <div className="h-4 bg-neutral-900 w-20 rounded border border-neutral-900/30"></div>
                <div className="h-3 bg-neutral-900 w-16 rounded border border-neutral-900/30"></div>
              </div>
              <div className="w-10 h-10 rounded-full bg-neutral-900 border-2 border-neutral-900"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
