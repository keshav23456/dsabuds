import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";
import { companySlugParamSchema } from "@/lib/validation/api.validation";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  const resolvedParams = await params;
  const parsed = await companySlugParamSchema.safeParseAsync({ slug: resolvedParams.idOrSlug });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }
  const { slug } = parsed.data;

  const cacheKey = `companyQuestions:${slug}`;

  const cachedQuestions = await getCache<Record<string, unknown>>(cacheKey);
  if (cachedQuestions) {
    return NextResponse.json(cachedQuestions, { status: 200 });
  }

  const company = await prisma.company.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const companyQuestions = await prisma.companyQuestion.findMany({
    where: { companyId: company.id },
    orderBy: [{ order: "asc" }],
    select: {
      companyId: true,
      questionId: true,
      frequency: true,
      solved: true,
      order: true,
      question: {
        select: {
          id: true,
          title: true,
          displayName: true,
          difficulty: true,
          leetcodeUrl: true,
          tags: true,
        },
      },
    },
  });

  const response = { companyQuestions };

  await setCache(cacheKey, response, 300);

  return NextResponse.json(response, { status: 200 });
}
