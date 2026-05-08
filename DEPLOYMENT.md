# Deployment

## GitHub

Use two branches:

- `main`: production
- `test`: test/preview version

Cloudflare Pages can build production from `main` and preview deployments from `test`.

## Cloudflare Pages

Project settings:

- Framework preset: `Next.js`
- Build command: `npm run build`
- Build output directory: `out`
- Production branch: `main`

Environment variables:

- `CMS_USER`: username for `/admin`
- `CMS_PASSWORD`: password for `/admin`

Set both for production and preview environments.

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
