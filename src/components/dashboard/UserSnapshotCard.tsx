'use client';

import { useState } from 'react';
import { useUserStore, type User } from '@/store/useUserStore';

export function getInitials(name?: string | null) {
  if (!name) return '?';
  const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getBranchAbbreviation(branchName?: string | null) {
  if (!branchName) return 'CS';
  const match = branchName.match(/\(([^)]+)\)/);
  return match ? match[1] : branchName;
}

interface UserSnapshotCardUser extends Partial<User> {
  avatar?: string | null;
  rank?: number | string | null;
}

export function UserSnapshotCard({ user: propUser }: { user?: UserSnapshotCardUser | null }) {
  const globalUser = useUserStore((state) => state.user);
  const user = propUser || globalUser;
  const [imgError, setImgError] = useState(false);
  const avatarUrl = (user?.avatarUrl || user?.avatar) as string | null | undefined;
  const showInitials = imgError || !avatarUrl;

  return (
    <div className="bg-[#161B22] rounded-xl p-8 border border-[#1F2937] hover:border-[#35b9f1]/20 transition-all flex flex-col justify-between h-full min-h-[380px]">
      <div className="flex flex-col items-center text-center mb-8 mt-2">
        {showInitials ? (
          <div className="w-24 h-24 rounded-full border-2 border-[#35b9f1] flex items-center justify-center bg-gradient-to-br from-[#35b9f1]/20 to-[#35b9f1]/5 text-[#35b9f1] font-black text-4xl select-none mb-4 shadow-lg">
            {getInitials(user?.name)}
          </div>
        ) : (
          <img
            src={avatarUrl ?? undefined}
            alt={user?.name ?? ''}
            onError={() => setImgError(true)}
            className="w-24 h-24 rounded-full border-2 border-[#35b9f1] object-cover mb-4 shadow-lg"
          />
        )}
        <div>
          <h3 className="text-[#E5E7EB] font-bold text-3xl tracking-tight">{user?.name || 'Alex Chen'}</h3>
          <p className="text-[#9CA3AF] text-sm font-mono mt-2 uppercase tracking-wider font-bold">
            {getBranchAbbreviation(user?.branch)} — {user?.year || '2024'}
          </p>
          {user?.branch && (
            <p className="text-[#6B7280] text-xs font-medium mt-2 leading-relaxed max-w-[240px] mx-auto">
              {user.branch}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0D1117] rounded-lg p-5 text-center">
          <p className="text-[#6B7280] text-xs mb-1 font-mono">OVERALL RANK</p>
          <p className="text-[#35b9f1] text-3xl font-bold">
            {user?.overallRank || user?.rank ? `#${user.overallRank || user.rank}` : '-'}
          </p>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-5 text-center">
          <p className="text-[#6B7280] text-xs mb-1 font-mono">POINTS</p>
          <p className="text-[#35b9f1] text-3xl font-bold">
            {(user?.points ?? 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
