import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getUserFromRequest } from "@/lib/auth";
import {
  questionSlugParamSchema,
  questionIdParamSchema,
  updateQuestionBodySchema,
} from "@/lib/validation/api.validation";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  const resolvedParams = await params;
  const parsed = await questionSlugParamSchema.safeParseAsync({ slug: resolvedParams.idOrSlug });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }
  const { slug } = parsed.data;

  const userId = getUserFromRequest(req)?.userId ?? null;

  const question = await prisma.questionBank.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      displayName: true,
      difficulty: true,
      leetcodeUrl: true,
      sourcePlatform: true,
      sourceId: true,
      sourceSlug: true,
      slug: true,
      sourceUrl: true,
      sourceRating: true,
      paidOnly: true,
      acceptanceRate: true,
      frequency: true,
      statement: true,
      examples: true,
      constraints: true,
      acceptedCount: true,
      submissionCount: true,
      tags: true,
      ...(userId
        ? {
            userStatuses: {
              where: { userId },
              select: { status: true, solvedAt: true, updatedAt: true },
            },
          }
        : {}),
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }
  return NextResponse.json({ question }, { status: 200 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;

  const resolvedParams = await params;
  const paramsParsed = await questionIdParamSchema.safeParseAsync({ id: resolvedParams.idOrSlug });
  if (!paramsParsed.success) {
    return NextResponse.json({ error: paramsParsed.error.format() }, { status: 422 });
  }
  const { id } = paramsParsed.data;

  const body = await req.json().catch(() => ({}));
  const bodyParsed = await updateQuestionBodySchema.safeParseAsync(body);
  if (!bodyParsed.success) {
    return NextResponse.json({ error: bodyParsed.error.format() }, { status: 422 });
  }
  const { tags, ...data } = bodyParsed.data;

  const updated = await prisma.questionBank.update({
    where: { id },
    data: {
      ...data,
      ...(Array.isArray(tags) ? { tags } : {}),
    },
    select: { id: true, updatedAt: true },
  });

  return NextResponse.json({ question: updated }, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;

  const resolvedParams = await params;
  const paramsParsed = await questionIdParamSchema.safeParseAsync({ id: resolvedParams.idOrSlug });
  if (!paramsParsed.success) {
    return NextResponse.json({ error: paramsParsed.error.format() }, { status: 422 });
  }
  const { id } = paramsParsed.data;

  await prisma.questionBank.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
