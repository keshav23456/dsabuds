import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';

export const getAllBranches = cache(async (): Promise<string[]> => {
  const branches = await prisma.branch.findMany({
    select: { name: true },
  });
  const unique = new Set(branches.map((b) => b.name));
  return Array.from(unique).sort((a, b) => a.localeCompare(b));
});

export const getBranchesForEmail = cache(async (email: string | null | undefined): Promise<string[]> => {
  if (!email) return getAllBranches();

  const domain = email.toLowerCase().split('@')[1] || '';
  if (!domain) return getAllBranches();

  const colleges = await prisma.college.findMany({
    select: { domain: true, branches: { select: { name: true } } },
  });

  const matched = colleges.find(
    (c) => domain === c.domain || domain.endsWith(`.${c.domain}`)
  );

  if (!matched) return getAllBranches();

  return matched.branches
    .map((b) => b.name)
    .sort((a, b) => a.localeCompare(b));
});

/**
 * Looks up a branch's short code by its full name, across all colleges.
 * Mirrors the old `BRANCH_CODE_MAP[name]` lookup.
 */
export const getBranchCode = cache(async (branchName: string): Promise<string | null> => {
  const branch = await prisma.branch.findFirst({
    where: { name: branchName },
    select: { code: true },
  });
  return branch?.code ?? null;
});

/**
 * Full branch-name → code map across all colleges. Used where the UI needs
 * to resolve many branch names at once (e.g. leaderboard rows, PYQ filters).
 * Mirrors the old `BRANCH_CODE_MAP` export.
 */
export const getBranchCodeMap = cache(async (): Promise<Record<string, string>> => {
  const branches = await prisma.branch.findMany({
    select: { name: true, code: true },
  });
  const map: Record<string, string> = {};
  for (const b of branches) {
    map[b.name] = b.code;
  }
  return map;
});
