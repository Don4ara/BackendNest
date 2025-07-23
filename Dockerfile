# --------- STAGE 1: Build ---------
FROM node:slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

RUN npm run build

# --------- STAGE 2: ProductionnN ---------
FROM node:slim

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD npx prisma migrate deploy && npm run start:prod
