import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { sheetSlugParamSchema } from "@/lib/validation/api.validation";

type SectionNode = {
  id: string;
  title: string;
  order: number;
  problems: any[];
  children: SectionNode[];
  total?: number;
  solved?: number;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rawParams = await params;
  const parsedParams = await sheetSlugParamSchema.safeParseAsync(rawParams);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.format() }, { status: 422 });
  }
  const { slug } = parsedParams.data;

  const user = getUserFromRequest(req);
  const userId = user?.userId ?? null;

  const sheet = await prisma.sheet.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      author: true,
      sourceUrl: true,
      coverImage: true,
      totalProblems: true,
      sections: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          parentId: true,
        },
      },
      problems: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          sectionId: true,
          title: true,
          order: true,
          difficulty: true,
          articleUrl: true,
          youtubeUrl: true,
          practiceUrl: true,
          plusUrl: true,
          editorialUrl: true,
          questionId: true,
        },
      },
    },
  });

  if (!sheet) return NextResponse.json({ error: "Sheet not found" }, { status: 404 });

  let progressByProblem: Record<string, { status: string; starred: boolean; note: string | null }> = {};
  if (userId) {
    const progress = await prisma.userSheetProblem.findMany({
      where: { userId, sheetProblem: { sheetId: sheet.id } },
      select: {
        sheetProblemId: true,
        status: true,
        starred: true,
        note: true,
      },
    });
    progressByProblem = progress.reduce((acc: Record<string, any>, p) => {
      acc[p.sheetProblemId] = p;
      return acc;
    }, {});
  }

  const problemsBySection: Record<string, any[]> = {};
  for (const p of sheet.problems) {
    const prog = progressByProblem[p.id];
    const merged = {
      ...p,
      status: prog?.status ?? "UNSOLVED",
      starred: prog?.starred ?? false,
      note: prog?.note ?? null,
    };
    (problemsBySection[p.sectionId] ||= []).push(merged);
  }

  const nodeById: Record<string, SectionNode> = {};
  for (const s of sheet.sections) {
    nodeById[s.id] = {
      id: s.id,
      title: s.title,
      order: s.order,
      problems: problemsBySection[s.id] || [],
      children: [],
    };
  }
  const roots: SectionNode[] = [];
  for (const s of sheet.sections) {
    const node = nodeById[s.id];
    if (s.parentId && nodeById[s.parentId]) {
      nodeById[s.parentId].children.push(node);
    } else {
      roots.push(node);
    }
  }

  const computeCounts = (node: SectionNode): { total: number; solved: number } => {
    let total = node.problems.length;
    let solved = node.problems.filter((p) => p.status === "SOLVED").length;
    for (const child of node.children) {
      const c = computeCounts(child);
      total += c.total;
      solved += c.solved;
    }
    node.total = total;
    node.solved = solved;
    return { total, solved };
  };
  roots.forEach(computeCounts);

  const solvedCount = roots.reduce((acc, r) => acc + (r.solved ?? 0), 0);

  const { sections, problems, ...meta } = sheet;

  return NextResponse.json(
    {
      sheet: {
        ...meta,
        solvedCount,
        sections: roots,
      },
    },
    { status: 200 }
  );
}
