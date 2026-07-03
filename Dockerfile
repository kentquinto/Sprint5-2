# ── Stage 1: Build ──────────────────────────────────────────────────────────
# Node installs dependencies and runs `npm run build` to produce /dist
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first — Docker caches this layer so npm ci only
# re-runs when dependencies actually change, not on every code change
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Pass the backend API URL at build time — Vite bakes it into the JS bundle
ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Stage 2: Serve ───────────────────────────────────────────────────────────
# Lightweight Nginx image — only the built /dist files are copied over,
# none of the source code or node_modules end up in the final image
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
