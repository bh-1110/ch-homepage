export async function onRequest({ env, request }) {
  if (!env.GITHUB_CLIENT_ID) {
    return new Response('GITHUB_CLIENT_ID is not configured.', { status: 500 });
  }

  const url = new URL(request.url);
  const state = crypto.randomUUID();
  const redirectUrl = new URL('https://github.com/login/oauth/authorize');

  redirectUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  redirectUrl.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
  redirectUrl.searchParams.set('scope', 'repo user');
  redirectUrl.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectUrl.toString(),
      'Set-Cookie': `cms_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
    }
  });
}
