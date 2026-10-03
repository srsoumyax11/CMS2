# Production Deployment & Infrastructure Runbook

This runbook outlines procedures for deploying, managing, and maintaining the **Bun + ElysiaJS + Prisma + PostgreSQL** Campus Management System backend service in production environments.

---

## 🏗️ Architectural Overview

- **Runtime**: [Bun](https://bun.sh/) (Fast JavaScript/TypeScript all-in-one toolkit & native test runner)
- **Framework**: [ElysiaJS](https://elysiajs.com/) (High-performance TypeScript web framework)
- **Database ORM**: [Prisma ORM](https://www.prisma.io/) connected to PostgreSQL 16
- **Cache & Rate Limiter**: Redis 7
- **API Documentation**: OpenAPI / Swagger interactive UI served at `/swagger`

---

## 🚀 Quick Start (Local Docker Compose Setup)

To spin up the entire backend stack locally including PostgreSQL and Redis:

```bash
cd backend

# Copy sample environment file
cp .env.example .env

# Spin up all containers in background
docker compose up -d --build
```

Verify service status:
- API Server: `http://localhost:3000/swagger`
- PostgreSQL: `localhost:5432` (`campus_db`)
- Redis: `localhost:6379`

---

## 🔐 Required Environment Variables

All production deployments require setting the following environment variables:

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | App runtime mode | `production` |
| `PORT` | Yes | Container HTTP listening port | `3000` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/campus_db?schema=campus` |
| `JWT_SECRET` | Yes | Access token signing secret (min 32 chars) | `prod_jwt_secret_32_chars_long` |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret (min 32 chars) | `prod_refresh_secret_32_chars_long` |
| `REDIS_URL` | Optional | Redis connection URL | `redis://redis:6379` |
| `CORS_ORIGIN` | Optional | Allowed CORS origin header | `https://campus.domain.com` |

---

## 📊 Database Migrations & Prisma Schema Synchronization

Whenever database schemas change or deployment updates are pushed:

```bash
# 1. Regenerate Prisma Client
bunx prisma generate

# 2. Push schema changes to target PostgreSQL database
bunx prisma db push

# 3. (Optional) Inspect database state using Prisma Studio UI
bunx prisma studio
```

---

## 🧪 Pre-Flight Verification & Health Checks

Before promoting any container deployment to live production:

```bash
# 1. Verify zero TypeScript compilation errors
bunx tsc --noEmit

# 2. Execute full automated test suite (Unit, Integration, Security)
bun test
```

### Healthcheck Endpoints
- **Liveness & Swagger Docs**: `GET http://localhost:3000/swagger`
- **System Config & Maintenance Check**: `GET http://localhost:3000/api/v1/admin/app-config`

---

## 🔄 Graceful Shutdown & Disaster Recovery

- The backend process listens for `SIGTERM` and `SIGINT` signals.
- On signal receipt, the process stops accepting new HTTP connections, drains active request handlers within a 10-second window, disconnects the Prisma database pool (`prisma.$disconnect()`), and terminates cleanly without corrupting transaction states.

---

## 🛡️ Security Audit Checklist

- [x] Hardcoded JWT mock tokens removed (`SEC-001`).
- [x] Bun password hashing enforced across all login and password change paths (`SEC-003`).
- [x] Sliding window rate limiting active on `/api/v1/auth/login`, `/api/v1/auth/otp/send`, and `/api/v1/auth/register` (`SEC-004`).
- [x] 10MB file size limit and MIME whitelist enforced on file storage endpoints (`SEC-006`).
- [x] IDOR scope guards (`verifyStudentScope`, `verifyWardenHostelScope`, `verifyParentChildScope`) active on domain routes (`AUTH-002`).
