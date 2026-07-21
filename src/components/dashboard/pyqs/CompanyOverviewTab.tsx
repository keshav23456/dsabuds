'use client';

import { ChevronRight } from 'lucide-react';

export interface TimelineStep {
  step?: number;
  title: string;
  desc: string;
  tags?: string[];
}

export interface PlacementStats {
  roles: string[];
  maxCtc: number | null;
  stipend: number | null;
  branches: string[];
  minCgpa: number | null;
}

interface CompanyOverviewTabProps {
  hasTimeline: boolean;
  timelineSteps: TimelineStep[];
  cgpaDisplay: string;
  branchesDisplay: string;
  placementStats: PlacementStats | null;
  eligibilityBranches?: string;
  popularTopics: string[];
  questionsCount: number;
  onViewProblems: () => void;
  showEligibility?: boolean;
}

export function CompanyOverviewTab({
  hasTimeline,
  timelineSteps,
  cgpaDisplay,
  branchesDisplay,
  placementStats,
  eligibilityBranches,
  popularTopics,
  questionsCount,
  onViewProblems,
  showEligibility = true,
}: CompanyOverviewTabProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* ── Left / Main ── */}
      <div className="flex-1 min-w-0">
        {/* Interview Process — only if custom timeline exists */}
        {hasTimeline && (
          <div className="mt-12">
            <p className="text-xs tracking-widest uppercase text-neutral-500 mb-8 font-bold font-mono">
              Interview Process
            </p>
            <div className="relative border-l border-neutral-800 ml-3 pl-8 space-y-8">
              {timelineSteps.map((step, idx) => {
                const stepLabel = idx === 0 ? 'OA' : `R${idx}`;
                const isFirst = idx === 0;
                return (
                  <div key={idx} className="relative group">
                    {/* Dot indicator on the left line */}
                    <div
                      className={`absolute -left-[37px] top-1.5 w-2 h-2 rounded-full border transition-all duration-300 ${
                        isFirst
                          ? 'bg-[#35b9f1] border-[#35b9f1] shadow-[0_0_8px_#35b9f1]'
                          : 'bg-neutral-900 border-neutral-700'
                      }`}
                    />

                    {/* Content */}
                    <div>
                      <p className="text-sm tracking-wide mb-2 text-neutral-200 font-mono font-semibold">
                        <span className={isFirst ? 'text-[#35b9f1]' : 'text-neutral-400'}>
                          {stepLabel}
                        </span>
                        <span className="text-neutral-600 mx-2">—</span>
                        <span className="text-neutral-100">{step.title}</span>
                      </p>
                      <p className="text-neutral-400 text-sm leading-relaxed max-w-xl">
                        {step.desc}
                      </p>
                      {step.tags && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {step.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] tracking-wider uppercase border border-neutral-800 bg-neutral-900/10 text-neutral-400 px-2 py-0.5 rounded font-mono"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Right Sidebar ── */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-4 font-mono">
        {/* Eligibility */}
        {showEligibility && (
          <div className="border border-neutral-900 bg-neutral-950/10 rounded-xl p-5">
            <p className="text-xs tracking-wider uppercase text-neutral-500 mb-4 font-bold">
              Eligibility
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">CGPA</span>
                <span className="text-[#35b9f1] text-xs font-bold">{cgpaDisplay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Backlogs</span>
                <span className="text-[#FF453A] text-xs font-bold tracking-wider uppercase">
                  NONE
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs text-neutral-400 whitespace-nowrap">Branches</span>
                <span className="text-neutral-200 text-xs font-bold tracking-wider uppercase text-right break-words">
                  {(placementStats?.branches?.length ?? 0) > 0 && placementStats!.branches.includes('all')
                    ? 'ALL OPEN'
                    : eligibilityBranches?.includes('all')
                      ? 'ALL OPEN'
                      : branchesDisplay}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Placement History */}
        {placementStats && (
          <div className="border border-neutral-900 bg-neutral-950/10 rounded-xl p-5">
            <p className="text-xs tracking-wider uppercase text-neutral-500 mb-4 font-bold">
              Placements
            </p>
            {placementStats.maxCtc && (
              <div className="mb-4">
                <span className="text-xs text-neutral-400 block mb-1">Max CTC *:</span>
                <span className="text-[#35b9f1] font-normal italic text-2xl font-serif">
                  {placementStats.maxCtc} LPA
                </span>
              </div>
            )}
            {placementStats.stipend && (
              <div className="mb-4">
                <span className="text-xs text-neutral-400 block mb-1">Max Stipend:</span>
                <span className="text-emerald-400 text-sm font-bold">
                  ₹{placementStats.stipend.toLocaleString()}/mo
                </span>
              </div>
            )}
            {placementStats.roles?.length > 0 && (
              <div>
                <span className="text-xs text-neutral-400 block mb-1">Target Roles:</span>
                <span className="text-neutral-200 text-xs">
                  {placementStats.roles.slice(0, 2).join(', ')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Popular Topics */}
        {popularTopics.length > 0 && (
          <div className="border border-neutral-900 bg-neutral-950/10 rounded-xl p-5">
            <p className="text-xs tracking-wider uppercase text-neutral-500 mb-4 font-bold">
              Popular Topics
            </p>
            <div className="flex flex-wrap gap-2">
              {popularTopics.map((topic, i) => (
                <span
                  key={i}
                  className="text-xs border border-neutral-900 bg-neutral-950/30 text-neutral-400 px-2.5 py-1 rounded"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer Footnote */}
        <div className="border border-neutral-900/60 bg-neutral-950/5 rounded-xl p-5">
          <p className="text-[10px] text-neutral-500 leading-relaxed">
            * Note: CGPA requirements and CTC stats are based on historical placement history and
            are subject to change for upcoming recruiting seasons.
          </p>
        </div>

        {/* CTA */}
        {questionsCount > 0 && (
          <button
            onClick={onViewProblems}
            className="w-full bg-[#35b9f1] hover:bg-[#35b9f1]/90 text-black text-xs tracking-wider uppercase font-extrabold py-3.5 px-4 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 font-mono"
          >
            <span>View {questionsCount} Tagged Problems</span>
            <ChevronRight className="w-4 h-4 text-black" />
          </button>
        )}
      </div>
    </div>
  );
}
