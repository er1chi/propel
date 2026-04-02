FROM node:25.8-alpine AS base

RUN addgroup -S prop && adduser -S prop -G prop
RUN mkdir /app && chown prop:prop /app && chmod 755 /app && chmod 755 /usr/local/lib/
RUN npm install -g pnpm turbo
USER prop
WORKDIR /app

FROM base AS prune

COPY --chown=prop:prop . .
RUN pnpm dlx turbo prune @propel/server --docker

FROM base AS builder

COPY --chown=prop:prop --from=prune /app/out/json/ .
COPY --chown=prop:prop --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --chown=prop:prop --from=prune /app/out/full/ .
RUN pnpm install --frozen-lockfile && pnpm run build --filter=@propel/server

FROM gcr.io/distroless/nodejs24-debian12 AS runner

COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/package.json ./

CMD ["dist/main.js"]
