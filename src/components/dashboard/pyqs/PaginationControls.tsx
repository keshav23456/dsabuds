'use client';

import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const pages: ReactNode[] = [];
  const maxVisible = 5;
  let start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  if (start > 1) {
    pages.push(
      <button
        key={1}
        onClick={() => onPageChange(1)}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-900 hover:border-neutral-800 text-neutral-400 transition-all cursor-pointer"
      >
        1
      </button>,
    );
    if (start > 2) {
      pages.push(
        <span key="dots-start" className="px-1 text-neutral-600">
          ...
        </span>,
      );
    }
  }

  for (let i = start; i <= end; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
          page === i
            ? 'bg-[#35b9f1]/10 border-[#35b9f1] text-[#35b9f1] font-bold'
            : 'border-neutral-900 hover:border-neutral-800 text-neutral-400'
        }`}
      >
        {i}
      </button>,
    );
  }

  if (end < totalPages) {
    if (end < totalPages - 1) {
      pages.push(
        <span key="dots-end" className="px-1 text-neutral-600">
          ...
        </span>,
      );
    }
    pages.push(
      <button
        key={totalPages}
        onClick={() => onPageChange(totalPages)}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-900 hover:border-neutral-800 text-neutral-400 transition-all cursor-pointer"
      >
        {totalPages}
      </button>,
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-center">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        className="p-2 border border-neutral-900 bg-neutral-950/20 text-neutral-400 rounded-lg hover:border-neutral-800 disabled:opacity-30 disabled:hover:border-neutral-900 cursor-pointer disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages}

      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        className="p-2 border border-neutral-900 bg-neutral-950/20 text-neutral-400 rounded-lg hover:border-neutral-800 disabled:opacity-30 disabled:hover:border-neutral-900 cursor-pointer disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
