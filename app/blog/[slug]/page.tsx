import { getAllPosts, getPostBySlug } from '../../../lib/blog';
import { BlogPostClient } from './BlogPostClient';

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return {
    title: `${post.title} | Psychotherapie in Wien`,
    description: post.excerpt
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return <BlogPostClient post={post} />;
}
