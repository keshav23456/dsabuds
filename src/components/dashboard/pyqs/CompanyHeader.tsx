'use client';

import { ChevronRight } from 'lucide-react';
import { LogoImage } from './LogoImage';
import { getCompanyLogoUrl } from './companyLogos';

export interface CompanyStat {
  label: string;
  value: string | number;
}

interface CompanyHeaderProps {
  onBack: () => void;
  selectedCompany: string;
  companyDetail: { logoUrl?: string | null } | null;
  initials: string;
  stats: CompanyStat[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  questionsCount: number;
  showStats?: boolean;
}

export function CompanyHeader({
  onBack,
  selectedCompany,
  companyDetail,
  initials,
  stats,
  activeTab,
  onTabChange,
  questionsCount,
  showStats = true,
}: CompanyHeaderProps) {
  const logoUrl = companyDetail?.logoUrl || getCompanyLogoUrl(selectedCompany);

  return (
    <>
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs tracking-wider uppercase text-neutral-500 mb-6 font-mono">
        <button onClick={onBack} className="hover:text-[#35b9f1] transition-colors cursor-pointer">
          Company Mines
        </button>
        <ChevronRight className="w-3 h-3 text-neutral-600" />
        <span className="text-[#35b9f1] font-semibold">{selectedCompany.toUpperCase()}</span>
      </div>

      {/* ── Company header ── */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center flex-shrink-0 text-black font-extrabold text-base select-none shadow-md overflow-hidden">
          {logoUrl ? (
            <LogoImage name={selectedCompany} logoUrl={logoUrl} size="w-36 h-36 text-base" />
          ) : (
            initials
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] tracking-widest uppercase text-neutral-500 font-mono">
            Company Profile
          </span>
          <h1 className="text-4xl sm:text-5xl text-white font-normal italic mt-0.5 leading-none font-serif">
            {selectedCompany}
          </h1>
        </div>
      </div>

      {/* ── Stats grid ── */}
      {showStats && (
        <div className="border border-neutral-900 rounded-xl mb-8 bg-neutral-950/20 font-mono">
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-neutral-900">
            {stats.map((stat, i) => (
              <div key={i} className="px-5 py-5 text-center md:text-left">
                <p className="text-[10px] tracking-widest uppercase text-neutral-500 mb-2">
                  {stat.label}
                </p>
                <p
                  className={`text-sm font-semibold tracking-wide ${
                    i === 0 ? 'text-[#35b9f1]' : 'text-neutral-200'
                  }`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-0 border-b border-neutral-900 mb-8 font-mono">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'problems', label: `Problems (${questionsCount})` },
          { id: 'experiences', label: 'Experiences' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-3.5 text-xs tracking-widest uppercase transition-all duration-200 cursor-pointer border-b-2 font-bold ${
              activeTab === tab.id
                ? 'text-[#35b9f1] border-[#35b9f1]'
                : 'text-neutral-500 border-transparent hover:text-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </>
  );
}
