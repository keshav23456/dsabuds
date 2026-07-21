import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { idParamSchema, updateInterviewSetBodySchema } from "@/lib/validation/api.validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;

  const resolvedParams = await params;
  const paramsParsed = await idParamSchema.safeParseAsync(resolvedParams);
  if (!paramsParsed.success) {
    return NextResponse.json({ error: paramsParsed.error.format() }, { status: 422 });
  }
  const { id } = paramsParsed.data;

  const body = await req.json().catch(() => ({}));
  const bodyParsed = await updateInterviewSetBodySchema.safeParseAsync(body);
  if (!bodyParsed.success) {
    return NextResponse.json({ error: bodyParsed.error.format() }, { status: 422 });
  }

  const updated = await prisma.interviewSet.update({
    where: { id },
    data: bodyParsed.data,
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
      updatedAt: true,
    },
  });

  return NextResponse.json({ interviewSet: updated }, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;

  const resolvedParams = await params;
  const paramsParsed = await idParamSchema.safeParseAsync(resolvedParams);
  if (!paramsParsed.success) {
    return NextResponse.json({ error: paramsParsed.error.format() }, { status: 422 });
  }
  const { id } = paramsParsed.data;

  await prisma.interviewSet.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
