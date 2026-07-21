'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { questionService } from '@/services/questionService';
import { useUserStore } from '@/store/useUserStore';
import { STATUS_COLORS, STATUS_OPTIONS } from '@/config/constants';

interface QuestionStatusPanelProps {
  questionId: string;
  slug: string;
}

export function QuestionStatusPanel({ questionId, slug }: QuestionStatusPanelProps) {
  const router = useRouter();
  const user = useUserStore((s) => s.user);

  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    questionService
      .getById(slug)
      .then((data: any) => {
        if (!cancelled) setCurrentStatus(data.question?.userStatuses?.[0]?.status ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug, user]);

  const handleSetStatus = async (status: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    const nextStatus = status === currentStatus ? null : status;
    setStatusLoading(true);
    try {
      await questionService.setStatus(questionId, nextStatus as string);
      setCurrentStatus(nextStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="mb-5 rounded-2xl border border-[#1a1a2e] bg-[#0a0a14] p-5">
      <p className="m-0 mb-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">My Status</p>
      <div className="flex flex-col gap-2">
        {STATUS_OPTIONS.map((s) => {
          const c = STATUS_COLORS[s];
          const isActive = currentStatus === s;
          return (
            <button
              key={s}
              onClick={() => handleSetStatus(s)}
              disabled={statusLoading || !user}
              className="flex w-full items-center gap-2 rounded-[10px] border px-4 py-2.5 text-left text-[13px] font-bold transition-colors disabled:cursor-not-allowed"
              style={{
                cursor: statusLoading || !user ? 'not-allowed' : 'pointer',
                borderColor: isActive ? c.border : '#1e1e3a',
                background: isActive ? c.bg : 'transparent',
                color: isActive ? c.text : '#475569',
                opacity: statusLoading ? 0.6 : 1,
              }}
            >
              <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: isActive ? c.text : '#1e293b' }} />
              {s}
            </button>
          );
        })}
        {!user && (
          <p className="m-0 mt-1 text-center text-xs text-slate-700">
            <Link href="/login" className="text-violet-600">
              Log in
            </Link>{' '}
            to track your progress
          </p>
        )}
      </div>
    </div>
  );
}
