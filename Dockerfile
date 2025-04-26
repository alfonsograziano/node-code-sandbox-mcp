# ─── Builder stage ──────────────────────────────────────────────────────────
FROM node:23-slim AS builder
WORKDIR /app

# 1. Copy package files and tsconfig to install devDependencies (including tsc)
COPY package*.json tsconfig.json ./

RUN npm ci

# 2. Copy all source (including src/tools/initialize.ts) and compile
COPY src ./src
RUN npm run build    # emits dist/server.js, dist/tools/initialize.js, etc.

# ─── Runtime stage ──────────────────────────────────────────────────────────
FROM node:23-slim
WORKDIR /app

# 3. Copy only package files & install production deps
COPY package*.json ./
RUN npm ci --production

# 4. Pull in the compiled output from builder
COPY --from=builder /app/dist ./dist

# 5. Start your server
CMD ["node", "dist/server.js"]
