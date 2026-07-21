import { Star, ExternalLink, Check } from "lucide-react";
import { ResourceIcons } from "./ResourceIcons";
import type { ProblemDifficulty, ProblemStatus, SheetProblem, ProgressUpdatePayload } from "./types";

const DIFF_STYLES: Record<ProblemDifficulty, string> = {
  EASY: "text-[#10B981] bg-[#10B981]/10",
  MEDIUM: "text-[#F5B14C] bg-[#F5B14C]/10",
  HARD: "text-[#F26D6D] bg-[#F26D6D]/10",
};

const diffLabel = (d: ProblemDifficulty | null) => (d ? d[0] + d.slice(1).toLowerCase() : "—");

export function ProblemRow({
  problem,
  onUpdate,
}: {
  problem: SheetProblem;
  onUpdate: (problemId: string, payload: ProgressUpdatePayload) => void;
}) {
  const solved = problem.status === "SOLVED";

  const toggleSolved = () =>
    onUpdate(problem.id, { status: (solved ? "UNSOLVED" : "SOLVED") as ProblemStatus });

  const toggleStar = () => onUpdate(problem.id, { starred: !problem.starred });

  return (
    <div className="grid grid-cols-[40px_1fr_auto_auto_auto] items-center gap-3 px-4 py-3 border-b border-neutral-900/70 hover:bg-neutral-900/30 transition-colors">
      <button
        onClick={toggleSolved}
        title={solved ? "Mark unsolved" : "Mark solved"}
        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
          solved ? "bg-[#10B981] border-[#10B981]" : "border-neutral-700 hover:border-[#35b9f1]"
        }`}
      >
        {solved && <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex items-center gap-2">
        {problem.practiceUrl ? (
          <a
            href={problem.practiceUrl}
            target="_blank"
            rel="noreferrer"
            className={`hover:text-[#35b9f1] transition-colors inline-flex items-center gap-2 min-w-0 ${
              solved ? "text-neutral-500 line-through" : "text-neutral-200"
            }`}
          >
            <span className="truncate text-sm">{problem.title}</span>
            <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />

            {problem.needsReview && (
              <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shrink-0 select-none">
                ⚠ verify
              </span>
            )}
          </a>
        ) : (
          <div className="inline-flex items-center gap-2 min-w-0">
            <span className={`text-sm truncate ${solved ? "text-neutral-500 line-through" : "text-neutral-200"}`}>
              {problem.title}
            </span>

            {problem.needsReview && (
              <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shrink-0 select-none">
                ⚠ verify
              </span>
            )}
          </div>
        )}
      </div>

      <div className="w-14 flex justify-center">
        <ResourceIcons problem={problem} />
      </div>

      <button
        onClick={toggleStar}
        title="Mark for revision"
        className={`w-8 flex justify-center transition-colors cursor-pointer ${
          problem.starred ? "text-[#F5B14C]" : "text-neutral-600 hover:text-neutral-300"
        }`}
      >
        <Star className="w-4 h-4" fill={problem.starred ? "currentColor" : "none"} />
      </button>

      <span
        className={`text-[11px] font-mono px-2 py-0.5 rounded-md text-center w-16 ${
          problem.difficulty ? DIFF_STYLES[problem.difficulty] : "text-neutral-500 bg-neutral-900"
        }`}
      >
        {diffLabel(problem.difficulty)}
      </span>
    </div>
  );
}
