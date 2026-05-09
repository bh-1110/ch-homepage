async function ensureTable(db) {
  await db
    .prepare('CREATE TABLE IF NOT EXISTS cms_content (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)')
    .run();
}

export async function onRequestGet({ env }) {
  if (!env.CONTENT_DB) {
    return Response.json({ error: 'CONTENT_DB binding is not configured.' }, { status: 500 });
  }

  await ensureTable(env.CONTENT_DB);

  const row = await env.CONTENT_DB.prepare('SELECT value, updated_at FROM cms_content WHERE key = ?')
    .bind('homepage')
    .first();

  return Response.json({
    content: row ? JSON.parse(row.value) : null,
    updatedAt: row?.updated_at ?? null
  });
}

export async function onRequestPut({ env, request }) {
  if (!env.CONTENT_DB) {
    return Response.json({ error: 'CONTENT_DB binding is not configured.' }, { status: 500 });
  }

  const payload = await request.json();

  if (!payload || typeof payload !== 'object' || !payload.content) {
    return Response.json({ error: 'Request body must include content.' }, { status: 400 });
  }

  const value = JSON.stringify(payload.content);
  const updatedAt = new Date().toISOString();

  await ensureTable(env.CONTENT_DB);
  await env.CONTENT_DB.prepare(
    'INSERT INTO cms_content (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at'
  )
    .bind('homepage', value, updatedAt)
    .run();

  return Response.json({ ok: true, updatedAt });
}
