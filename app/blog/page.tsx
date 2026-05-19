import { getAllPosts } from '../../lib/blog';
import { BlogIndexClient } from './BlogIndexClient';

export const metadata = {
  title: 'Blog',
  description: 'Gedanken und Impulse zu Psychotherapie, Mentalcoaching und persönlicher Entwicklung in Wien.',
  alternates: {
    canonical: '/blog'
  }
};

export default function BlogPage() {
  const posts = getAllPosts();

  return <BlogIndexClient posts={posts.map(({ content, html, ...post }) => post)} />;
}
