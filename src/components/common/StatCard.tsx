import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  change?: number;
  color?: string;
}

export function StatCard({ icon: Icon, label, value, change, color = '#35b9f1' }: StatCardProps) {
  return (
    <div className="bg-[#161B22] rounded-xl p-6 border border-[#1F2937] hover:border-[#35b9f1]/20 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-[#0D1117]">
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {change !== undefined && change !== 0 && (
          <span className={`text-xs font-mono ${change > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-[#6B7280] text-xs mb-1 font-mono uppercase">{label}</p>
      <p className="text-[#E5E7EB] text-2xl font-bold">{value}</p>
    </div>
  );
}
