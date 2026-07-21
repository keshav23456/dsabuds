'use client';

import { useRouter } from 'next/navigation';
import { PLATFORMS as PLATFORM_ICONS } from '@/utils/platformUtils';

export interface DisplayPlatform {
  id: string;
  name: string;
  username: string;
  rating: number;
  problemsSolved: number;
  stars: number;
  rank: string;
  synced: boolean;
}

export function PlatformCard({ platform }: { platform: DisplayPlatform }) {
  const router = useRouter();
  const platformColors: Record<string, string> = {
    leetcode: '#FFA116',
    codechef: '#5B4638',
    codeforces: '#1F8ACB',
    gfg: '#2F8D46',
  };

  const color = platformColors[platform?.id] || '#35b9f1';
  const isSynced = platform?.synced !== false;
  const isConnected = Boolean(platform?.username && platform?.username !== 'Not Connected');

  const platformInfo = PLATFORM_ICONS[platform?.id];
  const IconComponent = platformInfo?.Icon;

  return (
    <div className="bg-[#161B22] rounded-xl p-6 border border-[#1F2937] hover:border-[#35b9f1]/20 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              {IconComponent ? (
                <IconComponent className={`w-7 h-7 ${isConnected ? '' : 'grayscale opacity-40 text-neutral-600'}`} style={{ color }} />
              ) : (
                <span className="text-xl font-bold" style={{ color }}>{platform?.name?.[0] || 'L'}</span>
              )}
            </div>
            <div>
              <h4 className="text-[#E5E7EB] font-bold">{platform?.name || 'LeetCode'}</h4>
              <p className="text-[#6B7280] text-xs font-mono">@{platform?.username || 'Not Connected'}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isSynced && isConnected ? 'bg-[#10B981]' : 'bg-[#6B7280]'}`} />
            <span className="text-[#6B7280] text-xs font-mono">{isSynced && isConnected ? 'Synced' : 'Offline'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0D1117] rounded-lg p-3">
            <p className="text-[#6B7280] text-xs mb-1 font-mono">RATING</p>
            <p className="text-[#E5E7EB] text-xl font-bold">
              {platform?.rating !== undefined && platform?.rating !== null ? platform.rating.toLocaleString() : '-'}
            </p>
          </div>
          <div className="bg-[#0D1117] rounded-lg p-3">
            <p className="text-[#6B7280] text-xs mb-1 font-mono">
              {platform?.id === 'codechef' ? 'STARS' : 'SOLVED'}
            </p>
            <p className="text-[#E5E7EB] text-xl font-bold">
              {platform?.id === 'codechef'
                ? (platform?.stars !== undefined && platform?.stars !== null ? `${platform.stars}★` : '-')
                : (platform?.problemsSolved !== undefined && platform?.problemsSolved !== null ? platform.problemsSolved : '-')}
            </p>
          </div>
        </div>
      </div>

      {!isConnected ? (
        <button
          onClick={() => router.push('/dashboard/settings')}
          className="mt-4 w-full py-2 bg-[#35b9f1]/10 hover:bg-[#35b9f1]/20 text-[#35b9f1] border border-[#35b9f1]/20 hover:border-[#35b9f1]/40 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
        >
          <span>Connect {platform?.name}</span>
          <span>&rarr;</span>
        </button>
      ) : (
        platform?.rank && (
          <div className="mt-3 pt-3 border-t border-[#1F2937]">
            <p className="text-[#6B7280] text-xs font-mono">
              RANK: <span className="text-[#E5E7EB]">{platform.rank}</span>
            </p>
          </div>
        )
      )}
    </div>
  );
}
