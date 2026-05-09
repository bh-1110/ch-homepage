export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (!url.pathname.startsWith('/admin') && !url.pathname.startsWith('/api/admin')) {
    return context.next();
  }

  const username = context.env.CMS_USER;
  const password = context.env.CMS_PASSWORD;

  if (!username || !password) {
    return new Response('CMS password protection is not configured.', { status: 503 });
  }

  const authorization = context.request.headers.get('Authorization') || '';
  const [scheme, encoded] = authorization.split(' ');

  if (scheme === 'Basic' && encoded) {
    const [providedUser, providedPassword] = atob(encoded).split(':');

    if (providedUser === username && providedPassword === password) {
      return context.next();
    }
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Decap CMS", charset="UTF-8"'
    }
  });
}
