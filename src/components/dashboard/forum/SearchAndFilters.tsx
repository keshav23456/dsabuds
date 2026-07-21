'use client';

import { Search, X } from 'lucide-react';
import { Button, Input } from '@/components/common';

export const POPULAR_TAGS = [
  'Google', 'Amazon', 'Uber', 'Microsoft', 'Apple',
  'SWE', 'System Design', 'FTE', 'Internship', 'HR Round',
  'On-Campus', 'Off-Campus',
];

interface SearchAndFiltersProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  selectedTag: string;
  onSelectedTagChange: (value: string) => void;
}

export function SearchAndFilters({
  searchInput,
  onSearchInputChange,
  selectedTag,
  onSelectedTagChange,
}: SearchAndFiltersProps) {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <Input
          type="text"
          placeholder="Search experiences..."
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          icon={Search}
          className="w-full md:w-80"
          inputClassName="py-2.5 bg-[#161B22] border-[#1F2937] rounded-xl"
        />

        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-start md:justify-end">
          <span className="text-[#6B7280] text-xs font-bold font-mono mr-2">Filter Tag:</span>
          <select
            value={selectedTag}
            onChange={(e) => onSelectedTagChange(e.target.value)}
            className="bg-[#161B22] border border-[#1F2937] rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-[#35b9f1]/30 cursor-pointer"
          >
            <option value="">All Tags</option>
            {POPULAR_TAGS.map((tag) => (
              <option key={tag} value={tag}>#{tag}</option>
            ))}
          </select>
          {selectedTag && (
            <Button
              onClick={() => onSelectedTagChange('')}
              variant="outline"
              size="sm"
              className="p-2.5 hover:bg-[#161B22] rounded-xl border-[#1F2937] text-red-400 hover:text-red-300 h-[38px] flex items-center justify-center"
              title="Clear tag filter"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-[#161B22]">
        <span className="text-[10px] font-bold font-mono text-[#6B7280] uppercase tracking-wider block shrink-0 mr-2">Quick Tags:</span>
        {POPULAR_TAGS.slice(0, 8).map((tag) => {
          const isActive = selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => onSelectedTagChange(isActive ? '' : tag)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#35b9f1]/10 border-[#35b9f1] text-[#35b9f1]'
                  : 'bg-[#161B22] border-[#1F2937] text-[#9CA3AF] hover:text-white hover:border-[#1F2937]/80'
              }`}
            >
              #{tag}
            </button>
          );
        })}
      </div>
    </>
  );
}
