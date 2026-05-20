import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/content', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ content: null, source: 'smoke-test' })
    });
  });
});

test('homepage renders primary content and contact anchors', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Mag. Christel Hable').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /Psychotherapie|Mental|Businesscoaching|Raum/i }).first()).toBeVisible();
  await expect(page.locator('#angebot')).toBeVisible();
  await expect(page.locator('#kontakt')).toBeVisible();
  await expect(page.locator('#kontaktformular')).toBeVisible();

  const mailLink = page.locator('a[href^="mailto:"]').first();
  const phoneLink = page.locator('a[href^="tel:"]').first();

  await expect(mailLink).toHaveAttribute('href', /mail@christelhable\.com/);
  await expect(phoneLink).toHaveAttribute('href', /tel:/);

  const mapLink = page.getByRole('link', { name: /Google Maps öffnen/i }).first();
  await expect(mapLink).toHaveAttribute('href', /google\.com\/maps/);
});

test('mobile navigation opens from burger menu', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile navigation is only visible on mobile viewports.');

  await page.goto('/');
  await page.getByRole('button', { name: /menü öffnen/i }).click();

  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Coaching' })).toBeVisible();
  await page.getByRole('link', { name: 'Kontakt' }).click();
  await expect(page.locator('#kontakt')).toBeInViewport();
});

test('contact form requires email or plausible phone and can submit through mocked endpoint', async ({ page }) => {
  await page.route('**/api/contact', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true })
    });
  });

  await page.goto('/#kontaktformular');

  const submit = page.getByRole('button', { name: /Anfrage senden/i });
  await expect(submit).toBeDisabled();

  const phoneInput = page.getByRole('textbox', { name: 'Telefon' });

  await phoneInput.fill('abc');
  await phoneInput.blur();
  await expect(page.getByText(/plausible Telefonnummer/i)).toBeVisible();
  await expect(submit).toBeDisabled();

  await phoneInput.fill('+49 30 1234567');
  await expect(submit).toBeEnabled();

  await page.getByRole('textbox', { name: 'Name' }).fill('Smoke Test');
  await page.getByRole('textbox', { name: 'Nachricht' }).fill('Automatischer Smoke-Test ohne echten Mailversand.');
  await page.getByLabel(/Ich bin einverstanden/i).check();
  await submit.click();

  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText(/Vielen Dank für Ihre Kontaktaufnahme/i)).toBeVisible();
  await page.getByRole('button', { name: 'Schließen' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('contact form shows provider errors from failed endpoint', async ({ page }) => {
  await page.route('**/api/contact', async (route) => {
    await route.fulfill({
      status: 502,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Mailversand ist fehlgeschlagen.',
        provider: 'brevo',
        providerStatus: 401,
        providerCode: 'unauthorized',
        providerMessage: 'Key not found'
      })
    });
  });

  await page.goto('/#kontaktformular');

  await page.getByRole('textbox', { name: 'Telefon' }).fill('+49 30 1234567');
  await page.getByRole('textbox', { name: 'Name' }).fill('Smoke Test');
  await page.getByRole('textbox', { name: 'Nachricht' }).fill('Automatischer Smoke-Test mit Fehlerantwort.');
  await page.getByLabel(/Ich bin einverstanden/i).check();
  await page.getByRole('button', { name: /Anfrage senden/i }).click();

  await expect(page.getByText(/HTTP-Status: 502/i)).toBeVisible();
  await expect(page.getByText(/Brevo-Status: 401/i)).toBeVisible();
  await expect(page.getByText(/Brevo-Code: unauthorized/i)).toBeVisible();
});

test('static support pages are reachable', async ({ page }) => {
  for (const path of ['/impressum', '/datenschutzerklaerung', '/blog', '/robots.txt', '/sitemap.xml']) {
    const response = await page.goto(path);
    expect(response?.ok(), `${path} should load`).toBeTruthy();
  }
});
