import type { Metadata } from 'next';
import { Suspense } from 'react';
import { buildMetadata } from '@/components/common';
import { breadcrumbSchema } from '@/config/seo';
import { QuestionsListPage } from '@/components/questions/QuestionsListPage';

export const metadata: Metadata = buildMetadata({
  title: 'DSA Questions Bank',
  description: 'Browse and filter thousands of DSA questions from LeetCode, Codeforces, CodeChef and GFG. Filter by difficulty, topic, and company.',
  path: '/questions',
});

const jsonLd = breadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Questions', path: '/questions' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Suspense fallback={null}>
        <QuestionsListPage />
      </Suspense>
    </>
  );
}
