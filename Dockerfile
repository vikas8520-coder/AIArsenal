# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY index.html vite.config.js ./
COPY src/ ./src/
COPY public/ ./public/

RUN npm run build

# ── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copy package.json first (needed for "type": "module")
COPY package.json ./

# Only install express — the sole runtime dependency for server.js + API handlers
RUN npm install --no-package-lock express@5

COPY --from=builder /app/dist/ ./dist/
COPY api/ ./api/
COPY server.js ./

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
