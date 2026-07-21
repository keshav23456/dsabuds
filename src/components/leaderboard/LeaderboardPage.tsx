'use client';

import { useState } from 'react';
import { Navbar, Footer } from '@/components/layout';
import { Leaderboard, type RankChangeDetails } from '@/components/dashboard/Leaderboard';
import { ShareStatsCard } from '@/components/dashboard/ShareStatsCard';
import { useUserStore } from '@/store/useUserStore';

export function LeaderboardPage() {
  const loggedInUser = useUserStore((state) => state.user);
  const [activeRankDetails, setActiveRankDetails] = useState<RankChangeDetails>({ rank: '—', filter: 'all' });

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-16">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
          <div className="flex-1 min-w-0">
            <Leaderboard user={loggedInUser} onRankChange={setActiveRankDetails} />
          </div>

          {loggedInUser && (
            <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-32">
              <ShareStatsCard
                user={loggedInUser}
                activeRank={activeRankDetails.rank}
                activeFilter={activeRankDetails.filter}
              />
            </aside>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default LeaderboardPage;
