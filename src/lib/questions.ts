import "server-only";
import { prisma } from "@/lib/prisma";

// Shared between generateStaticParams and the sitemap so they can't drift.
const PUBLISHED_QUESTION_WHERE = { slug: { not: null } } as const;

const STATIC_GENERATION_LIMIT = 500;

export async function getAllQuestionSlugs() {
  return prisma.questionBank.findMany({
    where: PUBLISHED_QUESTION_WHERE,
    select: { slug: true, updatedAt: true },
  });
}

// Bounded on purpose — prerendering the whole bank at build time doesn't scale;
// slugs outside this set fall back to on-demand ISR (dynamicParams in the page).
export async function getQuestionSlugsForStaticGeneration(limit = STATIC_GENERATION_LIMIT) {
  return prisma.questionBank.findMany({
    where: PUBLISHED_QUESTION_WHERE,
    select: { slug: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getQuestionBySlug(slug: string) {
  return prisma.questionBank.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      displayName: true,
      difficulty: true,
      leetcodeUrl: true,
      sourcePlatform: true,
      sourceId: true,
      sourceUrl: true,
      sourceRating: true,
      paidOnly: true,
      acceptanceRate: true,
      statement: true,
      examples: true,
      constraints: true,
      tags: true,
    },
  });
}

export type QuestionCore = NonNullable<Awaited<ReturnType<typeof getQuestionBySlug>>>;
