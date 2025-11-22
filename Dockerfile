# Dockerfile

# 1. Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Cpoy source code
COPY . .

# Build the Next.js app
RUN npm run build

# 2. Runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary files for production
COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs 2>/dev/null || true
COPY --from=builder /app/next.config.js ./next.config.js 2>/dev/null || true
COPY --from=builder /app/next.config.cjs ./next.config.cjs 2>/dev/null || true

# Define the port the app runs on
EXPOSE 3000

CMD ["npm", "start"]
# if you use "next start" in your package.json, make sure to have the following line in your package.json:
# "scripts": { "start": "next start" }
