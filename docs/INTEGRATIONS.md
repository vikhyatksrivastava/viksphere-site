Integrations: Sanity + Cloudinary

Sanity
- Create a Sanity project at https://sanity.io/manage and note the `projectId` and `dataset`.
- Install and initialize the Studio in this repo folder or a sibling folder: `npm install -g @sanity/cli` then `sanity init`.
- Copy the schema files from `sanity/schema` into your Studio `schemas` directory and include them in the schema manifest.

Cloudinary
- Create a Cloudinary account and an unsigned upload preset (recommended for browser uploads) or use signed uploads server-side.
- Set environment variables in `.env.local`:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

- The app includes `app/api/upload/route.ts` which accepts POST { dataUrl } and proxies to Cloudinary using the unsigned preset.

Notes
- For security, prefer server-side signed uploads if exposing credentials is a concern.
- Sanity can store references to Cloudinary URLs for images if you prefer Cloudinary as the primary image host.
