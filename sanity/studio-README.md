Sanity Studio setup

1. Install Sanity CLI globally: `npm install -g @sanity/cli`
2. From this folder run `sanity init` to create a Studio, or run `sanity start` if already configured.
3. Add the schema files from `./schema` to your studio's `schemas` directory and include them in the schema config.
4. Recommended dataset: `production`. Create a project at https://sanity.io/manage and get project ID + dataset.

Notes:
- `siteSettings` document controls which sections are visible (enablePhotography, enableBlog, etc.).
- Use Sanity media library for image assets; Cloudinary can be used as external CDN.
