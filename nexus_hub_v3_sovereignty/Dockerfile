FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN groupadd --system nexus && useradd --system --gid nexus --home-dir /app nexus
COPY --from=build --chown=nexus:nexus /app/dist ./dist
COPY --from=build --chown=nexus:nexus /app/package.json ./package.json
COPY --from=build --chown=nexus:nexus /app/drizzle ./drizzle
COPY --chown=nexus:nexus docker/entrypoint.sh /usr/local/bin/nexus-entrypoint
RUN chmod 0555 /usr/local/bin/nexus-entrypoint
USER nexus
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/nexus-entrypoint"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]
