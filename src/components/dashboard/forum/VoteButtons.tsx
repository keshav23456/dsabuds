'use client';

import { ChevronUp, ChevronDown } from 'lucide-react';

interface VoteButtonsProps {
  score: number;
  userVote: number;
  onVote: (e: React.MouseEvent, value: number) => void;
  size?: 'sm' | 'md';
}

export function VoteButtons({ score, userVote, onVote, size = 'md' }: VoteButtonsProps) {
  const isSm = size === 'sm';
  return (
    <div
      className={`flex items-center bg-[#0D1117] border border-[#1F2937] rounded-xl gap-1 ${
        isSm ? 'p-0.5 !rounded-lg !gap-0.5' : 'p-1'
      }`}
    >
      <button
        onClick={(e) => onVote(e, 1)}
        className={`${isSm ? 'p-1 rounded' : 'p-1.5 rounded-lg'} transition-all duration-200 cursor-pointer ${
          userVote === 1
            ? 'text-[#35b9f1] bg-[#35b9f1]/10'
            : 'text-[#9CA3AF] hover:text-white hover:bg-[#161B22]'
        }`}
      >
        <ChevronUp className={isSm ? 'w-4 h-4' : 'w-5 h-5'} />
      </button>

      <span
        className={`font-mono font-bold text-xs text-center ${isSm ? 'px-1.5 min-w-[14px]' : 'px-2 min-w-[20px]'} ${
          userVote === 1 ? 'text-[#35b9f1]' : userVote === -1 ? 'text-red-500' : 'text-[#E5E7EB]'
        }`}
      >
        {score || 0}
      </span>

      <button
        onClick={(e) => onVote(e, -1)}
        className={`${isSm ? 'p-1 rounded' : 'p-1.5 rounded-lg'} transition-all duration-200 cursor-pointer ${
          userVote === -1
            ? 'text-red-500 bg-red-500/10'
            : 'text-[#9CA3AF] hover:text-white hover:bg-[#161B22]'
        }`}
      >
        <ChevronDown className={isSm ? 'w-4 h-4' : 'w-5 h-5'} />
      </button>
    </div>
  );
}
