FROM node:23-slim
WORKDIR /app
COPY package*.json tsconfig.json ./ 
RUN npm ci --omit=dev
COPY src ./src
RUN npm run build
CMD ["node", "dist/server.js"]
