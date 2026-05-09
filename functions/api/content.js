export async function onRequestGet({ env }) {
  if (!env.CONTENT_DB) {
    return Response.json({ content: null, source: 'missing-d1-binding' }, { status: 200 });
  }

  try {
    await env.CONTENT_DB.prepare(
      'CREATE TABLE IF NOT EXISTS cms_content (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)'
    ).run();

    const row = await env.CONTENT_DB.prepare('SELECT value, updated_at FROM cms_content WHERE key = ?')
      .bind('homepage')
      .first();

    if (!row) {
      return Response.json({ content: null, source: 'empty' }, { status: 200 });
    }

    return Response.json({
      content: JSON.parse(row.value),
      updatedAt: row.updated_at,
      source: 'd1'
    });
  } catch (error) {
    return Response.json(
      {
        content: null,
        error: error instanceof Error ? error.message : 'Unable to load content.'
      },
      { status: 500 }
    );
  }
}
