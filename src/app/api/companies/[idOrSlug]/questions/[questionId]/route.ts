import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { deleteCache } from "@/lib/cache";
import {
  companyQuestionParamsSchema,
  upsertCompanyQuestionBodySchema,
} from "@/lib/validation/api.validation";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string; questionId: string }> }
) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;

  const resolvedParams = await params;
  const paramsParsed = await companyQuestionParamsSchema.safeParseAsync({
    companyId: resolvedParams.idOrSlug,
    questionId: resolvedParams.questionId,
  });
  if (!paramsParsed.success) {
    return NextResponse.json({ error: paramsParsed.error.format() }, { status: 422 });
  }
  const { companyId, questionId } = paramsParsed.data;

  const body = await req.json().catch(() => ({}));
  const bodyParsed = await upsertCompanyQuestionBodySchema.safeParseAsync(body);
  if (!bodyParsed.success) {
    return NextResponse.json({ error: bodyParsed.error.format() }, { status: 422 });
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { slug: true },
  });

  const record = await prisma.companyQuestion.upsert({
    where: {
      companyId_questionId: { companyId, questionId },
    },
    create: { companyId, questionId, ...bodyParsed.data },
    update: { ...bodyParsed.data },
    select: {
      companyId: true,
      questionId: true,
      frequency: true,
      solved: true,
      order: true,
    },
  });

  if (company?.slug) {
    await deleteCache(`companyQuestions:${company.slug}`);
  }

  return NextResponse.json({ companyQuestion: record }, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string; questionId: string }> }
) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;

  const resolvedParams = await params;
  const paramsParsed = await companyQuestionParamsSchema.safeParseAsync({
    companyId: resolvedParams.idOrSlug,
    questionId: resolvedParams.questionId,
  });
  if (!paramsParsed.success) {
    return NextResponse.json({ error: paramsParsed.error.format() }, { status: 422 });
  }
  const { companyId, questionId } = paramsParsed.data;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { slug: true },
  });

  await prisma.companyQuestion.delete({
    where: {
      companyId_questionId: { companyId, questionId },
    },
  });

  if (company?.slug) {
    await deleteCache(`companyQuestions:${company.slug}`);
  }

  return new NextResponse(null, { status: 204 });
}
