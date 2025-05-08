# Build dependencies
FROM node:lts AS builder

RUN apt-get update && \
    apt-get install -y --no-install-recommends debian-archive-keyring && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential python3 pkg-config \
    libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /build
RUN npm install --omit=dev --prefer-offline --no-audit chartjs-node-canvas@4.0.0 @mermaid-js/mermaid-cli

# Chromium stage
FROM node:lts-slim

# Runtime dependencies only
RUN apt-get update && \
    apt-get install -y --no-install-recommends debian-archive-keyring && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    libcairo2 libpango1.0-0 libjpeg62-turbo libgif7 librsvg2-2 \
    chromium && \
    rm -rf /var/lib/apt/lists/*

RUN groupadd -r chromium && \
    useradd -r -g chromium -G audio,video chromium && \
    mkdir -p /home/chromium /workspace && \
    chown -R chromium:chromium /home/chromium /workspace

WORKDIR /workspace
COPY --from=builder --chown=chromium:chromium /build/node_modules ./node_modules

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    HOME=/home/chromium

USER chromium

RUN ./node_modules/.bin/mmdc -h
