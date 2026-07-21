export function ProgressBar({
  solved,
  total,
  className = "",
}: {
  solved: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 bg-neutral-900 rounded-full overflow-hidden min-w-[60px]">
        <div
          className="h-full bg-[#35b9f1] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-neutral-500 tabular-nums whitespace-nowrap">
        {solved} / {total}
      </span>
    </div>
  );
}
