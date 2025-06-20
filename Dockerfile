FROM node:18-alpine

WORKDIR /app

# Install required dependencies for Prisma
RUN apk add --no-cache \
    curl \
    openssl \
    libc6-compat

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema
COPY server/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY server/ .

# Expose port
EXPOSE 8080

# Health check with curl (simplified)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Start the application
CMD ["npm", "start"] 