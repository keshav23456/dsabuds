'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/userService';
import { activityService } from '@/services/activityService';
import { authService } from '@/services/authService';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { ConsistencyHeatmap } from '@/components/dashboard/ConsistencyHeatmap';
import { useUserStore } from '@/store/useUserStore';
import { Trophy, Award, Calendar, School, BookOpen, Activity, AlertCircle, ArrowUpRight, Share2, CheckCircle2, Link2 } from 'lucide-react';
import { Button, StatCard } from '@/components/common';
import { PLATFORMS, SOCIAL_LINKS } from '@/config/constants';
import { SocialIcon } from '@/utils/socialIcons';
import { getHistoryForFilter, getInitials, TAG_MAPPING } from './profileHelpers';

interface PlatformConnectionData {
  platform: string;
  username: string;
  rating?: number | null;
  stars?: number | null;
  problemsSolved?: number | null;
  rankLabel?: string | null;
  synced?: boolean;
  topicBreakdown?: Record<string, number> | null;
}

interface ProfileData {
  name: string;
  userName: string;
  avatarUrl?: string | null;
  college?: string | null;
  branch?: string | null;
  year?: string | null;
  createdAt?: string;
  points?: number;
  overallRank?: number | null;
  branchRank?: number | null;
  yearRank?: number | null;
  solvedQuestionsCount?: number;
  solvedSheetProblemsCount?: number;
  socialLinks?: Record<string, string> | null;
  platformConnections?: PlatformConnectionData[];
  dailyActivity?: { date: string; count: number }[];
}

interface HoveredChartPoint {
  idx: number;
  label: string;
  x: number;
  y?: number;
  rating?: number;
  platform?: string;
  color?: string;
  platforms?: { name: string; rating: number; color: string; y: number }[];
}

interface ProfilePageProps {
  embedded?: boolean;
  username?: string;
}

