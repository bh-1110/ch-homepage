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
- `GITHUB_CLIENT_ID`: GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth app client secret

Set both for production and preview environments.

## GitHub OAuth for Decap CMS

Decap CMS needs a GitHub OAuth app so it can write content changes back to this repository.

Create the OAuth app in GitHub:

- Application name: `ch-homepage CMS`
- Homepage URL: `https://ch-homepage.pages.dev`
- Authorization callback URL: `https://ch-homepage.pages.dev/api/callback`

Then add the app credentials to Cloudflare Pages environment variables:

- `GITHUB_CLIENT_ID`: text
- `GITHUB_CLIENT_SECRET`: secret

If the Cloudflare Pages project URL changes or a custom domain should be used for CMS login, update both the GitHub OAuth app URLs and `backend.site_domain` / `backend.base_url` in `public/admin/config.yml`.

## Decap CMS

Local editing works with:

```powershell
npm.cmd run dev
npm.cmd run cms
```

For online editing, Decap also needs GitHub authentication and a repository in `public/admin/config.yml`.
Use:

```yml
backend:
  name: github
  repo: OWNER/REPOSITORY
  branch: main
```

Everyone who edits content through Decap must have write access to the GitHub repository unless a separate OAuth/Open Authoring setup is added.

The current `local_backend: true` line may stay in the file; it only enables local editing when `npm.cmd run cms` is running.
