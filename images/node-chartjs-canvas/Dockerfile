FROM node:lts

# 1) Install build‑time deps + Debian’s chromium (used for puppeteer, used by Mermaid CLI)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential python3 pkg-config \
    libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
    libcairo2 libpango1.0-0 libjpeg62-turbo libgif7 librsvg2-2 \
    chromium && \
    rm -rf /var/lib/apt/lists/*

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 2) Wrap the Chromium binary                                                 │
# │    We move the real binary and create a shell‑wrapper that always           │
# │    passes our recommended flags:                                            │
# │      --no-sandbox, --disable-setuid-sandbox, --disable-dev-shm-usage        │
# │    This keeps downstream tools (Puppeteer, mermaid‑cli) happy               │
# └─────────────────────────────────────────────────────────────────────────────┘
RUN mv /usr/bin/chromium /usr/bin/chromium.real && \
    printf '%s\n' \
    '#!/bin/sh' \
    'exec /usr/bin/chromium.real \' \
    '  --no-sandbox \' \
    '  --disable-setuid-sandbox \' \
    '  --disable-dev-shm-usage \' \
    '  "$@"' \
    > /usr/bin/chromium && \
    chmod +x /usr/bin/chromium

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 3) Environment variables for Puppeteer/CLI tools                            │
# │    • Skip Puppeteer’s automatic Chromium download                           │
# │    • Point at our system-installed wrapper                                  │
# └─────────────────────────────────────────────────────────────────────────────┘
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /workspace

# 2. Pre-cache chartjs-node-canvas v4.0.0 in node_modules
RUN npm install --omit=dev --prefer-offline --no-audit chartjs-node-canvas@4.0.0

# 5) Install mermaid‑cli using the system Chromium wrapper
RUN npm install @mermaid-js/mermaid-cli
# 6) Smoke‑test the CLI
RUN ./node_modules/.bin/mmdc -h
