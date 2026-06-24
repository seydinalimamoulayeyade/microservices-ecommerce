FROM node:22-alpine

# Corriger les CVE Alpine
RUN apk update && apk upgrade --no-cache

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY src ./src

# Sécurité : ne pas tourner en root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV NODE_ENV=production
ENV PORT=3003

EXPOSE 3003

CMD ["node", "src/server.js"]
