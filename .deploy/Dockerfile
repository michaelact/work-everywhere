FROM node:23 AS builder

ENV NEXT_PUBLIC_API_URL=http://localhost:8000

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

COPY . .
RUN npm run build

FROM node:23-slim AS runner

ENV NODE_ENV=production

RUN adduser --disabled-password --gecos "" app
USER app

WORKDIR /app
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
