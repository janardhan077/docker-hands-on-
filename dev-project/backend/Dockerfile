# ─── Stage 1: Dependencies ───────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Copy only package files first (Docker layer cache)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ─── Stage 2: Builder ────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ─── Stage 3: Production Runner ──────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 appuser

# Copy only what's needed at runtime
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/server.js    ./server.js
COPY --from=builder --chown=appuser:nodejs /app/models       ./models
COPY --from=builder --chown=appuser:nodejs /app/seed.js      ./seed.js

USER appuser
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
