import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { NextApiRequest, NextApiResponse } from 'next';

const homepagePath = join(process.cwd(), 'content', 'pages', 'homepage.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const host = req.headers.host ?? '';

  if (!host.startsWith('localhost:') && !host.startsWith('127.0.0.1:')) {
    res.status(403).json({ error: 'Local content editing is only available on localhost.' });
    return;
  }

  if (req.method === 'GET') {
    const content = JSON.parse(readFileSync(homepagePath, 'utf8'));
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({ content });
    return;
  }

  if (req.method === 'PUT') {
    const content = req.body?.content;

    if (!content || typeof content !== 'object' || Array.isArray(content)) {
      res.status(400).json({ error: 'Missing homepage content.' });
      return;
    }

    writeFileSync(homepagePath, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({ content, updatedAt: new Date().toISOString() });
    return;
  }

  res.setHeader('Allow', 'GET, PUT');
  res.status(405).json({ error: 'Method not allowed.' });
}
