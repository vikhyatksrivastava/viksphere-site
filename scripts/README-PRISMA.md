Prisma setup notes

1. Add `DATABASE_URL` to `.env` or `.env.local` in the root, for example:

```
DATABASE_URL=postgresql://user:password@localhost:5432/viksphere
```

2. Install dependencies:

```
npm install
npm run prisma:generate
```

3. Run migrations (create initial migration):

```
npm run prisma:migrate
```

4. Use `npx prisma studio` to inspect data locally.

Notes:
- If you prefer to apply the provided SQL migration directly, run:

```
psql "$DATABASE_URL" -f prisma/migrations/20251229_init/migration.sql
```

