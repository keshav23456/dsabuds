'use client';

import { memo } from 'react';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
};

const HEATMAP: number[] = [
  1, 1, 0, 1, 1, 1, 0,
  1, 1, 1, 0, 1, 1, 1,
  0, 1, 1, 1, 1, 0, 1,
  1, 1, 1, 1, 0, 1, 1,
  1, 0, 1, 1, 1, 1, 1,
];

export const FeaturesSection = memo(() => {
  return (
    <motion.div
      id="features"
      className="my-24 md:my-36 mx-auto xl:max-w-270 2xl:max-w-270 md:max-w-190 sm:max-w-150 max-w-90 px-4 scroll-mt-28"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <motion.div
          className="text-left"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl sm:text-5xl font-serif italic text-white leading-tight">
            Why{' '}
            <span className="text-[#35b9f1] not-italic font-bold">DSABuddy</span>?
          </h2>
          <p className="mt-4 max-w-2xl text-gray-400 text-lg leading-relaxed">
            Stop chasing counts. Start building consistency. We built DSABuddy for the way college DSA actually works.
          </p>
        </motion.div>

        <div className="bg-[#161B22]/50 border border-[#1F2937]/50 text-[#35b9f1] text-xs font-semibold px-4 py-1.5 rounded-lg select-none tracking-wider uppercase shrink-0 font-mono">
          Built for NSUTians
        </div>
      </div>

      {/* Bento Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >

        {/* Card 1: Unified DSA Progress (2 columns) */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-2 bg-[#0D1117] border border-[#1F2937] hover:border-[#35b9f1]/40 transition-all duration-300 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-linear-to-br from-[#35b9f1]/4 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#35b9f1]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="z-10">
            <p className="text-[11px] font-mono text-[#35b9f1]/50 tracking-[0.15em] uppercase mb-2">01 — Progress</p>
            <h3 className="text-2xl font-bold text-white">Unified DSA Progress</h3>
            <p className="mt-2 text-gray-500 text-sm leading-relaxed max-w-sm">
              Track all problems solved across LeetCode, Codeforces, and CodeChef inside a single dashboard.
            </p>
          </div>

          <div className="bg-[#080C10] border border-[#1F2937]/60 rounded-xl p-5 space-y-5 font-mono text-xs shadow-inner z-10">
            {[
              { label: 'LEETCODE', value: '412 / 800', pct: '51.5%', color: '#F59E0B' },
              { label: 'CODEFORCES', value: '1,530 Rating', pct: '65%', color: '#EF4444' },
              { label: 'CODECHEF', value: '4★ · Div 2', pct: '78%', color: '#10B981' },
            ].map(({ label, value, pct, color }) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-600 tracking-widest">{label}</span>
                  <span style={{ color }}>{value}</span>
                </div>
                <div className="w-full bg-[#161B22] h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: pct }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Card 2: College Leaderboards */}
        <motion.div
          variants={cardVariants}
          className="bg-[#0D1117] border border-[#1F2937] hover:border-[#F59E0B]/40 transition-all duration-300 rounded-2xl p-6 flex flex-col gap-6 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-linear-to-br from-[#F59E0B]/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#F59E0B]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="z-10">
            <p className="text-[11px] font-mono text-[#F59E0B]/50 tracking-[0.15em] uppercase mb-2">02 — Compete</p>
            <h3 className="text-2xl font-bold text-white">College Leaderboards</h3>
            <p className="mt-2 text-gray-500 text-sm leading-relaxed">
              Compete directly with peers. Filter by branch or graduation year.
            </p>
          </div>

          <div className="bg-[#080C10] border border-[#1F2937]/60 rounded-xl overflow-hidden shadow-inner z-10">
            <div className="flex items-center justify-between px-3 py-2 text-[10px] font-mono text-gray-600 tracking-widest border-b border-[#1F2937]/50">
              <span>RANK · NAME</span>
              <span>SCORE</span>
            </div>
            {[
              { rank: '#1', name: 'Tanmay G.', score: '4,850', highlight: true },
              { rank: '#2', name: 'Rohan S.', score: '4,210', highlight: false },
              { rank: '#3', name: 'Priya P.', score: '3,980', highlight: false },
              { rank: '#4', name: 'Aman K.', score: '3,740', highlight: false },
            ].map(({ rank, name, score, highlight }) => (
              <div
                key={rank}
                className={`flex items-center justify-between px-3 py-2.5 font-mono text-xs border-b border-[#1F2937]/20 last:border-0 ${highlight ? 'bg-[#F59E0B]/6 text-white' : 'text-gray-500'}`}
              >
                <span className="flex items-center gap-2.5">
                  <span className={highlight ? 'text-[#F59E0B] font-bold' : 'text-gray-700'}>{rank}</span>
                  <span>{name}</span>
                </span>
                <span className={highlight ? 'text-white font-bold' : ''}>{score}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Card 3: Streak System */}
        <motion.div
          variants={cardVariants}
          className="bg-[#0D1117] border border-[#1F2937] hover:border-[#F97316]/40 transition-all duration-300 rounded-2xl p-6 flex flex-col gap-6 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-linear-to-br from-[#F97316]/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#F97316]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="z-10">
            <p className="text-[11px] font-mono text-[#F97316]/50 tracking-[0.15em] uppercase mb-2">03 — Consistency</p>
            <h3 className="text-2xl font-bold text-white">Streak System</h3>
            <p className="mt-2 text-gray-500 text-sm leading-relaxed">
              Build daily coding habits. Streaks auto-update across all platforms.
            </p>
          </div>

          <div className="bg-[#080C10] border border-[#1F2937]/60 rounded-xl p-4 shadow-inner z-10 space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white font-mono">45</span>
              <span className="text-sm text-gray-500 font-mono">day streak</span>
              <span className="ml-auto text-[#F97316] text-[10px] font-mono font-bold tracking-widest">ACTIVE</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {HEATMAP.map((active, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-sm ${active ? 'bg-[#10B981]' : 'bg-[#161B22] border border-[#1F2937]'}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-700 font-mono">
              <span>5 weeks</span>
              <span>Today →</span>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Auto-Sync Engine */}
        <motion.div
          variants={cardVariants}
          className="bg-[#0D1117] border border-[#1F2937] hover:border-[#10B981]/40 transition-all duration-300 rounded-2xl p-6 flex flex-col gap-6 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-linear-to-br from-[#10B981]/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#10B981]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="z-10">
            <p className="text-[11px] font-mono text-[#10B981]/50 tracking-[0.15em] uppercase mb-2">04 — Automation</p>
            <h3 className="text-2xl font-bold text-white">Auto-Sync Engine</h3>
            <p className="mt-2 text-gray-500 text-sm leading-relaxed">
              Set and forget. Background workers fetch your submissions every hour.
            </p>
          </div>

          <div className="bg-[#080C10] border border-[#1F2937]/60 rounded-xl p-4 font-mono text-[11px] shadow-inner z-10 space-y-3">
            {[
              { time: '14:00', platform: 'LeetCode', note: '+3 problems', live: false },
              { time: '14:01', platform: 'Codeforces', note: '+1 problem', live: false },
              { time: '15:00', platform: 'CodeChef', note: 'scanning…', live: true },
            ].map(({ time, platform, note, live }) => (
              <div key={time} className="flex items-center gap-3">
                <span className="text-gray-700 shrink-0">{time}</span>
                <span className="text-gray-400 flex-1">{platform}</span>
                <span className={`flex items-center gap-1.5 ${live ? 'text-[#10B981]' : 'text-gray-600'}`}>
                  {live && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse shrink-0" />}
                  {note}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Card 5: Zero to Offer Guide */}
        <motion.a
          variants={cardVariants}
          href="https://drive.google.com/file/d/17LP8EJoSGUn-w7meqU45M2neezMIn8U6/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#0D1117] border border-[#1F2937] hover:border-[#35b9f1]/40 transition-all duration-300 rounded-2xl p-6 flex flex-col gap-6 group overflow-hidden relative cursor-pointer"
        >
          <div className="absolute inset-0 bg-linear-to-br from-[#35b9f1]/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#35b9f1]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="z-10">
            <p className="text-[11px] font-mono text-[#35b9f1]/50 tracking-[0.15em] uppercase mb-2">05 — Resources</p>
            <h3 className="text-2xl font-bold text-white group-hover:text-[#35b9f1] transition-colors duration-200">
              Zero to Offer ↗
            </h3>
            <p className="mt-2 text-gray-500 text-sm leading-relaxed">
              Curated placement guide from DSA basics to top tech offers.
            </p>
          </div>

          <div className="bg-[#080C10] border border-[#1F2937]/60 rounded-xl p-4 font-mono text-xs shadow-inner z-10 space-y-2.5">
            {[
              { step: '01', label: 'Arrays & Hashing', done: true },
              { step: '02', label: 'Trees & Graphs', done: true },
              { step: '03', label: 'Dynamic Programming', done: false },
              { step: '04', label: 'System Design', done: false },
              { step: '05', label: 'Mock Interviews', done: false },
            ].map(({ step, label, done }) => (
              <div key={step} className={`flex items-center gap-3 ${done ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className={`text-[10px] w-4 shrink-0 ${done ? 'text-[#10B981]' : 'text-gray-700'}`}>{step}</span>
                <span className={done ? 'line-through' : ''}>{label}</span>
                {done && <span className="ml-auto text-[#10B981] text-[10px]">✓</span>}
              </div>
            ))}
          </div>
        </motion.a>

        {/* Card 6: Hiring Insights & CTC Database (2 columns) */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-2 bg-[#0D1117] border border-[#1F2937] hover:border-[#A78BFA]/40 transition-all duration-300 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-linear-to-br from-[#A78BFA]/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#A78BFA]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="z-10">
            <p className="text-[11px] font-mono text-[#A78BFA]/50 tracking-[0.15em] uppercase mb-2">06 — Insights</p>
            <h3 className="text-2xl font-bold text-white">Hiring Insights & CTC Database</h3>
            <p className="mt-2 text-gray-500 text-sm leading-relaxed">
              Explore campus recruitment histories, compensation details, and academic eligibility criteria.
            </p>
          </div>

          <div className="bg-[#080C10] border border-[#1F2937]/60 rounded-xl overflow-hidden shadow-inner z-10">
            <div className="grid grid-cols-3 text-[10px] font-mono text-gray-600 px-4 py-2.5 border-b border-[#1F2937]/50 tracking-widest">
              <span>COMPANY</span>
              <span className="text-center">CTC</span>
              <span className="text-right">CRITERIA</span>
            </div>
            {[
              { company: 'Google', ctc: '32.5 LPA', criteria: 'CGPA > 8.0', color: '#4285F4' },
              { company: 'Microsoft', ctc: '51.0 LPA', criteria: '0 Backlogs', color: '#00A4EF' },
              { company: 'Amazon', ctc: '45.0 LPA', criteria: 'B.Tech / MCA', color: '#FF9900' },
              { company: 'Goldman Sachs', ctc: '24.0 LPA', criteria: 'CGPA > 7.5', color: '#6B9BDF' },
            ].map(({ company, ctc, criteria, color }) => (
              <div
                key={company}
                className="grid grid-cols-3 items-center px-4 py-3 border-b border-[#1F2937]/20 last:border-0 font-mono text-xs hover:bg-[#161B22]/30 transition-colors cursor-default"
              >
                <span className="font-bold" style={{ color }}>{company}</span>
                <span className="text-center text-white font-semibold">{ctc}</span>
                <span className="text-right text-gray-500 text-[10px]">{criteria}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Card 7: PYQs Forum */}
        <motion.div
          variants={cardVariants}
          className="bg-[#0D1117] border border-[#1F2937] hover:border-[#34D399]/40 transition-all duration-300 rounded-2xl p-6 flex flex-col gap-6 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-linear-to-br from-[#34D399]/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#34D399]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="z-10">
            <p className="text-[11px] font-mono text-[#34D399]/50 tracking-[0.15em] uppercase mb-2">07 — Community</p>
            <h3 className="text-2xl font-bold text-white">PYQs Discussion Forum</h3>
            <p className="mt-2 text-gray-500 text-sm leading-relaxed">
              Share and discuss solutions for previous year campus placement papers.
            </p>
          </div>

          <div className="bg-[#080C10] border border-[#1F2937]/60 rounded-xl p-4 shadow-inner z-10 space-y-4">
            {[
              { title: 'Google OA 2025: Graph Query', replies: 3, time: '2m ago', active: true },
              { title: 'Microsoft SDE 2024: DP String', replies: 7, time: '1h ago', active: false },
              { title: 'Amazon OA 2025: Sliding Window', replies: 12, time: '3h ago', active: false },
            ].map(({ title, replies, time, active }) => (
              <div key={title} className="space-y-1.5 pb-4 border-b border-[#1F2937]/30 last:border-0 last:pb-0">
                <p className="text-gray-300 text-xs font-medium truncate">{title}</p>
                <div className="flex items-center justify-between text-[10px] text-gray-600 font-mono">
                  <span>{replies} replies</span>
                  <span className="flex items-center gap-1.5">
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />}
                    {time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
});

FeaturesSection.displayName = 'FeaturesSection';
