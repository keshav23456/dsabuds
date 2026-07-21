import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildMetadata } from '@/components/common';
import { breadcrumbSchema } from '@/config/seo';
import { QuestionDetailPage } from '@/components/questions/QuestionDetailPage';
import { getQuestionBySlug, getQuestionSlugsForStaticGeneration } from '@/lib/questions';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Editable post-publish via PATCH /api/questions/[idOrSlug], so not fully static.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const questions = await getQuestionSlugsForStaticGeneration();
  return questions.map((q) => ({ slug: q.slug as string }));
}

function questionDescription(question: NonNullable<Awaited<ReturnType<typeof getQuestionBySlug>>>): string {
  if (question.statement) {
    const plain = question.statement.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (plain) return plain.length > 155 ? `${plain.slice(0, 152)}...` : plain;
  }
  const name = question.displayName || question.title;
  return `Solve "${name}" (${question.difficulty}) and track your progress on DSABuddy.`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const question = await getQuestionBySlug(slug);
  if (!question) {
    return buildMetadata({ title: 'Question not found', path: `/questions/${slug}`, noindex: true });
  }
  const title = question.displayName || question.title;
  return buildMetadata({
    title,
    description: questionDescription(question),
    path: `/questions/${slug}`,
    type: 'article',
  });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const question = await getQuestionBySlug(slug);
  if (!question) notFound();

  const breadcrumbs = breadcrumbSchema([
    { name: 'Questions', path: '/questions' },
    { name: question.displayName || question.title, path: `/questions/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <QuestionDetailPage slug={slug} question={question} />
    </>
  );
}
