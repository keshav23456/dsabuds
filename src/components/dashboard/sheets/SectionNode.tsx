"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { ProblemRow } from "./ProblemRow";
import type { ProgressUpdatePayload, SheetSectionNode } from "./types";

export function SectionNode({
  section,
  onUpdate,
  depth = 0,
}: {
  section: SheetSectionNode;
  onUpdate: (problemId: string, payload: ProgressUpdatePayload) => void;
  depth?: number;
}) {
  const [open, setOpen] = useState(depth === 0);
  const hasProblems = section.problems?.length > 0;
  const hasChildren = section.children?.length > 0;

  return (
    <div className={depth === 0 ? "border border-neutral-900 rounded-2xl overflow-hidden bg-[#0D1117]" : ""}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-900/40 transition-colors cursor-pointer ${
          depth > 0 ? "border-t border-neutral-900/70" : ""
        }`}
        style={{ paddingLeft: `${16 + depth * 16}px` }}
      >
        {open ? (
          <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-neutral-500 shrink-0" />
        )}
        <span className={`flex-1 text-left ${depth === 0 ? "text-white font-semibold" : "text-neutral-300 font-medium text-sm"}`}>
          {section.title}
        </span>
        <ProgressBar solved={section.solved || 0} total={section.total || 0} className="max-w-[180px] hidden sm:flex" />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {hasProblems && (
              <div>
                {section.problems.map((p) => (
                  <ProblemRow key={p.id} problem={p} onUpdate={onUpdate} />
                ))}
              </div>
            )}
            {hasChildren &&
              section.children.map((child) => (
                <SectionNode key={child.id} section={child} onUpdate={onUpdate} depth={depth + 1} />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
