# Compile on the builder's native CPU; emulating SWC can fail on Apple Silicon.
FROM --platform=$BUILDPLATFORM node:24-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY next.config.ts next-env.d.ts tsconfig.json postcss.config.mjs ./
COPY app ./app
COPY lib ./lib
COPY data ./data
COPY scripts/prepare-cloud-data.mjs ./scripts/prepare-cloud-data.mjs
RUN node scripts/prepare-cloud-data.mjs && npm run build && rm -rf .next/standalone/data .next/standalone/node_modules

# Install native runtime dependencies for Cloud Run's Linux AMD64 target.
FROM node:24-bookworm-slim AS production-dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=8080 \
    DATA_BACKEND=snapshot DATA_SNAPSHOT_IMMUTABLE=true DEPLOYMENT_ENV=cloudrun
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/.cloud-data ./data
USER node
EXPOSE 8080
CMD ["node", "server.js"]
