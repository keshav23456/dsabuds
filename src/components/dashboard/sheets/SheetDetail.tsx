"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { sheetService } from "@/services/sheetService";
import { Spinner } from "@/components/common";
import { getErrorMessage } from "@/utils";
import { ProgressBar } from "./ProgressBar";
import { SectionNode } from "./SectionNode";
import type { ProgressUpdatePayload, SheetDetail as SheetDetailType, SheetSectionNode } from "./types";

export function SheetDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const [sheet, setSheet] = useState<SheetDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res: any = await sheetService.getSheetBySlug(slug);
        if (!cancelled) setSheet(res.sheet);
      } catch (e) {
        console.error("Failed to load sheet", e);
        if (!cancelled) setError(getErrorMessage(e) || "Failed to load sheet.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleUpdate = useCallback(async (problemId: string, payload: ProgressUpdatePayload) => {
    setSheet((prev) => {
      if (!prev) return prev;
      const apply = (node: SheetSectionNode): SheetSectionNode => ({
        ...node,
        problems: node.problems.map((p) => (p.id === problemId ? { ...p, ...payload } : p)),
        children: node.children?.map(apply) || [],
      });
      const withUpdate = { ...prev, sections: prev.sections.map(apply) };

      const recount = (node: SheetSectionNode): SheetSectionNode => {
        let solved = node.problems.filter((p) => p.status === "SOLVED").length;
        let total = node.problems.length;
        const children = (node.children || []).map(recount);
        for (const c of children) {
          solved += c.solved || 0;
          total += c.total || 0;
        }
        return { ...node, solved, total, children };
      };
      const sections = withUpdate.sections.map(recount);
      const solvedCount = sections.reduce((a, s) => a + (s.solved || 0), 0);
      return { ...withUpdate, sections, solvedCount };
    });

    try {
      await sheetService.updateProgress(problemId, payload as Record<string, unknown>);
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (error || !sheet) {
    return (
      <div className="text-center py-24">
        <p className="text-neutral-500 font-mono mb-4">{error || "Sheet not found."}</p>
        <button
          onClick={() => router.push("/dashboard/sheets")}
          className="text-[#35b9f1] font-mono text-sm hover:underline cursor-pointer"
        >
          ← Back to sheets
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push("/dashboard/sheets")}
        className="flex items-center gap-2 text-neutral-500 hover:text-white font-mono text-sm mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        All Sheets
      </button>

      <div className="mb-8">
        <h1 className="text-white text-4xl font-normal italic mb-2 font-serif">{sheet.name}</h1>
        {sheet.author && <p className="text-neutral-500 font-mono text-sm mb-4">by {sheet.author}</p>}
        <div className="max-w-md">
          <ProgressBar solved={sheet.solvedCount || 0} total={sheet.totalProblems || 0} />
        </div>
      </div>

      <div className="space-y-4">
        {sheet.sections.map((section) => (
          <SectionNode key={section.id} section={section} onUpdate={handleUpdate} />
        ))}
      </div>
    </div>
  );
}
