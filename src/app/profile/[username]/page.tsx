import type { Metadata } from 'next';
import { ProfilePage } from '@/components/profile/ProfilePage';
import { buildMetadata } from '@/components/common';
import { breadcrumbSchema } from '@/config/seo';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return buildMetadata({
    title: `@${username} — DSA Profile`,
    description: `View ${username}'s DSA practice profile on DSABuddy — combined stats, ratings, and streaks across LeetCode, Codeforces, CodeChef, and GeeksforGeeks.`,
    path: `/profile/${username}`,
    type: 'profile',
  });
}

export default async function Page({ params }: PageProps) {
  const { username } = await params;
  const breadcrumbs = breadcrumbSchema([
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: `@${username}`, path: `/profile/${username}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <ProfilePage username={username} />
    </>
  );
}
