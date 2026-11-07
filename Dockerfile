FROM node:26-bookworm-slim AS build
WORKDIR /app
RUN npm install --global pnpm@12.18.0
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml relay.config.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:26-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=3000 NODE_OPTIONS=--experimental-default-type=module
WORKDIR /app
COPY --from=build /app/apps/web/dist/client ./dist/client
COPY --from=build /app/apps/web/dist/server/server.js ./dist/server/server.js
COPY --from=build /app/apps/web/dist/server/schema.graphql ./dist/server/schema.graphql
COPY --from=build /app/apps/web/dist/server/assets ./dist/server/assets
COPY --from=build /app/apps/web/dist/watt ./dist/watt
COPY --from=build /app/apps/web/watt.json ./watt.json
EXPOSE 3000
CMD ["node", "dist/watt/start.mjs"]
