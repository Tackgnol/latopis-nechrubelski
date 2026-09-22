FROM node:22-alpine AS builder

WORKDIR /workspace/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
ARG VITE_GLITCHTIP_DSN
ARG VITE_PUBLIC_ORIGIN
ARG VITE_GA_MEASUREMENT_ID
ARG SENTRY_RELEASE
ARG SENTRY_URL
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ENV VITE_GLITCHTIP_DSN=$VITE_GLITCHTIP_DSN
ENV VITE_PUBLIC_ORIGIN=$VITE_PUBLIC_ORIGIN
ENV VITE_GA_MEASUREMENT_ID=$VITE_GA_MEASUREMENT_ID
ENV SENTRY_RELEASE=$SENTRY_RELEASE
ENV SENTRY_URL=$SENTRY_URL
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT

# The upload token is a BuildKit secret: it exists only for this RUN and never enters an image layer or build arg.
RUN --mount=type=secret,id=sentry_auth_token,required=false     export SENTRY_AUTH_TOKEN="$(sed -n '1p' /run/secrets/sentry_auth_token 2>/dev/null || true)" &&     npm run build && npm run check:monitoring

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
