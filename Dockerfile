FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema first
COPY server/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of server source code
COPY server/ .

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start the application
CMD ["npm", "start"] 