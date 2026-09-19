FROM node:22-alpine AS builder

WORKDIR /workspace/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
ARG VITE_GLITCHTIP_DSN
ENV VITE_GLITCHTIP_DSN=$VITE_GLITCHTIP_DSN
RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /workspace/frontend/package*.json ./
COPY --from=builder /workspace/frontend/node_modules ./node_modules
COPY --from=builder /workspace/frontend/build ./build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
