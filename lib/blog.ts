import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  content: string;
  html: string;
};

const blogDirectory = join(process.cwd(), 'content', 'blog');

export function getAllPosts(): BlogPost[] {
  return readdirSync(blogDirectory)
    .filter((file) => file.endsWith('.md'))
    .map((file) => getPostBySlug(file.replace(/\.md$/, '')))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string): BlogPost {
  const fullPath = join(blogDirectory, `${slug}.md`);
  const file = readFileSync(fullPath, 'utf8');
  const { data, content } = parseFrontmatter(file);

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? '',
    excerpt: data.excerpt ?? '',
    category: data.category ?? 'Blog',
    content,
    html: markdownToHtml(content)
  };
}

function parseFrontmatter(file: string): { data: Record<string, string>; content: string } {
  const match = file.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

  if (!match) {
    return { data: {}, content: file.trim() };
  }

  const data = Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .map((line) => line.match(/^([^:]+):\s*"?([^"]*)"?\s*$/))
      .filter((line): line is RegExpMatchArray => Boolean(line))
      .map((line) => [line[1].trim(), line[2].trim()])
  );

  return { data, content: match[2].trim() };
}

function markdownToHtml(markdown: string): string {
  const blocks = markdown.split(/\n{2,}/);

  return blocks
    .map((block) => {
      const text = block.trim();

      if (text.startsWith('## ')) {
        return `<h2>${escapeHtml(text.slice(3))}</h2>`;
      }

      if (text.startsWith('# ')) {
        return `<h1>${escapeHtml(text.slice(2))}</h1>`;
      }

      if (/^- /.test(text)) {
        const items = text
          .split(/\r?\n/)
          .map((item) => `<li>${escapeHtml(item.replace(/^- /, ''))}</li>`)
          .join('');
        return `<ul>${items}</ul>`;
      }

      return `<p>${escapeHtml(text).replace(/\n/g, '<br />')}</p>`;
    })
    .join('\n');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
