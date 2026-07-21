'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LeaderboardRow, type LeaderboardRowUser } from './LeaderboardRow';
import { TrendingUp } from 'lucide-react';
import { userService } from '@/services';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore, type User } from '@/store/useUserStore';

const LEADERBOARD_FILTERS = [
  { id: 'college', label: 'College' },
  { id: 'branch', label: 'Branch' },
  { id: 'year', label: 'Year' },
  { id: 'class', label: 'Class' },
];

interface LeaderboardEntry extends LeaderboardRowUser {
  id: string;
  userName?: string;
  rank: number | string;
  overallRank?: number | null;
}

export interface RankChangeDetails {
  rank: number | string;
  filter: string;
}

interface LeaderboardProps {
  user: User | null;
  onRankChange?: (details: RankChangeDetails) => void;
}

export function Leaderboard({ user, onRankChange }: LeaderboardProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('college');
  const [activeSubFilter, setActiveSubFilter] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | string>('-');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const currentUser = user || ({} as User);

  useEffect(() => {
    setSkip(0);
    setLeaderboardData([]);
    setHasMore(true);
    setUserRank('-');
  }, [activeFilter, activeSubFilter]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        if (skip === 0) {
          setLoading(true);
          const loggedInUser = useUserStore.getState().user;
          if (loggedInUser) {
            userService
              .getMe()
              .then((res: any) => {
                if (res?.user) {
                  useUserStore.getState().setUser(res.user);
                }
              })
              .catch((err: unknown) => console.error('Failed to refresh user profile on leaderboard load:', err));
          }
        } else {
          setLoadingMore(true);
        }
        setError(null);
        const res: any = await userService.getLeaderboard({
          filter: activeFilter,
          sortBy: activeSubFilter,
          take: 10,
          skip: skip,
        });
        if (res?.users) {
          const mapped: LeaderboardEntry[] = res.users.map((u: any, index: number) => ({
            ...u,
            avatar: u.avatarUrl || null,
            rank: u.overallRank || u.rank || skip + index + 1,
          }));
          setLeaderboardData((prev) => (skip === 0 ? mapped : [...prev, ...mapped]));
          setHasMore(mapped.length === 10);
          if (skip === 0) {
            setUserRank(res.currentUserRank ?? '-');
          }
        }
      } catch (e) {
        console.error('Failed to fetch leaderboard', e);
        setError('Could not load real leaderboard data.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchLeaderboard();
  }, [activeFilter, activeSubFilter, skip]);

  const matchedUser = leaderboardData.find((u) => {
    if (currentUser.id && u.id) return u.id === currentUser.id;
    if (currentUser.userName && u.userName) return u.userName === currentUser.userName;
    return false;
  });
  const currentUserRank = matchedUser?.rank ?? userRank;

  useEffect(() => {
    if (onRankChange) {
      onRankChange({ rank: currentUserRank, filter: activeFilter });
    }
  }, [currentUserRank, activeFilter, onRankChange]);

  const currentUserDisplayValue = matchedUser
    ? matchedUser.displayValue !== undefined && matchedUser.displayValue !== null
      ? matchedUser.displayValue
      : matchedUser.points || 0
    : currentUser.points || 0;
  const currentUserDisplayLabel = matchedUser ? matchedUser.displayLabel || 'points' : 'points';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#E5E7EB] text-4xl font-normal italic mb-2 font-serif flex items-center gap-3">
            Peer Leaderboard
            <button
              onClick={() => setShowInfo((prev) => !prev)}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
              title="Show points calculation"
            >
              <svg className="w-5 h-5 inline-block align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </h1>
          <p className="text-[#9CA3AF] font-mono text-sm">Compare coding analytics across colleges, departments, and years</p>
        </div>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowInfo(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#161B22] border border-[#1F2937] rounded-2xl p-6 w-full max-w-md relative"
            >
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-xl leading-none transition-colors cursor-pointer"
                aria-label="Close"
              >
                ×
              </button>
              <h3 className="text-[#E5E7EB] font-bold text-lg mb-2">DSABuddy Points System</h3>
              <p className="text-sm text-[#9CA3AF] leading-relaxed font-mono mb-4">
                Points are normalized across connected profiles. Overall score is the sum of these platform scores (Max 3000 overall pts):
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'LeetCode', max: 1000 },
                  { label: 'Codeforces', max: 1000 },
                  { label: 'CodeChef', max: 500 },
                  { label: 'GFG', max: 500 },
                ].map(({ label, max }) => (
                  <div key={label} className="bg-[#0D1117] p-3 rounded-lg border border-[#1F2937]/50 text-center">
                    <p className="text-[#35b9f1] font-bold text-sm">{label}</p>
                    <p className="text-xs text-[#9CA3AF] mt-1 font-mono">Max {max} pts</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {user ? (
        <div className="bg-[#161B22] border border-[#1F2937] rounded-xl p-5 flex items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-[#6B7280] text-xs font-mono tracking-wider uppercase">YOUR POSITION</p>
            <p className="text-xs text-gray-500 font-mono">
              In Active {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Cohort
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <h2 className="text-white text-5xl font-bold">#{currentUserRank}</h2>
              <div className="flex items-center gap-1 text-[#10B981] text-sm font-mono">
                <TrendingUp className="w-4 h-4" />
                <span>Standings</span>
              </div>
            </div>
          </div>

          <div className="w-px self-stretch bg-[#1F2937]" />

          <div className="flex flex-col gap-1 text-right">
            <p className="text-[#6B7280] text-xs font-mono tracking-wider uppercase">ACTIVE METRIC</p>
            <p className="text-xs text-gray-500 font-mono uppercase">{currentUserDisplayLabel}</p>
            <div className="flex items-baseline gap-1 mt-2 justify-end">
              <h3 className="text-[#35b9f1] text-5xl font-bold">
                {typeof currentUserDisplayValue === 'number'
                  ? currentUserDisplayValue.toLocaleString()
                  : String(currentUserDisplayValue ?? 0)}
              </h3>
              <span className="text-[#35b9f1] text-lg font-medium">pts</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#161B22]/60 border border-[#1F2937] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-white text-lg font-bold">Join the Leaderboard</h3>
            <p className="text-sm text-gray-400 font-mono max-w-2xl leading-relaxed">
              Log in to sync your coding profiles, track daily streaks, and compete with peers in your college cohort.
            </p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="shrink-0 px-6 py-2.5 bg-[#35b9f1] text-[#0D1117] font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            Log In / Sign Up
          </button>
        </div>
      )}

      <div className="p-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-[#1F2937]/50 pb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-[#6B7280] font-mono uppercase tracking-wider block font-semibold">FILTER COHORT</label>
              {loading && <div className="w-3.5 h-3.5 border-2 border-t-transparent border-[#35b9f1] rounded-full animate-spin" />}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
              {LEADERBOARD_FILTERS.map((filter) => {
                const isLocked = !user;
                return (
                  <button
                    key={filter.id}
                    onClick={() => {
                      if (isLocked) {
                        router.push('/login');
                      } else {
                        setActiveFilter(filter.id);
                      }
                    }}
                    className={`shrink-0 px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      !isLocked && activeFilter === filter.id
                        ? 'bg-[#35b9f1] text-[#0D1117]'
                        : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
                    } ${isLocked ? 'opacity-65 hover:opacity-100' : ''}`}
                    title={isLocked ? 'Log in to filter by cohort' : ''}
                  >
                    {filter.label}
                    {isLocked && (
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-[#6B7280] font-mono uppercase tracking-wider block font-semibold">RANK BY METRIC</label>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
              {[
                { id: 'all', label: 'Overall Points' },
                { id: 'leetcode', label: 'LeetCode' },
                { id: 'codeforces', label: 'Codeforces' },
                { id: 'codechef', label: 'CodeChef' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubFilter(sub.id)}
                  className={`shrink-0 px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeSubFilter === sub.id ? 'bg-[#35b9f1] text-[#0D1117]' : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4 text-sm font-mono">{error}</div>
        )}

        <div className={`space-y-3 relative min-h-[150px] transition-opacity duration-200 ${loading ? 'opacity-60' : 'opacity-100'}`}>
          <AnimatePresence mode="popLayout">
            {leaderboardData.length > 0
              ? leaderboardData.map((u) => (
                  <motion.div
                    key={u.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  >
                    <LeaderboardRow
                      user={u}
                      rank={u.rank}
                      isCurrentUser={u.id === currentUser.id}
                      onClick={() => router.push(`/profile/${u.userName}`)}
                    />
                  </motion.div>
                ))
              : !loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-400 text-sm font-mono text-center py-8 bg-[#0D1117] rounded-lg border border-[#1F2937]/50"
                  >
                    No entries in the leaderboard yet.
                  </motion.div>
                )}
          </AnimatePresence>

          {hasMore && leaderboardData.length > 0 && !loading && (
            <div className="flex justify-center pt-6 pb-2">
              <button
                disabled={loadingMore}
                onClick={() => setSkip((prev) => prev + 10)}
                className="w-full sm:w-auto px-8 py-3 bg-[#161B22]/30 hover:bg-[#35b9f1]/5 text-[#35b9f1] border border-[#35b9f1]/30 hover:border-[#35b9f1] rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5 min-w-[160px] shadow-[0_4px_12px_rgba(53,185,241,0.05)] hover:shadow-[0_4px_20px_rgba(53,185,241,0.15)] disabled:opacity-40 disabled:cursor-not-allowed text-xs uppercase tracking-widest font-semibold font-mono"
              >
                {loadingMore ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-t-transparent border-[#35b9f1] rounded-full animate-spin" />
                    <span className="text-[#35b9f1]/80">Loading...</span>
                  </>
                ) : (
                  <span>Load More</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
