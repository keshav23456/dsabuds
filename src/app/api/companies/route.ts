import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getCache, setCache, deleteCacheByPattern } from "@/lib/cache";
import { listCompaniesQuerySchema, createCompanyBodySchema } from "@/lib/validation/api.validation";

const DEFAULT_ELIGIBLE_BRANCHES = ["cs", "it", "ece", "mac"];

interface CompaniesWhereInput {
  search?: string;
  branch?: string;
  cgpa?: number;
}

const buildCompaniesWhere = ({ search, branch, cgpa }: CompaniesWhereInput) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const andFilters: any[] = [
    {
      OR: [{ questionCount: { gt: 0 } }, { roundsInfo: { not: null } }],
    },
  ];

  if (search) {
    andFilters.push({ name: { contains: search, mode: "insensitive" } });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const placementConditions: any[] = [];

  if (branch && branch !== "all") {
    const targetCode = branch.toLowerCase();
    placementConditions.push({
      OR: [{ eligibleBranches: { has: targetCode } }, { eligibleBranches: { has: "all" } }],
    });
  }

  if (cgpa !== undefined) {
    placementConditions.push({
      OR: [{ minCgpa: { lte: cgpa } }, { minCgpa: null }],
    });
  }

  if (placementConditions.length > 0) {
    const somePlacement = {
      placements: {
        some: { AND: placementConditions },
      },
    };

    let allowNoPlacements = false;
    if (branch && branch !== "all") {
      const targetCode = branch.toLowerCase();
      if (DEFAULT_ELIGIBLE_BRANCHES.includes(targetCode)) {
        allowNoPlacements = true;
      }
    } else {
      allowNoPlacements = true;
    }

    if (allowNoPlacements) {
      andFilters.push({ OR: [somePlacement, { placements: { none: {} } }] });
    } else {
      andFilters.push(somePlacement);
    }
  }

  return { AND: andFilters };
};

export async function GET(req: NextRequest) {
  const query = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = await listCompaniesQuerySchema.safeParseAsync(query);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }
  const { take: takeParsed, skip: skipParsed, search, branch, cgpa } = parsed.data;
  const take = takeParsed ?? 12;
  const skip = skipParsed ?? 0;

  const cacheKey = `companies:${take}:${skip}:${search ?? ""}:${branch ?? ""}:${cgpa ?? ""}`;

  const cachedCompanies = await getCache<Record<string, unknown>>(cacheKey);
  if (cachedCompanies) {
    return NextResponse.json(cachedCompanies, { status: 200 });
  }

  const where = buildCompaniesWhere({ search, branch, cgpa });

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      take,
      skip,
      where,
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        questionCount: true,
        logoUrl: true,
        placements: {
          select: { eligibleBranches: true, minCgpa: true },
        },
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.company.count({ where }),
  ]);

  const response = { companies, total, take, skip };

  await setCache(cacheKey, response, 300);

  return NextResponse.json(response, { status: 200 });
}

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;

  const body = await req.json().catch(() => ({}));
  const parsed = await createCompanyBodySchema.safeParseAsync(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }

  const company = await prisma.company.create({
    data: parsed.data,
    select: {
      id: true,
      name: true,
      slug: true,
      questionCount: true,
      logoUrl: true,
      createdAt: true,
    },
  });

  await deleteCacheByPattern("companies:*");
  return NextResponse.json({ company }, { status: 201 });
}
