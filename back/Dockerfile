FROM node:24.12-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24.12-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24.12-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src
RUN find /app/src -type f ! -name "*.graphql" -delete
RUN chown -R node:node /app/src
USER node
EXPOSE 3000
CMD ["node", "dist/main"]
