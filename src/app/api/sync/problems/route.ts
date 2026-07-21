import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncProblems } from "@/lib/ingestion";
import { syncProblemsBodySchema } from "@/lib/validation/api.validation";
import { syncJobs } from "@/lib/syncJobs";
import { requireSyncSecret } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const authError = requireSyncSecret(req);
  if (authError) return authError;

  const body = await req.json().catch(() => ({}));
  const validationResult = await syncProblemsBodySchema.safeParseAsync(body);
  if (!validationResult.success) {
    return NextResponse.json({ error: validationResult.error.format() }, { status: 400 });
  }

  const jobId = crypto.randomUUID();
  const platforms = validationResult.data.platforms ?? ["codeforces", "leetcode"];
  const tags = validationResult.data.tags ?? [];
  const dryRun = Boolean(validationResult.data.dryRun);
  const maxItems = Number(validationResult.data.maxItems ?? 200);

  syncJobs.set(jobId, {
    id: jobId,
    status: "running",
    startedAt: new Date(),
    finishedAt: null,
    params: { platforms, tags, dryRun, maxItems },
    result: null,
    error: null,
  });

  (async () => {
    try {
      const result = await syncProblems({
        prisma,
        platforms,
        tagSlugs: tags,
        maxItems,
        dryRun,
      });
      const job = syncJobs.get(jobId);
      if (job) {
        job.status = "completed";
        job.finishedAt = new Date();
        job.result = result;
      }
    } catch (err) {
      const job = syncJobs.get(jobId);
      if (job) {
        job.status = "failed";
        job.finishedAt = new Date();
        job.error = err instanceof Error ? err.message : String(err);
      }
    }
  })();

  return NextResponse.json({ jobId }, { status: 202 });
}
