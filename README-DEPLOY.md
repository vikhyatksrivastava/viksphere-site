# Production Deployment Guide

## Prerequisites

Before deploying you need accounts/resources set up for:
- **Vercel** — hosting the Next.js app
- **Neon / Railway / Supabase** (or any managed Postgres) — database
- **Cloudflare R2** — media storage (albums, post data, uploaded images)
- **Cloudinary** — cover image uploads from the admin panel
- A domain pointed at Vercel

---

## 1. Database (PostgreSQL)

1. Create a Postgres database (Neon is recommended for Vercel).
2. Copy the connection string — you'll need it as `DATABASE_URL`.
3. Prisma migrations run automatically on each deploy via the build command (see step 4).

---

## 2. Cloudflare R2

1. Create an R2 bucket (e.g. `viksphere-images`).
2. Generate an API token with **Object Read & Write** on that bucket.
3. Note your **Account ID**, **Access Key ID**, **Secret Access Key**, and **Bucket name**.
4. Upload your seed data files to the bucket root:
   - `data/albums.json`
   - `data/posts.json`
   - `data/portfolio.json`

---

## 3. Cloudinary

1. Create a Cloudinary account.
2. Create an **unsigned upload preset** (Settings → Upload → Upload Presets).
3. Note your **Cloud name** and **Preset name**.

---

## 4. Vercel deployment

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Set the **Build Command** to:
   ```
   npx prisma generate && npx prisma migrate deploy && next build
   ```
4. Set all **Environment Variables** (see section below).
5. Deploy.

---

## 5. Environment variables (Vercel)

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://...` | Your managed Postgres connection string |
| `R2_ACCOUNT_ID` | `abc123...` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | `...` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | `...` | R2 API token secret |
| `R2_BUCKET` | `viksphere-images` | R2 bucket name |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloudinary cloud name |
| `CLOUDINARY_UPLOAD_PRESET` | `your_preset` | Unsigned upload preset name |
| `ADMIN_SECRET_KEY` | *(strong random string)* | URL segment for the admin portal |
| `ADMIN_USERNAME` | *(your choice)* | Admin login username |
| `ADMIN_PASSWORD` | *(strong password)* | Admin login password |
| `SESSION_SECRET` | *(32+ character random string)* | Iron-session cookie signing key |
| `NEXT_PUBLIC_SITE_URL` | `https://viksphere.in` | Used in sitemap and OG tags |

> **Do NOT set `R2_ENDPOINT`** in production — leaving it unset enables the Cloudflare R2 path. It is only used in local Docker dev to point at MinIO.

---

## 6. DNS

Point your domain at Vercel:
- Add a **CNAME** record `www` → `cname.vercel-dns.com`
- Add an **A** record `@` → `76.76.21.21` (Vercel IP)

Or delegate the full zone to Vercel nameservers in your registrar settings.

---

## 7. Manual assets (required before go-live)

These files are not included in the repo and must be created manually:

| File | Size | Purpose |
|------|------|---------|
| `public/og-cover.jpg` | 1200 × 630 px | Open Graph / social share preview image |
| `public/favicon.png` | 32 × 32 px (or SVG) | Browser tab icon |

---

## Admin portal

After deployment the admin portal is at:

```
https://your-domain.com/<ADMIN_SECRET_KEY>/admin
```

Use the `ADMIN_USERNAME` / `ADMIN_PASSWORD` credentials you set in Vercel.

