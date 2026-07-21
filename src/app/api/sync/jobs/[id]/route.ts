import { NextRequest, NextResponse } from "next/server";
import { idParamSchema } from "@/lib/validation/api.validation";
import { syncJobs } from "@/lib/syncJobs";
import { requireSyncSecret } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireSyncSecret(req);
  if (authError) return authError;

  const { id } = await params;
  const validationResult = idParamSchema.safeParse({ id });
  if (!validationResult.success) {
    return NextResponse.json({ error: validationResult.error.format() }, { status: 400 });
  }

  const job = syncJobs.get(validationResult.data.id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ job }, { status: 200 });
}
