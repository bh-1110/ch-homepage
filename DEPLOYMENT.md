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

Set both for production and preview environments.

## Runtime CMS

The `/admin` area edits homepage content at runtime and stores it in Cloudflare D1.

Create a D1 database in Cloudflare and bind it to the Pages project:

- Binding name: `CONTENT_DB`
- Database: choose the D1 database created for this site

Set the binding for production and preview environments if both should support CMS editing.

The first admin save creates the required `cms_content` table automatically.
