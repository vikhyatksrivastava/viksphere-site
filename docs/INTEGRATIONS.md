# Integrations

## Storage — Cloudflare R2 (production) / MinIO (local dev)

Both use the `@aws-sdk/client-s3` SDK. The active backend is selected by `R2_ENDPOINT`:

| `R2_ENDPOINT` set? | Backend | Notes |
|--------------------|---------|-------|
| No (production) | Cloudflare R2 | Presigned URL redirect via `/api/r2` |
| Yes (Docker dev) | MinIO at that endpoint | Bytes streamed directly via `/api/r2` proxy |

**MinIO web console:** `http://localhost:9001` — credentials in `docker-compose.yml`.

Default bucket: `viksphere-images` (created automatically by the `minio-init` service on first start).

Data files (`albums.json`, `posts.json`, `portfolio.json`) are stored as objects in the bucket root.
Uploaded images land under `uploads/post-covers/`.

---

## Image uploads — Cloudinary (production) / MinIO (local dev)

`app/api/upload/route.ts` accepts `POST { dataUrl }` and selects the backend:

| `R2_ENDPOINT` set? | Backend used | Why |
|--------------------|-------------|-----|
| Yes | MinIO | `api.cloudinary.com` unreachable from inside Docker container |
| No | Cloudinary | Standard production flow |

Response shape is identical in both cases: `{ result: { secure_url: "..." } }` so the client (`PostsManager.tsx`) works unchanged.

**Cloudinary setup (production only):**
1. Create a Cloudinary account and an unsigned upload preset.
2. Set in `.env.local` (not needed in `docker-compose.yml`):
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

---

## Database — PostgreSQL + Prisma

Schema: `prisma/schema.prisma`

Actively used model: `ContactMessage` (written by `/api/contact`).

`Photo`, `BlogPost`, `SiteSettings` models exist in the schema but are not yet wired to the UI — data for those comes from R2 JSON files instead.

Migrations live in `prisma/migrations/`. The Docker entrypoint runs `prisma migrate deploy` on every startup to apply pending migrations automatically.

---

## Admin auth — iron-session

Cookie-based. No external auth service.

- `SESSION_SECRET` — 32+ character secret (in env)
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — checked in `/api/admin/login`
- Admin portal lives at `/<ADMIN_SECRET_KEY>/admin` (secret segment from `ADMIN_SECRET_KEY` env var)

---

## SEO integrations

- `app/sitemap.ts` — Next.js native sitemap; reads album slugs from R2 for dynamic routes
- `app/robots.ts` — Next.js native robots.txt
- JSON-LD `Person` schema on `/vikhyat` page
- OG image: `/public/og-cover.jpg` (1200×630, **must be created manually**)

---

## Sanity (optional / not yet active)

Schema files exist in `sanity/schema/` but the Sanity Studio is not integrated into the running app. To activate:
1. Create a Sanity project at https://sanity.io/manage
2. `npm install -g @sanity/cli` then `sanity init`
3. Copy `sanity/schema/` files into the Studio schemas directory
