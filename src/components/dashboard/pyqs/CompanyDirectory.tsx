'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { useBranchCodeMap } from '@/hooks';
import { CompanyCard, type DirectoryCompany } from './CompanyCard';
import { PaginationControls } from './PaginationControls';

interface CompanyDirectoryProps {
  companySearchInput: string;
  setCompanySearchInput: (v: string) => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  branchFilter: string;
  setBranchFilter: (v: string) => void;
  cgpaFilter: string;
  setCgpaFilter: (v: string) => void;
  companySearchQuery: string;
  companiesList: DirectoryCompany[];
  companiesTotal: number;
  companiesLoading: boolean;
  companyPage: number;
  setCompanyPage: (v: number) => void;
  companiesPerPage: number;
  totalCompanyPages: number;
  onCompanyClick: (company: DirectoryCompany) => void;
}

export function CompanyDirectory({
  companySearchInput,
  setCompanySearchInput,
  showFilters,
  setShowFilters,
  branchFilter,
  setBranchFilter,
  cgpaFilter,
  setCgpaFilter,
  companySearchQuery,
  companiesList,
  companiesTotal,
  companiesLoading,
  companyPage,
  setCompanyPage,
  companiesPerPage,
  totalCompanyPages,
  onCompanyClick,
}: CompanyDirectoryProps) {
  const branchCodeMap = useBranchCodeMap();

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-white text-4xl font-normal italic mb-2 font-serif">
          Company Placement Archives
        </h1>
        <p className="text-[#9CA3AF] text-sm font-medium">
          Explore recruitment pipelines, eligibility criteria, and past year
          interview questions for top tech employers.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search companies (e.g., Goldman Sachs, JPMorgan, Apple...)"
              value={companySearchInput}
              onChange={(e) => setCompanySearchInput(e.target.value)}
              className="w-full bg-[#161B22] border border-[#1F2937] rounded-xl pl-11 pr-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#35b9f1]/40 focus:ring-1 focus:ring-[#35b9f1]/40 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer font-mono uppercase ${
              showFilters || branchFilter !== 'all' || cgpaFilter !== 'all'
                ? 'bg-[#35b9f1]/10 border-[#35b9f1] text-[#35b9f1]'
                : 'bg-[#161B22] border-[#1F2937] text-neutral-400 hover:text-neutral-200 hover:border-neutral-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {(branchFilter !== 'all' || cgpaFilter !== 'all') && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#35b9f1] shadow-[0_0_8px_#35b9f1]" />
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-[#161B22]/50 border border-[#1F2937] rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-5 transition-all duration-200">
            {/* Branch Selector */}
            <div>
              <label className="block text-[10px] text-neutral-400 font-bold uppercase mb-2 font-mono tracking-wider">
                Eligible Branch
              </label>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full bg-[#0D1117] border border-[#1F2937] text-xs text-neutral-200 rounded-lg p-2.5 focus:outline-none focus:border-[#35b9f1]/40 focus:ring-1 focus:ring-[#35b9f1]/40 transition-all cursor-pointer"
              >
                <option value="all">ALL BRANCHES</option>
                {Object.entries(branchCodeMap).map(([name, code]) => (
                  <option key={code} value={code}>
                    {name} ({code})
                  </option>
                ))}
              </select>
            </div>

            {/* CGPA Selector */}
            <div>
              <label className="block text-[10px] text-neutral-400 font-bold uppercase mb-2 font-mono tracking-wider">
                Max CGPA Required (Your CGPA)
              </label>
              <select
                value={cgpaFilter}
                onChange={(e) => setCgpaFilter(e.target.value)}
                className="w-full bg-[#0D1117] border border-[#1F2937] text-xs text-neutral-200 rounded-lg p-2.5 focus:outline-none focus:border-[#35b9f1]/40 focus:ring-1 focus:ring-[#35b9f1]/40 transition-all cursor-pointer"
              >
                <option value="all">ANY CGPA</option>
                {['9.5', '9.0', '8.5', '8.0', '7.5', '7.0', '6.5', '6.0'].map((cgpa) => (
                  <option key={cgpa} value={cgpa}>
                    {cgpa} or below
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Records Status Bar */}
        {(branchFilter !== 'all' || cgpaFilter !== 'all' || companySearchQuery) && (
          <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono bg-neutral-950/20 border border-neutral-900/60 px-4 py-2 rounded-lg">
            <span>
              Found{' '}
              <strong className="text-neutral-300 font-bold">{companiesTotal}</strong>{' '}
              matching {companiesTotal === 1 ? 'company' : 'companies'}
            </span>
            <button
              onClick={() => {
                setBranchFilter('all');
                setCgpaFilter('all');
                setCompanySearchInput('');
              }}
              className="text-[#35b9f1] hover:underline cursor-pointer font-bold uppercase text-[10px] tracking-wider"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {companiesLoading && companiesList.length === 0 ? (
        <div className="text-center py-16 bg-[#161B22]/30 rounded-2xl border border-dashed border-[#1F2937] transition-all">
          <div className="w-8 h-8 border-2 border-neutral-800 border-t-[#35b9f1] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-400 font-mono text-sm">Loading companies...</p>
        </div>
      ) : companiesList.length > 0 ? (
        <div className="space-y-8">
          <div
            className={`grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 transition-opacity ${
              companiesLoading ? 'opacity-50' : ''
            }`}
          >
            {companiesList.map((company) => (
              <CompanyCard
                key={company.name}
                company={company}
                onClick={() => onCompanyClick(company)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalCompanyPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-900 pt-6 font-mono text-xs">
              <span className="text-neutral-500">
                Showing{' '}
                {Math.min(companiesTotal, (companyPage - 1) * companiesPerPage + 1)}-
                {Math.min(companiesTotal, companyPage * companiesPerPage)} of {companiesTotal}{' '}
                companies
              </span>
              <PaginationControls
                page={companyPage}
                totalPages={totalCompanyPages}
                onPageChange={setCompanyPage}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#161B22]/30 rounded-2xl border border-dashed border-[#1F2937] transition-all">
          <p className="text-neutral-400 font-mono text-sm">
            No companies found matching{' '}
            {companySearchQuery ? `"${companySearchQuery}"` : 'selected criteria'}
            {branchFilter !== 'all'
              ? ` for branch ${branchFilter === 'mac' ? 'M&C' : branchFilter.toUpperCase()}`
              : ''}
            {cgpaFilter !== 'all' ? ` with CGPA requirement <= ${cgpaFilter}` : ''}
          </p>
        </div>
      )}
    </div>
  );
}
