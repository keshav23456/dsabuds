import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getUserFromRequest } from "@/lib/auth";
import { listQuestionsQuerySchema, createQuestionBodySchema } from "@/lib/validation/api.validation";

export async function GET(req: NextRequest) {
  const query = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = await listQuestionsQuerySchema.safeParseAsync(query);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }
  const { q, difficulty, tag, take: takeParsed, skip: skipParsed } = parsed.data;
  const take = takeParsed ?? 50;
  const skip = skipParsed ?? 0;

  const userId = getUserFromRequest(req)?.userId ?? null;

  const where = {
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { displayName: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
  };

  const [questions, total] = await Promise.all([
    prisma.questionBank.findMany({
      where,
      take,
      skip,
      orderBy: [{ createdAt: "desc" }],
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
    }),
    prisma.questionBank.count({ where }),
  ]);

  return NextResponse.json(
    {
      questions,
      pagination: {
        total,
        take,
        skip,
        hasMore: skip + questions.length < total,
      },
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;

  const body = await req.json().catch(() => ({}));
  const parsed = await createQuestionBodySchema.safeParseAsync(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }
  const { tags, ...data } = parsed.data;

  const created = await prisma.questionBank.create({
    data: {
      ...data,
      tags: Array.isArray(tags) ? tags : [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    select: { id: true },
  });

  return NextResponse.json({ question: created }, { status: 201 });
}
