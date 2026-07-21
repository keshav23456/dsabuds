import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createTagBodySchema } from "@/lib/validation/api.validation";

export async function GET() {
  const questions = await prisma.question.findMany({
    select: { tags: true },
  });

  const tagSet = new Set(questions.flatMap((q) => q.tags || []));
  const sortedTags = Array.from(tagSet)
    .sort()
    .map((name) => ({ id: name, name }));

  return NextResponse.json({ tags: sortedTags }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;

  const body = await req.json().catch(() => ({}));
  const parsed = await createTagBodySchema.safeParseAsync(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }

  const name = parsed.data.name || "";
  return NextResponse.json({ tag: { id: name, name } }, { status: 201 });
}
