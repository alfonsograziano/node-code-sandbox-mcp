# ─── Builder stage ──────────────────────────────────────────────────────────
FROM node:23-slim AS builder
WORKDIR /app

# 1. Copy package files and tsconfig to install devDependencies (including tsc)
COPY package*.json tsconfig.json tsconfig.build.json ./
RUN npm ci

# 2. Copy all source (including src/tools/initialize.ts) and compile
COPY src ./src
RUN npm run build    # emits dist/server.js, dist/tools/initialize.js, etc.

# ─── Runtime stage ──────────────────────────────────────────────────────────
FROM node:23-slim
WORKDIR /app

# 3. Install Docker CLI so we can shell out to docker commands
RUN apt-get update && \
    apt-get install -y --no-install-recommends docker.io && \
    rm -rf /var/lib/apt/lists/*

# 4. Copy only package files & install production deps
COPY package*.json ./
RUN  npm pkg delete scripts.prepare && npm ci --production

# 5. Pull in the compiled output from builder
COPY --from=builder /app/dist ./dist

# 6. Expose Docker socket for nested Docker commands
#    When running: docker run -v /var/run/docker.sock:/var/run/docker.sock ...
VOLUME ["/var/run/docker.sock"]

# 7. Start your server
CMD ["node", "dist/server.js"]
