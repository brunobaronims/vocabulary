FROM node:24.12-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM nginx:1.28.1-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf.template /etc/nginx/templates/default.conf.template
