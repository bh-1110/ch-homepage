import { getAllPosts } from '../../lib/blog';
import { BlogIndexClient } from './BlogIndexClient';

export const metadata = {
  title: 'Blog | Psychotherapie in Wien',
  description: 'Gedanken und Impulse aus der psychotherapeutischen Praxis in Wien.'
};

export default function BlogPage() {
  const posts = getAllPosts();

  return <BlogIndexClient posts={posts.map(({ content, html, ...post }) => post)} />;
}
