import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { companyIdParamSchema, createInterviewSetBodySchema } from "@/lib/validation/api.validation";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  const resolvedParams = await params;
  const parsed = await companyIdParamSchema.safeParseAsync({ companyId: resolvedParams.idOrSlug });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }
  const { companyId } = parsed.data;

  const sets = await prisma.interviewSet.findMany({
    where: { companyId },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      companyId: true,
      name: true,
      tag: true,
      lastUpdated: true,
      easyCount: true,
      easyTotal: true,
      mediumCount: true,
      mediumTotal: true,
      hardCount: true,
      hardTotal: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ interviewSets: sets }, { status: 200 });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;

  const resolvedParams = await params;
  const paramsParsed = await companyIdParamSchema.safeParseAsync({ companyId: resolvedParams.idOrSlug });
  if (!paramsParsed.success) {
    return NextResponse.json({ error: paramsParsed.error.format() }, { status: 422 });
  }
  const { companyId } = paramsParsed.data;

  const body = await req.json().catch(() => ({}));
  const bodyParsed = await createInterviewSetBodySchema.safeParseAsync(body);
  if (!bodyParsed.success) {
    return NextResponse.json({ error: bodyParsed.error.format() }, { status: 422 });
  }

  const created = await prisma.interviewSet.create({
    data: { companyId, ...bodyParsed.data },
    select: {
      id: true,
      companyId: true,
      name: true,
      tag: true,
      lastUpdated: true,
      easyCount: true,
      easyTotal: true,
      mediumCount: true,
      mediumTotal: true,
      hardCount: true,
      hardTotal: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ interviewSet: created }, { status: 201 });
}
