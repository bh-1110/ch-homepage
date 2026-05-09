function renderCallback(status, content) {
  const message = JSON.stringify(content);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>GitHub authentication</title>
  </head>
  <body>
    <p>Completing GitHub authentication...</p>
    <script>
      window.opener.postMessage(
        'authorization:github:${status}:${message}',
        '*'
      );
      window.close();
    </script>
  </body>
</html>`;
}

function readCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

export async function onRequest({ env, request }) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response('GitHub OAuth environment variables are not configured.', { status: 500 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expectedState = readCookie(request, 'cms_oauth_state');

  if (!code) {
    return new Response(renderCallback('error', { error: 'Missing GitHub OAuth code.' }), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  if (!state || state !== expectedState) {
    return new Response(renderCallback('error', { error: 'Invalid GitHub OAuth state.' }), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'ch-homepage-decap-cms'
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/api/callback`
    })
  });

  const result = await response.json();

  if (!response.ok || result.error) {
    return new Response(renderCallback('error', result), {
      status: 401,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Set-Cookie': 'cms_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
      }
    });
  }

  return new Response(renderCallback('success', { token: result.access_token, provider: 'github' }), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': 'cms_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
    }
  });
}
