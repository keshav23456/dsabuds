'use client';

import { ExternalLink, Search } from 'lucide-react';
import { PaginationControls } from './PaginationControls';
import type { PlacementStats } from './CompanyOverviewTab';

export interface CompanyQuestion {
  title: string;
  difficulty: string;
  url: string;
  frequency: string;
  tags: string[];
}

const getDifficultyBadge = (diff?: string) => {
  const d = diff?.toLowerCase();
  if (d === 'easy') return { cls: 'border-[#30D158] text-[#30D158]', label: 'EASY' };
  if (d === 'medium') return { cls: 'border-[#FF9F0A] text-[#FF9F0A]', label: 'MEDIUM' };
  if (d === 'hard') return { cls: 'border-[#FF453A] text-[#FF453A]', label: 'HARD' };
  return { cls: 'border-[#6B7280] text-[#6B7280]', label: 'EASY' };
};

interface CompanyProblemsTabProps {
  subTitle?: string;
  placementStats: PlacementStats | null;
  difficultyFilter: string;
  setDifficultyFilter: (v: string) => void;
  searchInput: string;
  setSearchInput: (v: string) => void;
  filteredQuestions: CompanyQuestion[];
  paginatedQuestions: CompanyQuestion[];
  questionPage: number;
  setQuestionPage: (v: number) => void;
  questionsPerPage: number;
  totalQuestionPages: number;
}

export function CompanyProblemsTab({
  subTitle,
  placementStats,
  difficultyFilter,
  setDifficultyFilter,
  searchInput,
  setSearchInput,
  filteredQuestions,
  paginatedQuestions,
  questionPage,
  setQuestionPage,
  questionsPerPage,
  totalQuestionPages,
}: CompanyProblemsTabProps) {
  return (
    <div className="font-mono">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-neutral-900 pb-6">
        <div>
          <p className="text-neutral-400 text-sm tracking-wide">
            {subTitle || 'Software Engineering Opportunities'}
          </p>
        </div>
        {placementStats?.maxCtc && (
          <div className="text-left md:text-right">
            <span className="text-xs text-neutral-500 block mb-1 font-mono">MAX CTC *</span>
            <span className="text-[#35b9f1] font-normal italic text-3xl font-serif">
              {placementStats.maxCtc} LPA
            </span>
          </div>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {['all', 'easy', 'medium', 'hard'].map((f) => (
          <button
            key={f}
            onClick={() => setDifficultyFilter(f)}
            className={`text-xs tracking-wider uppercase px-4 py-2 rounded-lg border transition-all duration-150 cursor-pointer ${
              difficultyFilter === f
                ? f === 'all'
                  ? 'bg-[#35b9f1] text-black border-[#35b9f1] font-bold'
                  : f === 'easy'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                    : f === 'medium'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                      : 'bg-red-500/10 border-red-500 text-red-400 font-bold'
                : 'border-neutral-900 text-neutral-500 hover:border-neutral-800 hover:text-neutral-300'
            }`}
          >
            {f}
          </button>
        ))}

        {/* Search bar */}
        <div className="ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
          <input
            type="text"
            placeholder="Search problems..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-neutral-950 border border-neutral-900 rounded-lg pl-9 pr-4 py-2 text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-[#35b9f1]/40 transition-all w-48"
          />
        </div>
      </div>

      {/* Questions table */}
      <div className="border border-neutral-900 rounded-xl overflow-hidden bg-neutral-950/20">
        {/* Table header */}
        <div className="grid grid-cols-[4rem_1fr_8rem_5rem] border-b border-neutral-900 bg-neutral-950/60 font-bold">
          <div className="px-5 py-4 text-xs tracking-wider uppercase text-neutral-500">IDX</div>
          <div className="px-5 py-4 text-xs tracking-wider uppercase text-neutral-500">
            Problem
          </div>
          <div className="px-5 py-4 text-xs tracking-wider uppercase text-neutral-500 text-center">
            Difficulty
          </div>
          <div className="px-5 py-4 text-xs tracking-wider uppercase text-neutral-500 text-center">
            Action
          </div>
        </div>

        {/* Rows */}
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-xs tracking-wider uppercase">
              No problems match current filters
            </p>
          </div>
        ) : (
          paginatedQuestions.map((question, index) => {
            const badge = getDifficultyBadge(question.difficulty);
            const actualIndex = (questionPage - 1) * questionsPerPage + index + 1;
            return (
              <div
                key={index}
                onClick={() =>
                  question.url && window.open(question.url, '_blank', 'noopener,noreferrer')
                }
                className={`grid grid-cols-[4rem_1fr_8rem_5rem] border-b border-neutral-900 last:border-0 hover:bg-neutral-950/40 transition-colors duration-100 ${question.url ? 'cursor-pointer' : ''} group`}
              >
                {/* Index */}
                <div className="px-5 py-5 flex items-center">
                  <span className="text-neutral-500 text-xs font-bold font-mono">
                    {String(actualIndex).padStart(2, '0')}
                  </span>
                </div>
                {/* Problem */}
                <div className="px-5 py-5">
                  <p className="text-neutral-200 text-sm font-semibold group-hover:text-[#35b9f1] transition-colors leading-snug mb-2">
                    {question.title}
                  </p>
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {question.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] tracking-wider uppercase border border-neutral-900 bg-neutral-950/40 text-neutral-500 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Difficulty */}
                <div className="px-5 py-5 flex items-center justify-center">
                  <span
                    className={`text-[10px] font-bold tracking-widest uppercase border px-2.5 py-1 rounded ${badge.cls}`}
                  >
                    {badge.label}
                  </span>
                </div>
                {/* Action */}
                <div className="px-5 py-5 flex items-center justify-center">
                  {question.url && (
                    <ExternalLink className="w-4 h-4 text-neutral-600 group-hover:text-[#35b9f1] transition-colors" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalQuestionPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-900 pt-6 mt-6 font-mono text-xs">
          <span className="text-neutral-500">
            Showing{' '}
            {Math.min(filteredQuestions.length, (questionPage - 1) * questionsPerPage + 1)}-
            {Math.min(filteredQuestions.length, questionPage * questionsPerPage)} of{' '}
            {filteredQuestions.length} problems
          </span>
          <PaginationControls
            page={questionPage}
            totalPages={totalQuestionPages}
            onPageChange={setQuestionPage}
          />
        </div>
      )}

      {filteredQuestions.length > 0 && totalQuestionPages <= 1 && (
        <p className="text-neutral-600 text-xs tracking-wider uppercase text-center mt-6">
          Showing all {filteredQuestions.length} problems
        </p>
      )}
    </div>
  );
}
