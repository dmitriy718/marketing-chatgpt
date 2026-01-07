FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm ci
RUN npx playwright install --with-deps chromium

COPY . /app
