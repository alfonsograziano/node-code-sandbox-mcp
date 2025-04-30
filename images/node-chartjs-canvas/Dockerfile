FROM node:lts

# 1. Install both build-time and runtime deps for node-canvas
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential python3 pkg-config \
    libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
    libcairo2 libpango1.0-0 libjpeg62-turbo libgif7 librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# 2. Pre-cache chartjs-node-canvas v4.0.0 in node_modules
RUN npm install --omit=dev --prefer-offline --no-audit chartjs-node-canvas@4.0.0

# 3. Leave /workspace untouched.
#    At runtime, mount or docker-cp in your real package.json, package-lock.json (if any) and index.js,
#    then simply run:
#
#      npm install --prefer-offline --no-audit
#      node index.js
#
#    npm will see that chartjs-node-canvas@4.0.0 & canvas already exist in node_modules
#    and only fetch any new dependencies.
