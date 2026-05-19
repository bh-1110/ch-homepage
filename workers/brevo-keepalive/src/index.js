const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

function getRequiredEnv(env, key) {
  const value = env[key];

  if (!value) {
    throw new Error(`${key} is not configured.`);
  }

  return value;
}

function buildPayload(env) {
  const senderEmail = getRequiredEnv(env, 'KEEPALIVE_SENDER_EMAIL');
  const recipientEmail = getRequiredEnv(env, 'KEEPALIVE_RECIPIENT_EMAIL');

  return {
    sender: {
      name: env.KEEPALIVE_SENDER_NAME || 'christelhable.com Technik',
      email: senderEmail
    },
    to: [{ email: recipientEmail }],
    subject: env.KEEPALIVE_SUBJECT || 'Monatlicher Brevo-Test christelhable.com',
    textContent:
      env.KEEPALIVE_TEXT ||
      'Automatischer monatlicher Test, damit der Brevo API-Key aktiv bleibt.'
  };
}

async function sendKeepalive(env) {
  if (env.KEEPALIVE_ENABLED === 'false') {
    return { skipped: true, reason: 'KEEPALIVE_ENABLED=false' };
  }

  const response = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': getRequiredEnv(env, 'BREVO_API_KEY'),
      'content-type': 'application/json'
    },
    body: JSON.stringify(buildPayload(env))
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Brevo keepalive failed: ${response.status} ${details.slice(0, 500)}`);
  }

  return { ok: true };
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendKeepalive(env));
  },

  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== '/health') {
      return new Response('Not found', { status: 404 });
    }

    return Response.json({
      ok: true,
      enabled: env.KEEPALIVE_ENABLED !== 'false'
    });
  }
};
