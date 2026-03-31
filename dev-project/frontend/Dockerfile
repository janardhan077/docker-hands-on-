# ─── Stage 1: Build ──────────────────────────────────────────
# (No compile step needed — pure HTML/JS)
# We use a minimal image just to copy and serve the file.
FROM node:20-alpine AS builder
WORKDIR /app
COPY index.html ./index.html

# ─── Stage 2: Production Nginx Server ────────────────────────
FROM nginx:1.25-alpine AS runner

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend
COPY --from=builder /app/index.html /usr/share/nginx/html/index.html

# Custom nginx config: proxy /api/* → backend service
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
