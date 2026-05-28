# Viksphere Site

Personal site for viksphere.in — built with Next.js 16 (App Router), TypeScript, Tailwind CSS, PostgreSQL + Prisma, and Cloudflare R2 + Cloudinary for media storage.

## Local development (Docker — no host installs needed)

```bash
docker compose up --build
```

| Service | URL | Notes |
|---------|-----|-------|
| App | http://localhost:3000 | Next.js with hot-reload |
| Admin | http://localhost:3000/local_dev_secret_key/admin | user: `admin` / pass: `admin_local_password` |
| MinIO console | http://localhost:9001 | Credentials: `viksphere_dev` / `viksphere_dev_secret` |
| PostgreSQL | localhost:5433 | Via Prisma |

All services are defined in `docker-compose.yml`. Source code is volume-mounted so edits on the host trigger HMR inside the container. If code changes don't reflect after editing, run `docker restart viksphere-site-app-1` to force recompilation.

## Key directories

```
app/                  Next.js App Router pages and API routes
app/[secret]/admin/   Admin portal (secret segment from ADMIN_SECRET_KEY env var)
app/components/       Shared UI components
lib/                  Server-side helpers (S3/R2, session, image resolution)
data/                 Default JSON seed data (albums, posts, portfolio)
docs/                 Architecture and integration docs
prisma/               Prisma schema and migrations
```

## Production deployment

See [README-DEPLOY.md](README-DEPLOY.md).
