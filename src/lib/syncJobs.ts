export interface SyncJob {
  id: string;
  status: "running" | "completed" | "failed";
  startedAt: Date;
  finishedAt: Date | null;
  params: {
    platforms: string[];
    tags: string[];
    dryRun: boolean;
    maxItems: number;
  };
  result: unknown;
  error: string | null;
}

const globalForSyncJobs = globalThis as unknown as {
  syncJobs: Map<string, SyncJob> | undefined;
};

export const syncJobs = globalForSyncJobs.syncJobs ?? new Map<string, SyncJob>();

if (process.env.NODE_ENV !== "production") {
  globalForSyncJobs.syncJobs = syncJobs;
}
