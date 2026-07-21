'use client';

import { useEffect, useState } from 'react';
import { collegeService } from '@/services';

interface BranchesResponse {
  branches: string[];
}

/**
 * Client-side counterpart to the old (removed) `getBranchesForEmail`
 * constant helper. The branch data now lives in the DB, so this fetches it
 * from `GET /api/colleges/branches` — keyed off the already-known user
 * email (not user-typed input), so a single fetch per email is fine.
 */
export function useBranchesForEmail(email: string | null | undefined): string[] {
  const [branches, setBranches] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    collegeService
      .getBranchesForEmail(email)
      .then((res) => {
        if (!active) return;
        const data = res as unknown as BranchesResponse;
        setBranches(data?.branches ?? []);
      })
      .catch((err) => {
        console.error('Failed to fetch branches:', err);
      });
    return () => {
      active = false;
    };
  }, [email]);

  return branches;
}
