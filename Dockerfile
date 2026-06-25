# ── Stage 1: base ────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# ── Stage 2: dev ─────────────────────────────────────────────────────────────
FROM base AS dev
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ── Stage 3: builder ─────────────────────────────────────────────────────────
FROM base AS builder
ARG APP_URL
ARG VITE_API_URL
ENV APP_URL=$APP_URL
ENV VITE_API_URL=$VITE_API_URL
COPY . .
RUN npm run build

# ── Stage 4: prod ─────────────────────────────────────────────────────────────
FROM nginx:alpine AS prod
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
