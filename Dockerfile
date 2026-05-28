# Development image — source code is volume-mounted at runtime for hot reload.
# node_modules and .next are kept inside the container (pinned volumes in docker-compose.yml)
# so the host never needs Node.js installed.

FROM node:20-alpine

# curl: Docker healthcheck inside the container
# openssl + libc6-compat: required by Prisma binary engine
RUN apk add --no-cache curl openssl libc6-compat

WORKDIR /app

# ── 1. Install dependencies (cached unless package*.json changes) ──────────
COPY package*.json ./
RUN npm ci

# ── 2. Generate Prisma client (needs schema at build time) ─────────────────
COPY prisma ./prisma/
RUN npx prisma generate

# ── 3. Copy source (overridden by volume mount in docker-compose.yml) ──────
COPY . .

EXPOSE 3000

# Apply any pending migrations, then start Next.js in dev mode (HMR enabled).
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]
