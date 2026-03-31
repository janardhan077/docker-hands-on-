
FROM node:20-alpine AS builder
WORKDIR /app
COPY index.html ./index.html


FROM nginx:1.25-alpine AS runner


RUN rm -rf /usr/share/nginx/html/*


COPY --from=builder /app/index.html /usr/share/nginx/html/index.html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
