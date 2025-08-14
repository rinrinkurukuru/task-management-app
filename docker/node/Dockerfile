# Base stage with common dependencies
FROM node:22-alpine as base

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create app user with specific UID/GID for consistency
RUN addgroup -g 1001 nodegroup \
    && adduser -u 1001 -G nodegroup -s /bin/sh -D appuser

# Set working directory
WORKDIR /app

# Change ownership of /app directory
RUN chown -R appuser:nodegroup /app

# Development stage
FROM base as development

# Copy package files with proper ownership (as root for initial setup)
COPY --chown=appuser:nodegroup package*.json ./

# Switch to app user
USER appuser

# Install dependencies with cache optimization
RUN npm install --silent \
    && npm cache clean --force

# Health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${VITE_DEV_PORT:-5173} || exit 1

EXPOSE 3000 5173

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Development server command
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage for production builds
FROM base as builder

# Copy package files
COPY --chown=appuser:nodegroup package*.json ./

# Switch to app user
USER appuser

# Install all dependencies including devDependencies
RUN npm install --silent

# Copy source code
COPY --chown=appuser:nodegroup . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine as production

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config if exists (optional)
RUN --mount=type=bind,from=builder,source=/app/nginx.conf,target=/tmp/nginx.conf,rw \
    cp /tmp/nginx.conf /etc/nginx/nginx.conf || echo "No custom nginx.conf found, using default"

# Create nginx user and set permissions
RUN addgroup -g 1001 nginxgroup \
    && adduser -u 1001 -G nginxgroup -s /bin/false -D nginxuser \
    && chown -R nginxuser:nginxgroup /usr/share/nginx/html \
    && chown -R nginxuser:nginxgroup /var/cache/nginx \
    && chown -R nginxuser:nginxgroup /var/log/nginx \
    && chown -R nginxuser:nginxgroup /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R nginxuser:nginxgroup /var/run/nginx.pid

USER nginxuser

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]