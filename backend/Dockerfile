# Multi-stage production Dockerfile for Bun + ElysiaJS backend
FROM oven/bun:1-slim AS builder

WORKDIR /app

# Copy package descriptors and lockfile
COPY package.json bun.lock ./

# Install dependencies (frozen lockfile for production stability)
RUN bun install --frozen-lockfile

# Copy source code and Prisma multi-file schema directory
COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./

# Generate Prisma Client
RUN bunx prisma generate

# Runner stage: minimal production environment
FROM oven/bun:1-slim AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules, generated Prisma client, and compiled code from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./

# Expose HTTP server port
EXPOSE 3000

# Non-root user for container security
USER bun

# Run production server
CMD ["bun", "src/index.ts"]
