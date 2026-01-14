FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies
RUN bun install

# Copy source code
COPY . .

# Build frontend
RUN cd apps/frontend && bun run build

# Copy frontend build to backend public directory
RUN mkdir -p apps/backend/public && \
    cp -r apps/frontend/dist/* apps/backend/public/

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

# Copy built backend and dependencies
COPY --from=builder /app/apps/backend /app/apps/backend
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/package.json /app/package.json

# Install production dependencies only
WORKDIR /app
RUN bun install --production --ignore-scripts

WORKDIR /app/apps/backend

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Run migrations and start server
CMD ["sh", "-c", "bun run db:migrate && bun run start"]
