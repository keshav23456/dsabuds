'use client';

import { useRef } from 'react';

export interface DirectoryCompany {
  name: string;
  slug: string;
  questionCount: number;
  hasQuestions: boolean;
  logoUrl: string | null;
  branches: string[];
  minCgpa: number | null;
}

interface CompanyCardProps {
  company: DirectoryCompany;
  onClick: () => void;
}

export function CompanyCard({ company, onClick }: CompanyCardProps) {
  const fallbackRef = useRef<HTMLDivElement>(null);
  const char = company.name.charAt(0).toUpperCase();
  const logoUrl = company.logoUrl;

  return (
    <div
      onClick={onClick}
      className="bg-[#161B22] border border-[#1F2937] hover:border-[#35b9f1]/30 rounded-xl sm:rounded-2xl p-3 sm:p-6 flex flex-col items-center justify-between cursor-pointer transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0D1117]/80"
    >
      <div
        className={`w-12 h-12 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl border border-[#1F2937] flex items-center justify-center mb-2 sm:mb-4 transition-all ${
          logoUrl
            ? 'bg-slate-100 p-1.5 sm:p-2 group-hover:border-white/50'
            : 'bg-[#0D1117]/80 group-hover:border-[#1F2937]/80'
        }`}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={company.name}
            onError={(e) => {
              console.error(`Failed to load company logo: ${logoUrl}`);
              e.currentTarget.style.display = 'none';
              if (fallbackRef.current) fallbackRef.current.style.display = 'flex';
              const parent = e.currentTarget.parentNode as HTMLElement | null;
              if (parent) {
                parent.style.backgroundColor = 'rgba(13, 17, 23, 0.8)';
                parent.style.padding = '0';
                parent.style.borderColor = '#1F2937';
              }
            }}
            className="w-6 h-6 sm:w-12 sm:h-12 object-contain rounded"
          />
        ) : null}
        <div
          ref={fallbackRef}
          style={{ display: logoUrl ? 'none' : 'flex' }}
          className="w-6 h-6 sm:w-12 sm:h-12 bg-[#161B22] border border-[#1F2937] rounded-lg sm:rounded-xl items-center justify-center text-[#6B7280] font-bold text-sm sm:text-2xl"
        >
          {char}
        </div>
      </div>

      <h3 className="text-white font-bold text-xs sm:text-lg mb-0.5 sm:mb-1 group-hover:text-[#35b9f1] transition-colors text-center w-full truncate">
        {company.name}
      </h3>

      <span className="text-[9px] sm:text-xs bg-[#0D1117] text-[#9CA3AF] border border-[#1F2937] px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full font-mono font-bold mt-1 sm:mt-2 whitespace-nowrap">
        {company.questionCount} Q
        <span className="hidden sm:inline">uestions</span>
      </span>
    </div>
  );
}
