export async function onRequest({ env, request }) {
  if (!env.GITHUB_CLIENT_ID) {
    return new Response('GITHUB_CLIENT_ID is not configured.', { status: 500 });
  }

  const url = new URL(request.url);
  const state = crypto.randomUUID();
  const redirectUrl = new URL('https://github.com/login/oauth/authorize');
  const scope = url.searchParams.get('scope') || 'repo user';

  redirectUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  redirectUrl.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
  redirectUrl.searchParams.set('scope', scope);
  redirectUrl.searchParams.set('state', state);

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>GitHub authentication</title>
  </head>
  <body>
    <p>Connecting to GitHub...</p>
    <script>
      const provider = 'github';
      const message = 'authorizing:' + provider;
      const authorizeUrl = ${JSON.stringify(redirectUrl.toString())};

      function redirectAfterHandshake(event) {
        if (event.origin !== window.location.origin || event.data !== message) {
          return;
        }

        window.removeEventListener('message', redirectAfterHandshake);
        window.location.href = authorizeUrl;
      }

      window.addEventListener('message', redirectAfterHandshake);

      if (window.opener) {
        window.opener.postMessage(message, window.location.origin);
      } else {
        window.location.href = authorizeUrl;
      }
    </script>
  </body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': `cms_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
    }
  });
}
