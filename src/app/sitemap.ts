import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { absoluteUrl } from '@/config/seo';
import { getAllQuestionSlugs } from '@/lib/questions';

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/login', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/register', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/leaderboard', priority: 0.7, changeFrequency: 'daily' },
  { path: '/questions', priority: 0.9, changeFrequency: 'daily' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [questions, users] = await Promise.all([
    getAllQuestionSlugs(),
    prisma.user.findMany({
      select: { userName: true, updatedAt: true },
    }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const questionEntries: MetadataRoute.Sitemap = questions.map((q) => ({
    url: absoluteUrl(`/questions/${q.slug}`),
    lastModified: q.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const profileEntries: MetadataRoute.Sitemap = users.map((u) => ({
    url: absoluteUrl(`/profile/${u.userName}`),
    lastModified: u.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.4,
  }));

  return [...staticEntries, ...questionEntries, ...profileEntries];
}
