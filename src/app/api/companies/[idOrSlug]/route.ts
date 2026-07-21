import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getCache, setCache, deleteCache, deleteCacheByPattern } from "@/lib/cache";
import {
  companySlugParamSchema,
  idParamSchema,
  updateCompanyBodySchema,
} from "@/lib/validation/api.validation";

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

  const cacheKey = `company:${slug}`;

  const cachedCompany = await getCache<Record<string, unknown>>(cacheKey);
  if (cachedCompany) {
    return NextResponse.json(cachedCompany, { status: 200 });
  }

  const company = await prisma.company.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      questionCount: true,
      logoUrl: true,
      interviewSets: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
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
      },
      placements: {
        select: {
          role: true,
          ctcLpa: true,
          stipendMonth: true,
          type: true,
          category: true,
          eligibleBranches: true,
          minCgpa: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const response = { company };

  await setCache(cacheKey, response, 300);

  return NextResponse.json(response, { status: 200 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;

  const resolvedParams = await params;
  const paramsParsed = await idParamSchema.safeParseAsync({ id: resolvedParams.idOrSlug });
  if (!paramsParsed.success) {
    return NextResponse.json({ error: paramsParsed.error.format() }, { status: 422 });
  }
  const { id } = paramsParsed.data;

  const body = await req.json().catch(() => ({}));
  const bodyParsed = await updateCompanyBodySchema.safeParseAsync(body);
  if (!bodyParsed.success) {
    return NextResponse.json({ error: bodyParsed.error.format() }, { status: 422 });
  }

  const company = await prisma.company.update({
    where: { id },
    data: bodyParsed.data,
    select: {
      id: true,
      name: true,
      slug: true,
      questionCount: true,
      logoUrl: true,
      updatedAt: true,
    },
  });

  await deleteCacheByPattern("companies:*");
  await deleteCache(`company:${company.slug}`);
  return NextResponse.json({ company }, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;

  const resolvedParams = await params;
  const paramsParsed = await idParamSchema.safeParseAsync({ id: resolvedParams.idOrSlug });
  if (!paramsParsed.success) {
    return NextResponse.json({ error: paramsParsed.error.format() }, { status: 422 });
  }
  const { id } = paramsParsed.data;

  const existing = await prisma.company.findUnique({
    where: { id },
    select: { slug: true },
  });

  await prisma.company.delete({ where: { id } });

  await deleteCacheByPattern("companies:*");

  if (existing?.slug) {
    await deleteCache(`company:${existing.slug}`);
  }

  return new NextResponse(null, { status: 204 });
}
