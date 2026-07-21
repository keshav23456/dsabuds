import { FileText } from "lucide-react";
import { getPlatformFromUrl, PlatformIcon, PLATFORMS } from "@/utils";
import type { SheetProblem } from "./types";

export function ResourceIcons({ problem }: { problem: SheetProblem }) {
  const platformKey = getPlatformFromUrl(problem.practiceUrl);
  const platform = platformKey ? PLATFORMS[platformKey] : null;

  if (!platform) {
    if (!problem.articleUrl) return <span className="text-neutral-700">—</span>;
    return (
      <a
        href={problem.articleUrl}
        target="_blank"
        rel="noreferrer"
        title="Article"
        className="text-neutral-400 hover:text-white transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <FileText className="w-4 h-4" />
      </a>
    );
  }

  return (
    <a
      href={problem.practiceUrl ?? undefined}
      target="_blank"
      rel="noreferrer"
      title={platform.name}
      className="transition-opacity hover:opacity-70"
      onClick={(e) => e.stopPropagation()}
    >
      <PlatformIcon url={problem.practiceUrl} className="w-4 h-4" />
    </a>
  );
}
