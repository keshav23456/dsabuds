import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import {
  sheetProblemIdParamSchema,
  upsertSheetProgressBodySchema,
} from "@/lib/validation/api.validation";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ problemId: string }> }
) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const userId = authResult.user.userId;

  const rawParams = await params;
  const parsedParams = await sheetProblemIdParamSchema.safeParseAsync(rawParams);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.format() }, { status: 422 });
  }

  const body = await req.json().catch(() => ({}));
  const parsedBody = await upsertSheetProgressBodySchema.safeParseAsync(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.format() }, { status: 422 });
  }

  const { problemId } = parsedParams.data;
  const { status, starred, note } = parsedBody.data;

  const exists = await prisma.sheetProblem.findUnique({
    where: { id: problemId },
    select: { id: true },
  });
  if (!exists) return NextResponse.json({ error: "Sheet problem not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (status !== undefined) {
    data.status = status;
    data.solvedAt = status === "SOLVED" ? new Date() : null;
  }
  if (starred !== undefined) data.starred = starred;
  if (note !== undefined) data.note = note;

  const record = await prisma.userSheetProblem.upsert({
    where: { userId_sheetProblemId: { userId, sheetProblemId: problemId } },
    create: {
      userId,
      sheetProblemId: problemId,
      status: status ?? "UNSOLVED",
      starred: starred ?? false,
      note: note ?? null,
      solvedAt: status === "SOLVED" ? new Date() : null,
    },
    update: data,
    select: {
      sheetProblemId: true,
      status: true,
      starred: true,
      note: true,
      solvedAt: true,
    },
  });

  return NextResponse.json({ progress: record }, { status: 200 });
}
