# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS builder

# better-sqlite3 compiles a native addon at install time.
RUN apk add --no-cache python3 make g++

WORKDIR /workspace/backend

COPY backend/package*.json ./
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc,required=true npm ci --legacy-peer-deps

COPY backend/ ./
RUN npm run build
RUN npm prune --omit=dev --legacy-peer-deps

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /workspace/backend/package*.json ./
COPY --from=builder /workspace/backend/node_modules ./node_modules
COPY --from=builder /workspace/backend/dist ./dist

ENV NODE_ENV=production
ENV PORT=3141

EXPOSE 3141

CMD ["node", "dist/index.js"]
