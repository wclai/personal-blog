# 2. Runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy package.json + install production deps
COPY package*.json ./
RUN npm install --only=production

# Copy the built Next.js output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Copy Next.js config (only if exists)
COPY --from=builder /app/next.config.* ./ 

# Expose the port
EXPOSE 3000

CMD ["npm", "start"]
