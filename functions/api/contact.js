const MAX_FIELD_LENGTH = 4000;

function clean(value) {
  return String(value ?? '').trim().slice(0, MAX_FIELD_LENGTH);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value));
}

function isPlausiblePhone(value) {
  const trimmed = clean(value);

  if (!trimmed) return false;
  if (!/^\+?[0-9][0-9\s()./-]*$/.test(trimmed)) return false;

  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function parseAddress(value, fallbackEmail, fallbackName) {
  const raw = clean(value);
  const match = raw.match(/^(.*?)<([^>]+)>$/);

  if (match) {
    return {
      name: clean(match[1]).replace(/^"|"$/g, '') || fallbackName,
      email: clean(match[2])
    };
  }

  return {
    name: fallbackName,
    email: raw || fallbackEmail
  };
}

function parseRecipients(value, fallbackEmail) {
  return String(value || fallbackEmail)
    .split(',')
    .map((email) => clean(email))
    .filter(Boolean)
    .map((email) => ({ email }));
}

async function loadCmsContact(env) {
  if (!env.CONTENT_DB) return null;

  try {
    const row = await env.CONTENT_DB.prepare('SELECT value FROM cms_content WHERE key = ?')
      .bind('homepage')
      .first();

    if (!row?.value) return null;

    const content = JSON.parse(row.value);
    return content?.contact && typeof content.contact === 'object' ? content.contact : null;
  } catch (error) {
    console.error('Unable to load CMS contact settings', error);
    return null;
  }
}

function buildMessage({ name, phone, email, message, url }) {
  return [
    'Neue Anfrage über das Kontaktformular.',
    '',
    `Name: ${name}`,
    `Telefon: ${phone || '-'}`,
    `E-Mail: ${email}`,
    '',
    'Nachricht:',
    message,
    '',
    `Quelle: ${url}`
  ].join('\n');
}

async function readBrevoResponse(response) {
  const text = await response.text().catch(() => '');

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function onRequestPost({ env, request }) {
  const formData = await request.formData();
  const name = clean(formData.get('name'));
  const phone = clean(formData.get('phone'));
  const email = clean(formData.get('email'));
  const message = clean(formData.get('message'));
  const privacy = formData.get('privacy');

  if (!name || !message || !privacy) {
    return Response.json({ error: 'Bitte füllen Sie alle Pflichtfelder aus.' }, { status: 400 });
  }

  if (!email && !phone) {
    return Response.json({ error: 'Bitte geben Sie eine Telefonnummer oder E-Mail-Adresse ein.' }, { status: 400 });
  }

  if (email && !isEmail(email)) {
    return Response.json({ error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' }, { status: 400 });
  }

  if (phone && !isPlausiblePhone(phone)) {
    return Response.json({ error: 'Bitte geben Sie eine plausible Telefonnummer ein.' }, { status: 400 });
  }

  const brevoApiKey = env.BREVO_API_KEY || env.SENDINBLUE_API_KEY;

  if (!brevoApiKey) {
    return Response.json({ error: 'Mailversand ist nicht konfiguriert.' }, { status: 503 });
  }

  const cmsContact = await loadCmsContact(env);
  const to = parseRecipients(cmsContact?.contactFormRecipient || env.CONTACT_FORM_TO, 'mail@christelhable.com');
  const sender = parseAddress(
    cmsContact?.contactFormSender || env.CONTACT_FORM_FROM,
    'kontakt@christelhable.com',
    'Kontaktformular'
  );
  const subject = cmsContact?.contactFormSubject || env.CONTACT_FORM_SUBJECT || 'Neue Anfrage über das Kontaktformular';
  const textContent = buildMessage({ name, phone, email, message, url: request.url });

  if (!isEmail(sender.email) || to.length === 0 || !to.every((recipient) => isEmail(recipient.email))) {
    return Response.json({ error: 'Mailversand ist falsch konfiguriert.' }, { status: 503 });
  }

  const emailPayload = {
    sender,
    to,
    subject,
    textContent,
    ...(email ? { replyTo: { email, name } } : {})
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': brevoApiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify(emailPayload)
  });

  const responseBody = await readBrevoResponse(response);

  if (!response.ok) {
    const brevoCode = responseBody?.code;
    const brevoMessage = responseBody?.message;

    console.error(
      'Brevo mail failed',
      JSON.stringify({
        status: response.status,
        code: brevoCode,
        message: brevoMessage
      })
    );

    return Response.json(
      {
        error: 'Mailversand ist fehlgeschlagen.',
        provider: 'brevo',
        providerStatus: response.status,
        providerCode: brevoCode,
        providerMessage: brevoMessage
      },
      { status: 502 }
    );
  }

  return Response.json({
    ok: true,
    provider: 'brevo',
    providerStatus: response.status,
    messageId: responseBody?.messageId ?? null
  });
}
