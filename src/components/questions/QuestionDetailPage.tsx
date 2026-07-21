import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { DifficultyBadgeLarge, Section } from './QuestionBadges';
import { QuestionStatusPanel } from './QuestionStatusPanel';
import type { QuestionCore } from '@/lib/questions';

interface QuestionDetailPageProps {
  slug: string;
  question: QuestionCore;
}

export function QuestionDetailPage({ slug, question }: QuestionDetailPageProps) {
  const externalUrl = question.sourceUrl || question.leetcodeUrl;
  const tags = question.tags || [];

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 pb-12 pt-[100px] sm:px-6 sm:pt-[120px] sm:pb-16">
        <Link
          href="/questions"
          className="mb-7 inline-flex items-center gap-1.5 border-none bg-none py-1 text-sm font-medium text-slate-500 no-underline transition-colors hover:text-violet-400"
        >
          <ChevronLeft size={16} strokeWidth={2.5} /> Back to Questions
        </Link>

        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="mb-5 flex flex-wrap items-start gap-3.5">
              <h1 className="m-0 flex-1 text-[clamp(22px,3.5vw,32px)] font-extrabold leading-tight tracking-tight">
                {question.displayName || question.title}
              </h1>
              <DifficultyBadgeLarge difficulty={question.difficulty} />
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-4">
              {question.sourcePlatform && (
                <span className="text-[13px] text-slate-500">
                  {question.sourcePlatform}
                  {question.sourceId && ` #${question.sourceId}`}
                </span>
              )}
              {question.acceptanceRate != null && (
                <span className="text-[13px] text-slate-500">
                  Acceptance:{' '}
                  <span className="text-slate-400">{(question.acceptanceRate * (question.acceptanceRate > 1 ? 1 : 100)).toFixed(1)}%</span>
                </span>
              )}
              {question.sourceRating && (
                <span className="text-[13px] text-slate-500">
                  Rating: <span className="text-slate-400">{question.sourceRating}</span>
                </span>
              )}
              {question.paidOnly && <span className="text-xs font-bold text-yellow-500">💰 Premium</span>}
              {externalUrl && (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[13px] font-semibold text-violet-600 no-underline transition-colors hover:bg-violet-500/20"
                >
                  Solve Now <ExternalLink size={14} />
                </a>
              )}
            </div>

            {tags.length > 0 && (
              <div className="mb-7 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <Link
                    key={t}
                    href={`/questions?tag=${encodeURIComponent(t)}`}
                    className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400 no-underline transition-colors hover:bg-violet-500/20"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            )}

            {question.statement && (
              <Section title="Problem Statement">
                <div
                  className="whitespace-pre-wrap text-[15px] leading-[1.75] text-slate-300"
                  dangerouslySetInnerHTML={{ __html: question.statement }}
                />
              </Section>
            )}

            {question.examples != null && (
              <Section title="Examples">
                {(Array.isArray(question.examples) ? question.examples : [question.examples]).map((ex, i) => (
                  <div key={i} className="mb-3 whitespace-pre-wrap rounded-[10px] border border-[#1a1a2e] bg-[#0a0a14] px-[18px] py-4 font-mono text-[13px] text-slate-400">
                    <span className="mb-2 block text-[11px] font-bold tracking-wider text-slate-500">EXAMPLE {i + 1}</span>
                    {typeof ex === 'string' ? ex : JSON.stringify(ex, null, 2)}
                  </div>
                ))}
              </Section>
            )}

            {question.constraints != null && (
              <Section title="Constraints">
                <div className="whitespace-pre-wrap rounded-[10px] border border-[#1a1a2e] bg-[#0a0a14] px-[18px] py-4 font-mono text-[13px] text-slate-400">
                  {typeof question.constraints === 'string' ? question.constraints : JSON.stringify(question.constraints, null, 2)}
                </div>
              </Section>
            )}
          </div>

          <div className="static top-[100px] lg:sticky">
            <QuestionStatusPanel questionId={question.id} slug={slug} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
