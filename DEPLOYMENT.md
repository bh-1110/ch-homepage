# Deployment

## GitHub

Use two branches:

- `main`: production
- `test`: test/preview version

Cloudflare Pages can build production from `main` and preview deployments from `test`.

If the repository does not exist yet, create an empty GitHub repository and connect it:

```powershell
git remote add origin https://github.com/OWNER/REPOSITORY.git
git push -u origin main
git push -u origin test
```

## Cloudflare Pages

Project settings:

- Framework preset: `Next.js`
- Build command: `npm run build`
- Build output directory: `out`
- Production branch: `main`
- Root directory: repository root

Environment variables:

- `CMS_USER`: username for `/admin`
- `CMS_PASSWORD`: password for `/admin`
- `BREVO_API_KEY`: Brevo API key used by `/api/contact` to send contact form emails
- `CONTACT_FORM_FROM`: Brevo-verified sender address, for example `Kontaktformular <kontakt@christelhable.com>`
- `CONTACT_FORM_TO`: recipient address for contact form emails, for example `mail@christelhable.com`
- `CONTACT_FORM_SUBJECT`: optional subject for contact form emails

Set these for production and preview environments.

## Local development

Do not commit API keys. Local secret files are ignored by Git.

For local Cloudflare Pages Functions tests, create `.dev.vars` in the project root:

```env
BREVO_API_KEY=your-local-brevo-api-key
CONTACT_FORM_FROM=Kontaktformular <kontakt@christelhable.com>
CONTACT_FORM_TO=mail@christelhable.com
CONTACT_FORM_SUBJECT=Neue Anfrage über das Kontaktformular
```

`npm run dev` starts the Next.js development server only. It does not execute the Cloudflare Pages Functions in `functions/`. To test `/api/contact` locally with the real Brevo request, run the site through Cloudflare Pages local development instead of plain Next.js dev.

The CMS fields `Formular-Absender`, `Formular-Empfänger`, and `Formular-Betreff` are used by `/api/contact` when `CONTENT_DB` is available. Without a local D1 binding, the function falls back to the `.dev.vars` values above.

## Runtime CMS

The `/admin` area edits homepage content at runtime and stores it in Cloudflare D1.

Create a D1 database in Cloudflare and bind it to the Pages project:

- Binding name: `CONTENT_DB`
- Database: choose the D1 database created for this site

Set the binding for production and preview environments if both should support CMS editing.

The first admin save creates the required `cms_content` table automatically.
