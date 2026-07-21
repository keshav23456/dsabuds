const DIFFICULTY_TEXT_CLASSES: Record<string, string> = {
  EASY: 'text-green-500',
  MEDIUM: 'text-yellow-500',
  HARD: 'text-red-500',
};

const DIFFICULTY_BOX_CLASSES: Record<string, string> = {
  EASY: 'bg-green-500/10 text-green-500 border-green-500/25',
  MEDIUM: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/25',
  HARD: 'bg-red-500/10 text-red-500 border-red-500/25',
};

const STATUS_CLASSES: Record<string, string> = {
  SOLVED: 'bg-green-500/15 text-green-500',
  ATTEMPTED: 'bg-yellow-500/15 text-yellow-500',
  SKIPPED: 'bg-slate-400/15 text-slate-400',
};

export function DifficultyBadge({ difficulty }: { difficulty?: string }) {
  const c = (difficulty && DIFFICULTY_TEXT_CLASSES[difficulty]) || DIFFICULTY_TEXT_CLASSES.MEDIUM;
  return <span className={`inline-block whitespace-nowrap text-xs font-semibold tracking-wide ${c}`}>{difficulty}</span>;
}

export function DifficultyBadgeLarge({ difficulty }: { difficulty?: string }) {
  const c = (difficulty && DIFFICULTY_BOX_CLASSES[difficulty]) || DIFFICULTY_BOX_CLASSES.MEDIUM;
  return <span className={`inline-block rounded-lg border px-3.5 py-1 text-[13px] font-bold ${c}`}>{difficulty}</span>;
}

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  const c = STATUS_CLASSES[status] || STATUS_CLASSES.SKIPPED;
  return <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${c}`}>{status}</span>;
}

export function TagPill({ name }: { name: string }) {
  return (
    <span className="whitespace-nowrap rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-400">
      {name}
    </span>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="mb-3.5 text-base font-bold uppercase tracking-wider text-slate-400">{title}</h2>
      {children}
    </div>
  );
}

export function SkeletonBlock({ width = '100%', height = '16px', radius = '4px' }: { width?: string; height?: string; radius?: string }) {
  return <div className="animate-pulse bg-[#1a1a2e]" style={{ width, height, borderRadius: radius }} />;
}
