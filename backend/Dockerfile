# backend/Dockerfile
FROM mcr.microsoft.com/playwright:v1.46.1-jammy

# We will run the app from /app
WORKDIR /app

# 1) Copy only backend package files first for better layer caching
COPY backend/package*.json ./

# 2) Copy Prisma schema early so `prisma generate` can find it
COPY backend/prisma ./prisma

# 3) Install dependencies
RUN npm ci

# 4) Generate Prisma client (now that prisma/schema.prisma is present)
RUN npx prisma generate || true

# 5) Copy the rest of the backend source
COPY backend/ ./

ENV NODE_ENV=production
EXPOSE 5000

# 6) Apply migrations (or push if no migrations) then start the server
CMD ["sh", "-c", "npx prisma migrate deploy || npx prisma db push; node index.js"]
