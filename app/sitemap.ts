import type { MetadataRoute } from 'next';
import { getAllPosts } from '../lib/blog';

const siteUrl = 'https://www.christelhable.com';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7
    },
    {
      url: `${siteUrl}/impressum`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2
    },
    {
      url: `${siteUrl}/datenschutzerklaerung`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2
    }
  ];

  const blogPages = getAllPosts().map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.6
  }));

  return [...staticPages, ...blogPages];
}