export function ProfilePage({ embedded = false, username: usernameProp }: ProfilePageProps) {
  const username = usernameProp;
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);

  const loggedInUser = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  const [timeFilter, setTimeFilter] = useState('1y');
  const [comparePlatforms, setComparePlatforms] = useState(true);
  const [activePlatformTab, setActivePlatformTab] = useState('leetcode');
  const [hoveredChartPoint, setHoveredChartPoint] = useState<HoveredChartPoint | null>(null);
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    if (!username) return;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        setImgError(false);

        const res: any = await userService.getUserByUserName(username);

        if (res?.user) {
          setProfile(res.user);
          const connections = res.user.platformConnections || [];
          const activeConn = connections.find((c: PlatformConnectionData) => c.rating);
          if (activeConn) {
            setActivePlatformTab(activeConn.platform.toLowerCase());
          }
        } else {
          setError('User profile not found.');
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError('Could not retrieve user profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  useEffect(() => {
    if (!username) return;

    let cancelled = false;
    const fetchPlatformAnalytics = async () => {
      try {
        const analyticsRes: any = await activityService.getAnalytics({
          userName: username,
          platform: activePlatformTab,
        });
        if (cancelled) return;
        if (analyticsRes && Array.isArray(analyticsRes.heatmap)) {
          setHeatmapData(analyticsRes.heatmap);
        } else {
          setHeatmapData([]);
        }
      } catch (err) {
        console.warn('Failed to fetch platform analytics:', err);
        if (!cancelled) setHeatmapData([]);
      }
    };

    fetchPlatformAnalytics();
    return () => {
      cancelled = true;
    };
  }, [username, activePlatformTab]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout failed:', e);
    }
    setUser(null);
    window.location.href = '/login';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `#${rank}`;
  };

  const rankColors: Record<number, string> = { 1: '#35b9f1', 2: '#E5E7EB', 3: '#CD7F32' };
  const rankColor = profile ? rankColors[profile.overallRank ?? -1] || '#35b9f1' : '#35b9f1';
  const showInitials = imgError || !profile?.avatarUrl;

  const allPlatforms = PLATFORMS;

  const displayConnections = useMemo(() => {
    if (!profile) return [];
    return allPlatforms.map((plat) => {
      const conn = (profile.platformConnections || []).find((c) => c.platform.toUpperCase() === plat.key);
      if (conn) {
        return {
          ...plat,
          username: conn.username,
          rating: conn.rating,
          stars: conn.stars,
          problemsSolved: conn.problemsSolved,
          rankLabel: conn.rankLabel,
          synced: conn.synced,
          topicBreakdown: conn.topicBreakdown,
          connected: true,
        };
      }
      return {
        ...plat,
        username: null,
        rating: null,
        stars: null,
        problemsSolved: null,
        rankLabel: null,
        synced: false,
        topicBreakdown: undefined as Record<string, number> | undefined,
        connected: false,
      };
    });
  }, [profile, allPlatforms]);

  const activeConnection = useMemo(() => {
    return displayConnections.find((c) => c.id === activePlatformTab);
  }, [displayConnections, activePlatformTab]);

  const totalPlatformSolved = useMemo(() => {
    if (!profile) return 0;
    return (profile.platformConnections || []).reduce((acc, conn) => acc + (conn.problemsSolved || 0), 0);
  }, [profile]);

  const maxPlatformRating = useMemo(() => {
    if (!profile) return null;
    const ratings = (profile.platformConnections || [])
      .map((c) => c.rating)
      .filter((r): r is number => typeof r === 'number' && r > 0);
    if (ratings.length === 0) return null;
    return Math.max(...ratings);
  }, [profile]);

  const displayHeatmap = useMemo(() => {
    if (heatmapData && heatmapData.length > 0) return heatmapData;
    if (!profile || !profile.dailyActivity) return [];
    return profile.dailyActivity.map((act) => {
      const d = new Date(act.date);
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return { date: `${year}-${month}-${day}`, count: act.count };
    });
  }, [profile, heatmapData]);

  const topics = useMemo(() => {
    if (!activeConnection) return [];

    const counts: Record<string, number> = {
      Arrays: 0,
      DP: 0,
      Strings: 0,
      Greedy: 0,
      Trees: 0,
      Graphs: 0,
      Math: 0,
      Backtracking: 0,
    };

    const breakdown = activeConnection.topicBreakdown || {};

    Object.entries(breakdown).forEach(([rawTag, count]) => {
      const tagLower = rawTag.toLowerCase();
      const mapped = TAG_MAPPING[tagLower];
      if (mapped) {
        counts[mapped] += count;
      } else {
        if (tagLower.includes('array')) counts.Arrays += count;
        else if (tagLower.includes('string')) counts.Strings += count;
        else if (tagLower.includes('tree')) counts.Trees += count;
        else if (tagLower.includes('graph') || tagLower.includes('dfs') || tagLower.includes('bfs') || tagLower.includes('shortest')) counts.Graphs += count;
        else if (tagLower.includes('greedy')) counts.Greedy += count;
        else if (tagLower.includes('math') || tagLower.includes('geometry') || tagLower.includes('number theory')) counts.Math += count;
        else if (tagLower.includes('backtracking')) counts.Backtracking += count;
        else if (tagLower.includes('dynamic programming') || tagLower === 'dp') counts.DP += count;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [activeConnection]);

  const hasTopics = useMemo(() => topics.some((t) => t.count > 0), [topics]);

  const connectedSocialLinks = useMemo(() => {
    const links = profile?.socialLinks || {};
    return SOCIAL_LINKS.filter((s) => links[s.id]).map((s) => ({ ...s, url: links[s.id] }));
  }, [profile]);

  const radarPoints = useMemo(() => {
    if (!activeConnection || !hasTopics) return [];
    const center = 110;
    const rBase = 72;

    const topicMap: Record<string, number> = {};
    topics.forEach((t) => {
      topicMap[t.name] = t.count;
    });

    const maxCount = Math.max(...topics.map((t) => t.count), 1);
    const keys = ['Arrays', 'DP', 'Graphs', 'Trees', 'Strings', 'Math', 'Greedy'];

    return keys.map((key, i) => {
      const angle = (2 * Math.PI * i) / 7 - Math.PI / 2;
      const count = topicMap[key] || 0;
      const val = count === 0 ? 15 : Math.round(15 + (count / maxCount) * 80);
      const r = rBase * (val / 100);
      return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle), label: key };
    });
  }, [activeConnection, topics, hasTopics]);

  const radarGridRings = useMemo(() => {
    const center = 110;
    const rBase = 72;
    const ringPercentages = [0.25, 0.5, 0.75, 1.0];

    return ringPercentages.map((pct) => {
      const r = rBase * pct;
      return Array.from({ length: 7 }).map((_, i) => {
        const angle = (2 * Math.PI * i) / 7 - Math.PI / 2;
        return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
      });
    });
  }, []);

  const radarLabels = useMemo(() => {
    const center = 110;
    const rBase = 72;
    const keys = ['Arrays', 'DP', 'Graphs', 'Trees', 'Strings', 'Math', 'Greedy'];

    return keys.map((key, i) => {
      const angle = (2 * Math.PI * i) / 7 - Math.PI / 2;
      const rx = rBase + 22;
      const ry = rBase + 12;
      return {
        x: center + rx * Math.cos(angle),
        y: center + ry * Math.sin(angle),
        label: key,
        anchor: Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end',
      };
    });
  }, []);

  useEffect(() => {
    setHoveredChartPoint(null);
  }, [timeFilter, comparePlatforms, activePlatformTab]);

  const ratingHistoryData = useMemo(() => {
    if (!profile) return { active: [] as ReturnType<typeof getHistoryForFilter> };
    if (comparePlatforms) {
      const lc = displayConnections.find((c) => c.id === 'leetcode');
      const cf = displayConnections.find((c) => c.id === 'codeforces');
      const cc = displayConnections.find((c) => c.id === 'codechef');

      return {
        leetcode: getHistoryForFilter(lc, timeFilter),
        codeforces: getHistoryForFilter(cf, timeFilter),
        codechef: getHistoryForFilter(cc, timeFilter),
      };
    }

    return { active: getHistoryForFilter(activeConnection, timeFilter) };
  }, [comparePlatforms, activeConnection, timeFilter, displayConnections, profile]);

  const yLabels = useMemo(() => {
    let allRatings: number[] = [];
    if (comparePlatforms) {
      const lc = ratingHistoryData.leetcode?.map((p) => p.rating) || [];
      const cf = ratingHistoryData.codeforces?.map((p) => p.rating) || [];
      const cc = ratingHistoryData.codechef?.map((p) => p.rating) || [];
      allRatings = [...lc, ...cf, ...cc];
    } else {
      allRatings = ratingHistoryData.active?.map((p) => p.rating) || [];
    }

    if (allRatings.length === 0) {
      return { minR: 800, maxR: 2000, labels: [2000, 1700, 1400, 1100, 800] };
    }

    const minRating = Math.min(...allRatings);
    const maxRating = Math.max(...allRatings);
    const range = maxRating - minRating;
    const padding = Math.max(100, Math.round(range * 0.15));

    let minR = Math.max(0, Math.floor((minRating - padding) / 50) * 50);
    let maxR = Math.ceil((maxRating + padding) / 50) * 50;

    if (maxR === minR) {
      maxR += 100;
      minR = Math.max(0, minR - 100);
    }

    const step = (maxR - minR) / 4;
    const labels = [];
    for (let i = 4; i >= 0; i--) {
      labels.push(Math.round(minR + i * step));
    }
    return { minR, maxR, labels };
  }, [comparePlatforms, ratingHistoryData]);

  const chartCoordinates = useMemo(() => {
    const width = 600;
    const height = 300;
    const paddingLeft = 35;
    const paddingRight = 10;
    const paddingTop = 15;
    const paddingBottom = 25;

    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;

    const { minR, maxR } = yLabels;

    const getPointsForHistory = (history: { label: string; rating: number }[]) => {
      if (history.length === 0) return [];
      const numPoints = history.length;
      return history.map((item, idx) => {
        const x = paddingLeft + (idx * graphWidth) / (numPoints - 1);
        const y = paddingTop + graphHeight - ((item.rating - minR) * graphHeight) / (maxR - minR);
        return { x, y, rating: item.rating, label: item.label };
      });
    };

    if (comparePlatforms) {
      return {
        leetcode: getPointsForHistory(ratingHistoryData.leetcode || []),
        codeforces: getPointsForHistory(ratingHistoryData.codeforces || []),
        codechef: getPointsForHistory(ratingHistoryData.codechef || []),
      };
    }

    return { active: getPointsForHistory(ratingHistoryData.active || []) };
  }, [comparePlatforms, ratingHistoryData, yLabels]);

  const isLoggedIn = !!loggedInUser;

  const displayName = profile?.name || username;

  return (
    <div className={embedded ? 'text-[#E5E7EB]' : 'flex min-h-screen bg-[#000000] text-[#E5E7EB] selection:bg-[#35b9f1]/30 selection:text-white'}>
      {!embedded && (
        <Sidebar user={loggedInUser} onLogout={handleLogout} />
      )}

      <div className={embedded ? '' : 'flex-1 ml-0 md:ml-20 flex flex-col h-screen overflow-hidden pt-16 md:pt-0'}>
        {!embedded && (
          <header className="border-b border-neutral-900/60 bg-black/45 backdrop-blur-md sticky top-0 z-40 shrink-0">
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white font-normal italic font-serif text-2xl md:text-3xl leading-none">Student Profile</span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="font-mono text-[#9CA3AF] hover:text-white rounded-lg px-3 py-1.5"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      <span className="hidden sm:inline">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Share Profile</span>
                    </>
                  )}
                </Button>

                {isLoggedIn ? (
                  <Button onClick={() => router.push('/leaderboard')} variant="accent" size="sm" className="rounded-lg px-3 py-1.5">
                    Leaderboard
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <Button onClick={() => router.push('/login')} variant="outline" size="sm" className="rounded-lg px-3 py-1.5">
                    Join DSABuddy
                  </Button>
                )}
              </div>
            </div>
          </header>
        )}

        <div className={embedded ? '' : 'flex-1 overflow-y-auto p-4 md:p-8'}>
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-10 h-10 border-2 border-[#35b9f1] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#9CA3AF] font-mono text-xs">Resolving profile parameters...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
                <AlertCircle className="w-12 h-12 text-red-500/80 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Profile Unavailable</h2>
                <p className="text-[#9CA3AF] text-sm font-mono mb-6">{error}</p>
                <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-semibold text-[#35b9f1] hover:underline">
                  Back
                </button>
              </div>
            ) : profile ? (
              <div className="space-y-8">
                {/* Elegant Header Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-950 to-neutral-900/40 border border-neutral-800/60 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
                  <div
                    className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] opacity-10 pointer-events-none transition-all duration-1000"
                    style={{ backgroundColor: rankColor }}
                  />

                  {profile.overallRank && (
                    <span
                      className="absolute top-4 right-4 md:top-6 md:right-6 px-2.5 py-0.5 rounded text-[10px] font-bold font-mono border uppercase tracking-wider select-none z-10"
                      style={{ color: rankColor, backgroundColor: `${rankColor}10`, borderColor: `${rankColor}25` }}
                    >
                      Rank {getRankBadge(profile.overallRank)}
                    </span>
                  )}

                  <div className="relative flex-shrink-0">
                    {showInitials ? (
                      <div
                        className="w-24 h-24 rounded-full flex items-center justify-center bg-neutral-900 border-2 font-bold text-3xl select-none shadow-inner"
                        style={{ borderColor: rankColor, color: rankColor }}
                      >
                        {getInitials(profile.name)}
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatarUrl ?? undefined}
                        alt={profile.name}
                        onError={() => setImgError(true)}
                        className="w-24 h-24 rounded-full object-cover border-2 shadow-lg"
                        style={{ borderColor: rankColor }}
                      />
                    )}
                  </div>

                  <div className="space-y-4 flex-1">
                    <div>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <h1 className="text-white text-3xl font-sans font-bold tracking-tight">{profile.name}</h1>
                      </div>
                      <p className="text-[#9CA3AF] text-sm font-mono mt-1">@{profile.userName}</p>

                      {connectedSocialLinks.length > 0 && (
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                          {connectedSocialLinks.map((social) => (
                            <a
                              key={social.id}
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={social.name}
                              className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#9CA3AF] hover:text-white hover:border-neutral-700 transition-colors"
                              style={{ color: social.color }}
                            >
                              <SocialIcon id={social.id} className="w-4 h-4" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-xs text-[#9CA3AF] font-mono">
                      <span className="flex items-center gap-1.5">
                        <School className="w-4 h-4 text-neutral-500" />
                        {profile.college || 'Netaji Subhas University of Technology'}
                      </span>
                      {profile.branch && (
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-neutral-500" />
                          {profile.branch}
                        </span>
                      )}
                      {profile.year && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-neutral-500" />
                          Class of {profile.year}
                        </span>
                      )}
                      {profile.createdAt && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-neutral-500" />
                          Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={Trophy} label="Overall Rank" value={profile.overallRank ? `#${profile.overallRank}` : '-'} color="#35b9f1" />
                  <StatCard
                    icon={Activity}
                    label="DSA Points"
                    value={typeof profile.points === 'number' ? profile.points.toLocaleString() : String(profile.points ?? 0)}
                    color="#10B981"
                  />
                  <StatCard icon={Award} label="Branch Rank" value={profile.branchRank ? `#${profile.branchRank}` : '-'} color="#60A5FA" />
                  <StatCard icon={Award} label="Year Rank" value={profile.yearRank ? `#${profile.yearRank}` : '-'} color="#C084FC" />
                </div>

                {/* Practice Stats Summary Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={CheckCircle2} label="Questions Solved" value={profile.solvedQuestionsCount ?? 0} color="#10B981" />
                  <StatCard icon={BookOpen} label="Sheet Solved" value={profile.solvedSheetProblemsCount ?? 0} color="#35b9f1" />
                  <StatCard icon={Trophy} label="Max Platform Rating" value={maxPlatformRating ? maxPlatformRating : '—'} color="#F5B14C" />
                  <StatCard icon={Activity} label="Total Platform Solved" value={totalPlatformSolved > 0 ? totalPlatformSolved : '—'} color="#EF4444" />
                </div>

                {/* Coding Profiles & Rating progression layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4 lg:col-span-1">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">Platforms</h3>

                    <div className="flex flex-col gap-3">
                      {displayConnections.filter((conn) => conn.connected).length === 0 && (
                        <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950/40 p-6 text-center">
                          <Link2 className="w-6 h-6 text-neutral-600 mx-auto mb-2" />
                          <p className="text-neutral-400 text-sm font-medium">No platforms connected</p>
                          <p className="text-neutral-600 text-xs font-mono mt-1">This profile hasn&apos;t linked any coding platforms yet.</p>
                        </div>
                      )}
                      {displayConnections
                        .filter((conn) => conn.connected)
                        .map((conn) => {
                          const isActive = activePlatformTab === conn.id;
                          return (
                            <div
                              key={conn.id}
                              onClick={() => {
                                if (conn.connected) {
                                  setActivePlatformTab(conn.id);
                                  setComparePlatforms(false);
                                }
                              }}
                              className={`
                              rounded-xl p-4 border transition-all duration-200 cursor-pointer flex items-center justify-between
                              ${conn.connected
                                ? isActive
                                  ? 'bg-neutral-900 border-[#35b9f1] ring-1 ring-[#35b9f1]/20'
                                  : 'bg-neutral-950/70 border-neutral-900 hover:border-neutral-800'
                                : 'bg-neutral-950/20 border-dashed border-neutral-900/60 opacity-30 select-none cursor-not-allowed'
                              }
                            `}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-neutral-900 overflow-hidden border border-neutral-800/40">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={conn.logo}
                                    alt={conn.name}
                                    className={`w-5 h-5 object-contain ${conn.connected ? '' : 'grayscale opacity-30'}`}
                                  />
                                </div>
                                <div>
                                  <h4 className="text-white font-bold text-sm leading-tight">{conn.name}</h4>
                                  {conn.connected && conn.rating && (
                                    <p className="text-neutral-400 text-xs font-mono mt-0.5">Rating: {conn.rating}</p>
                                  )}
                                </div>
                              </div>

                              {conn.connected && (
                                <div className="text-right">
                                  <p className="text-[#35b9f1] text-xs font-bold font-mono">
                                    {conn.id === 'codechef' ? (conn.stars ? `${conn.stars}★` : '') : `${conn.problemsSolved || 0} Solved`}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">Rating Progression</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex border border-neutral-900 rounded-lg p-0.5 bg-[#000000]">
                          {[
                            { id: '3m', label: '3M' },
                            { id: '6m', label: '6M' },
                            { id: '1y', label: '1Y' },
                            { id: 'overall', label: 'ALL' },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setTimeFilter(opt.id)}
                              className={`px-2 py-0.5 text-[9px] font-mono rounded-md transition-all cursor-pointer ${
                                timeFilter === opt.id ? 'bg-[#35b9f1] text-[#000000] font-bold' : 'text-[#9CA3AF] hover:text-white'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        {activeConnection?.rating && (
                          <button
                            onClick={() => setComparePlatforms(!comparePlatforms)}
                            className="text-[10px] font-mono text-[#9CA3AF] hover:text-[#35b9f1] transition-colors uppercase cursor-pointer tracking-wider border-l border-neutral-900 pl-3"
                          >
                            {comparePlatforms ? 'Active Only' : 'Compare'}
                          </button>
                        )}
                      </div>
                    </div>

                    {comparePlatforms && (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                        {[
                          { key: 'leetcode', name: 'LeetCode', color: '#FFA116' },
                          { key: 'codeforces', name: 'Codeforces', color: '#1F8ACB' },
                          { key: 'codechef', name: 'CodeChef', color: '#5B4638' },
                        ]
                          .filter((p) => chartCoordinates[p.key as keyof typeof chartCoordinates] && chartCoordinates[p.key as keyof typeof chartCoordinates]!.length > 0)
                          .map((p) => (
                            <div key={p.key} className="flex items-center gap-1.5">
                              <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: p.color }} />
                              <span className="text-[10px] font-mono text-[#9CA3AF]">{p.name}</span>
                            </div>
                          ))}
                      </div>
                    )}

                    <div
                      className="border border-neutral-900 bg-neutral-950/40 p-4 rounded-2xl h-[300px] flex items-center justify-center relative"
                      onMouseLeave={() => setHoveredChartPoint(null)}
                    >
                      <svg
                        viewBox="0 0 600 300"
                        className="w-full h-full font-mono overflow-visible"
                        onMouseMove={(e) => {
                          const svg = e.currentTarget;
                          const point = svg.createSVGPoint();
                          point.x = e.clientX;
                          point.y = e.clientY;
                          const ctm = svg.getScreenCTM();
                          if (!ctm) return;
                          const svgPoint = point.matrixTransform(ctm.inverse());
                          const svgX = svgPoint.x;

                          const paddingLeft = 35;
                          const graphWidth = 555;

                          const activeList = comparePlatforms
                            ? [chartCoordinates.leetcode, chartCoordinates.codeforces, chartCoordinates.codechef].find((arr) => arr && arr.length > 0)
                            : chartCoordinates.active;

                          if (!activeList || activeList.length === 0) {
                            setHoveredChartPoint(null);
                            return;
                          }

                          const numPoints = activeList.length;
                          const divisions = Math.max(1, numPoints - 1);
                          let idx = Math.round(((svgX - paddingLeft) * divisions) / graphWidth);
                          idx = Math.max(0, Math.min(numPoints - 1, idx));

                          const x = paddingLeft + (idx * graphWidth) / divisions;
                          const activePointForLabel = activeList[idx];
                          const label = activePointForLabel?.label || '';

                          const hoverData: HoveredChartPoint = { idx, label, x };

                          if (comparePlatforms) {
                            const lcPoint = chartCoordinates.leetcode?.[idx];
                            const cfPoint = chartCoordinates.codeforces?.[idx];
                            const ccPoint = chartCoordinates.codechef?.[idx];

                            hoverData.platforms = [];
                            if (lcPoint) hoverData.platforms.push({ name: 'LeetCode', rating: lcPoint.rating, color: '#FFA116', y: lcPoint.y });
                            if (cfPoint) hoverData.platforms.push({ name: 'Codeforces', rating: cfPoint.rating, color: '#1F8ACB', y: cfPoint.y });
                            if (ccPoint) hoverData.platforms.push({ name: 'CodeChef', rating: ccPoint.rating, color: '#5B4638', y: ccPoint.y });

                            const validYs = hoverData.platforms.map((p) => p.y).filter((y) => y !== undefined);
                            hoverData.y = validYs.length > 0 ? Math.min(...validYs) : 50;
                          } else {
                            const activePoint = chartCoordinates.active?.[idx];
                            if (activePoint) {
                              hoverData.rating = activePoint.rating;
                              hoverData.y = activePoint.y;
                              hoverData.platform = activePlatformTab.toUpperCase();
                              hoverData.color = '#35b9f1';
                            }
                          }

                          setHoveredChartPoint(hoverData);
                        }}
                      >
                        {Array.from({ length: 5 }).map((_, i) => {
                          const y = 15 + i * 65;
                          return <line key={i} x1="35" y1={y} x2={590} y2={y} stroke="#1a1a1a" strokeWidth="1" />;
                        })}

                        {yLabels.labels.map((val, i) => (
                          <text key={i} x="30" y={20 + i * 65} fill="#6B7280" fontSize="9" textAnchor="end">
                            {val}
                          </text>
                        ))}

                        {comparePlatforms ? (
                          <>
                            {chartCoordinates.codeforces && chartCoordinates.codeforces.length > 0 && (
                              <path
                                d={`M ${chartCoordinates.codeforces.map((p) => `${p.x} ${p.y}`).join(' L ')}`}
                                fill="none"
                                stroke="#1F8ACB"
                                strokeWidth="2"
                              />
                            )}
                            {chartCoordinates.codechef && chartCoordinates.codechef.length > 0 && (
                              <path
                                d={`M ${chartCoordinates.codechef.map((p) => `${p.x} ${p.y}`).join(' L ')}`}
                                fill="none"
                                stroke="#5B4638"
                                strokeWidth="2"
                              />
                            )}
                            {chartCoordinates.leetcode && chartCoordinates.leetcode.length > 0 && (
                              <path
                                d={`M ${chartCoordinates.leetcode.map((p) => `${p.x} ${p.y}`).join(' L ')}`}
                                fill="none"
                                stroke="#FFA116"
                                strokeWidth="2"
                              />
                            )}
                          </>
                        ) : (
                          chartCoordinates.active &&
                          chartCoordinates.active.length > 0 && (
                            <path d={`M ${chartCoordinates.active.map((p) => `${p.x} ${p.y}`).join(' L ')}`} fill="none" stroke="#35b9f1" strokeWidth="2" />
                          )
                        )}

                        {!comparePlatforms &&
                          chartCoordinates.active?.map((p, idx) => (
                            <circle
                              key={idx}
                              cx={p.x}
                              cy={p.y}
                              r={hoveredChartPoint?.idx === idx ? '5' : '3'}
                              fill={hoveredChartPoint?.idx === idx ? '#35b9f1' : '#0D1117'}
                              stroke="#35b9f1"
                              strokeWidth="1.5"
                            />
                          ))}

                        {hoveredChartPoint && (
                          <line x1={hoveredChartPoint.x} y1="15" x2={hoveredChartPoint.x} y2="275" stroke="#35b9f1" strokeWidth="1" strokeDasharray="4 4" />
                        )}
                      </svg>

                      {hoveredChartPoint && (
                        <div
                          className="absolute z-10 bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 shadow-xl text-[10px] font-mono space-y-1"
                          style={{
                            left: `${Math.min(460, Math.max(45, hoveredChartPoint.x - 65))}px`,
                            top: `${Math.min(190, Math.max(10, (hoveredChartPoint.y ?? 0) - 85))}px`,
                          }}
                        >
                          <p className="text-neutral-500">{hoveredChartPoint.label}</p>
                          {comparePlatforms ? (
                            hoveredChartPoint.platforms?.map((p) => (
                              <div key={p.name} className="flex justify-between items-center gap-4">
                                <span style={{ color: p.color }} className="font-semibold">
                                  {p.name}:
                                </span>
                                <span className="text-white font-bold">{p.rating}</span>
                              </div>
                            ))
                          ) : (
                            <div className="flex justify-between items-center gap-4">
                              <span className="text-[#35b9f1] font-semibold">{hoveredChartPoint.platform}:</span>
                              <span className="text-white font-bold">{hoveredChartPoint.rating}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submission consistency heatmap */}
                <div className="space-y-4">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">Coding Consistency</h3>

                  <div className="border border-neutral-900 bg-neutral-950/40 rounded-2xl p-5 md:p-6">
                    <ConsistencyHeatmap data={displayHeatmap} platform={activePlatformTab} isAnalytics isReadOnly />
                  </div>
                </div>

                {/* Topic Distribution & Skill Profile */}
                {hasTopics && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">Topic Distribution</h3>
                      <div className="border border-neutral-900 bg-neutral-950/40 p-5 rounded-2xl h-[320px] overflow-y-auto space-y-3.5 custom-scrollbar">
                        {topics
                          .filter((t) => t.count > 0)
                          .map((topic) => {
                            const maxVal = Math.max(...topics.map((t) => t.count), 1);
                            const pct = (topic.count / maxVal) * 100;
                            return (
                              <div key={topic.name} className="space-y-1">
                                <div className="flex justify-between items-baseline text-[10px] font-mono font-bold leading-none">
                                  <span className="text-[#E5E7EB]">{topic.name}</span>
                                  <span className="text-[#35b9f1]">{topic.count}</span>
                                </div>
                                <div className="h-2 w-full bg-neutral-900 rounded-[2px] relative overflow-hidden">
                                  <div className="absolute top-0 left-0 h-full bg-[#35b9f1]/10 w-full" />
                                  <div style={{ width: `${pct}%` }} className="absolute top-0 left-0 h-full bg-[#35b9f1] transition-all duration-500" />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    <div className="md:col-span-3">
                      <div className="border border-neutral-900 bg-neutral-950/40 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 h-[320px]">
                        <div className="flex-1 space-y-2 text-center sm:text-left max-w-sm">
                          <h4 className="text-lg font-bold text-white">DSA Mastery Index</h4>
                          <p className="text-xs text-[#9CA3AF] leading-relaxed font-mono">
                            Heptagonal representation of topic competence based on solve counts.
                          </p>
                          <div className="pt-2 text-left space-y-1 text-xs font-mono">
                            <div className="flex justify-between border-b border-neutral-800 pb-1">
                              <span className="text-[#9CA3AF]">Primary Strength</span>
                              <span className="text-[#35b9f1] font-bold">{topics.filter((t) => t.count > 0)[0]?.name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-neutral-800 pb-1">
                              <span className="text-[#9CA3AF]">Growth Area</span>
                              <span className="text-[#E5E7EB] font-bold">
                                {topics.filter((t) => t.count > 0)[topics.filter((t) => t.count > 0).length - 1]?.name || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="w-[200px] h-[200px] shrink-0">
                          <svg viewBox="0 0 220 220" className="w-full h-full font-mono overflow-visible">
                            {radarGridRings.map((ring, rIdx) => (
                              <polygon
                                key={rIdx}
                                points={ring.map((v) => `${v.x},${v.y}`).join(' ')}
                                stroke="#1F2937"
                                strokeWidth="0.75"
                                fill={rIdx === 3 ? '#0D1117' : 'none'}
                              />
                            ))}
                            {Array.from({ length: 7 }).map((_, i) => {
                              const angle = (2 * Math.PI * i) / 7 - Math.PI / 2;
                              return (
                                <line
                                  key={i}
                                  x1="110"
                                  y1="110"
                                  x2={110 + 72 * Math.cos(angle)}
                                  y2={110 + 72 * Math.sin(angle)}
                                  stroke="#1F2937"
                                  strokeWidth="0.75"
                                />
                              );
                            })}
                            <polygon points={radarPoints.map((v) => `${v.x},${v.y}`).join(' ')} stroke="#35b9f1" strokeWidth="1.5" fill="#35b9f1" fillOpacity="0.2" />
                            {radarLabels.map((l, i) => (
                              <text
                                key={i}
                                x={l.x}
                                y={l.y + 3}
                                fill="#9CA3AF"
                                fontSize="11"
                                textAnchor={l.anchor as 'start' | 'middle' | 'end'}
                                className="font-mono uppercase tracking-tighter font-semibold"
                              >
                                {l.label}
                              </text>
                            ))}
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
