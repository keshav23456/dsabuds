"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import type { SheetListItem } from "./types";

export function SheetCard({ sheet }: { sheet: SheetListItem }) {
  const router = useRouter();

  return (
    <motion.button
      whileHover={{ y: -3 }}
      onClick={() => router.push(`/dashboard/sheets/${sheet.slug}`)}
      className="text-left bg-[#0D1117] border border-neutral-900 rounded-2xl p-5 hover:border-[#35b9f1]/40 transition-colors cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        <h3 className="text-white font-semibold text-lg leading-snug">{sheet.name}</h3>
        <ChevronRight className="w-5 h-5 text-neutral-700 group-hover:text-[#35b9f1] transition-colors shrink-0" />
      </div>
      {sheet.author && <p className="text-neutral-500 text-xs font-mono mb-4">by {sheet.author}</p>}
      <ProgressBar solved={sheet.solvedCount || 0} total={sheet.totalProblems || 0} />
    </motion.button>
  );
}
