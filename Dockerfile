# WS24 Dev - Production Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Dependencies and build
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies for node-gyp and native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

# Copy package files first (for better layer caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production=false && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build:prod

# Remove dev dependencies to reduce image size
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Production runtime
FROM node:22-alpine AS runtime

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S ws24app -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=ws24app:nodejs /app/dist ./dist
COPY --from=builder --chown=ws24app:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=ws24app:nodejs /app/package.json ./package.json

# Copy environment configuration
COPY --from=builder --chown=ws24app:nodejs /app/.env.example ./

# Create directories with proper ownership
RUN mkdir -p /app/logs && chown -R ws24app:nodejs /app/logs

# Switch to non-root user
USER ws24app

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').request('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1)).end()"

# Start the application
CMD ["npm", "run", "start:prod"]

# Labels for better maintainability
LABEL maintainer="WS24 Dev Team"
LABEL version="1.0.0"
LABEL description="WS24 Dev Platform - Production Image"
LABEL org.opencontainers.image.source="https://github.com/ws24dev/ws24dev"
