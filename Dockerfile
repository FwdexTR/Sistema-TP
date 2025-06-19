FROM node:18-alpine

WORKDIR /app

# Install curl for health check
RUN apk add --no-cache curl

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy server source code
COPY server/ .

# Expose port (Railway will set PORT environment variable)
EXPOSE 3000

# Health check with curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:$PORT/api/health || exit 1

# Start the application
CMD ["npm", "start"] 