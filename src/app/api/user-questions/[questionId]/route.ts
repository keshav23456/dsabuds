import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { recalculateUserPoints } from "@/lib/points";
import {
  userQuestionIdParamSchema,
  upsertUserQuestionBodySchema,
} from "@/lib/validation/api.validation";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const userId = authResult.user.userId;

  const rawParams = await params;
  const parsedParams = await userQuestionIdParamSchema.safeParseAsync(rawParams);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.format() }, { status: 422 });
  }

  const body = await req.json().catch(() => ({}));
  const parsedBody = await upsertUserQuestionBodySchema.safeParseAsync(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.format() }, { status: 422 });
  }

  const { questionId } = parsedParams.data;
  const { status } = parsedBody.data;

  const solvedAt = status === "SOLVED" ? new Date() : null;

  const record = await prisma.userQuestionBank.upsert({
    where: {
      userId_questionId: { userId, questionId },
    },
    create: { userId, questionId, status, solvedAt },
    update: { status, solvedAt },
    select: {
      userId: true,
      questionId: true,
      status: true,
      solvedAt: true,
      updatedAt: true,
    },
  });

  await recalculateUserPoints(userId);
  return NextResponse.json({ userQuestion: record }, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const userId = authResult.user.userId;

  const rawParams = await params;
  const parsedParams = await userQuestionIdParamSchema.safeParseAsync(rawParams);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.format() }, { status: 422 });
  }

  const { questionId } = parsedParams.data;
  await prisma.userQuestionBank.delete({
    where: { userId_questionId: { userId, questionId } },
  });

  await recalculateUserPoints(userId);
  return new NextResponse(null, { status: 204 });
}
