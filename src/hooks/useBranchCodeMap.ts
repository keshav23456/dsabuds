'use client';

import { useEffect, useState } from 'react';
import { collegeService } from '@/services';

interface BranchCodeMapResponse {
  branchCodeMap: Record<string, string>;
}

let branchCodeMapPromise: Promise<Record<string, string>> | null = null;

function fetchBranchCodeMap(): Promise<Record<string, string>> {
  if (!branchCodeMapPromise) {
    branchCodeMapPromise = collegeService
      .getBranchCodeMap()
      .then((res) => (res as unknown as BranchCodeMapResponse)?.branchCodeMap ?? {})
      .catch((err) => {
        console.error('Failed to fetch branch code map:', err);
        branchCodeMapPromise = null;
        return {};
      });
  }
  return branchCodeMapPromise;
}

export function useBranchCodeMap(): Record<string, string> {
  const [map, setMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    fetchBranchCodeMap().then((m) => {
      if (active) setMap(m);
    });
    return () => {
      active = false;
    };
  }, []);

  return map;
}
