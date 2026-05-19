# Brevo Keepalive Worker

This Cloudflare Worker sends one monthly technical test email through Brevo so the API key is not left unused.

The cron schedule is configured in `wrangler.toml`:

```toml
crons = ["0 9 1 * *"]
```

That means the Worker runs on the first day of every month at 09:00 UTC.

## Required secret

Set the Brevo key as a Worker secret before deploying:

```powershell
npx wrangler secret put BREVO_API_KEY --config workers/brevo-keepalive/wrangler.toml
```

The Brevo key must be set for this Worker separately. Cloudflare Pages environment variables are not automatically shared with standalone Workers.

## Deploy

```powershell
npm run deploy:brevo-keepalive
```

## Manual health check

The Worker exposes `/health`, which reports whether the keepalive is enabled. It does not send an email.
