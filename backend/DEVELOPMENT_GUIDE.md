# Backend Developer Setup & Local Environment Guide

Welcome to the **College Management System Backend**! This document provides a complete guide for setting up, running, seeding, wiping, and debugging the backend server on a local development machine.

---

## 🛠️ 1. Software Prerequisites

Before running the backend, ensure your machine has the following tools installed:

| Tool | Version Requirement | Purpose |
| :--- | :--- | :--- |
| **Docker Desktop** | Latest (WSL2 on Windows / Native on Mac & Linux) | Runs local PostgreSQL database & Supabase services in Docker containers |
| **Bun** | v1.1+ (`curl -fsSL https://bun.sh/install \| bash` or `powershell -c "irm bun.sh/install.ps1 \| iex"`) | Ultra-fast JavaScript/TypeScript runtime, package manager & test runner |
| **Node.js** | v18+ | Required for npm and CLI tools |
| **Supabase CLI** | `npm install -g supabase` | Manages local Supabase Docker stack, migrations & seed scripts |
| **Git** | Latest | Source control management |

---

## 🚀 2. First-Time Setup (Step-by-Step)

### Step 1: Open Docker Desktop
Ensure **Docker Desktop** is open and running on your computer. You can test it by running:
```bash
docker info
```

### Step 2: Configure Environment Variables
Navigate to the `backend` folder and copy `.env.example` to create your local `.env` file:
```bash
cd backend
cp .env.example .env
```

### Step 3: Start Local Supabase / PostgreSQL Database
From the root project directory (`d:\APP_DEV\PS7`), start the local Supabase stack:
```bash
# Run from project root
supabase start
```
> **What this does:** Spin up local PostgreSQL container (`127.0.0.1:54322`), Redis, Mailpit (`127.0.0.1:54324`), and Supabase Studio UI (`127.0.0.1:54323`).

### Step 4: Install Dependencies & Setup Prisma
In the `backend` directory, install all Node modules and sync the database schema:
```bash
cd backend
bun install
bunx prisma db push
bunx prisma generate
```

### Step 5: Start the Backend Development Server
Run the ElysiaJS + Bun API server with live hot-reloading:
```bash
bun run --watch src/index.ts
```

Your server is now live! 🚀
- **API Base URL:** `http://localhost:3000`
- **Interactive Swagger Docs:** `http://localhost:3000/swagger`
- **Supabase DB Studio:** `http://127.0.0.1:54323`

---

## 🔄 3. How to Reset / Wipe Database for a Fresh Start

When you want to **wipe all data, clear old tables, and re-apply fresh database migrations**, use one of the following methods:

### Option A: Complete Supabase Database Reset (Recommended)
From the project root (`d:\APP_DEV\PS7`):
```bash
supabase db reset
```
> **What this does:** Drops the local PostgreSQL database, recreates all schemas (`campus_schema.sql`), and applies fresh migrations and seed data.

### Option B: Prisma Schema Force Reset
From inside the `backend` directory:
```bash
bunx prisma db push --force-reset
```
> **What this does:** Drops all tables managed by Prisma and re-creates them cleanly according to `schema.prisma`.

---

## 🛠️ 4. Useful Developer Commands Cheat Sheet

| Task | Command | Directory |
| :--- | :--- | :--- |
| **Start Backend Dev Server** | `bun run --watch src/index.ts` | `backend/` |
| **Check Database Status** | `supabase status` | Project Root |
| **Start Database** | `supabase start` | Project Root |
| **Stop Database** | `supabase stop` | Project Root |
| **Reset / Wipe Database** | `supabase db reset` | Project Root |
| **Run All Unit & Integration Tests** | `bun test` | `backend/` |
| **Run TypeScript Type Check** | `bunx tsc --noEmit` | `backend/` |
| **Open Prisma Studio (DB GUI)** | `bunx tsc --noEmit` then `bunx prisma studio` | `backend/` |
| **Generate Prisma Client** | `bunx prisma generate` | `backend/` |

---

## 🐛 5. Debugging & Error Handling Toggles

### Expose Raw Errors for Local Debugging
If you encounter an error and want to see the **raw database stack traces, line numbers, and SQL query details** directly in your API response:

1. Open `backend/.env`
2. Set:
   ```env
   EXPOSE_RAW_ERRORS=true
   ```
3. Restart or save the server. The API will now display full tracebacks in JSON responses.
4. Set back to `EXPOSE_RAW_ERRORS=false` before deploying to production.

---

## ❓ 6. Troubleshooting Common Issues

#### Issue 1: `Can't reach database server at 127.0.0.1:54322`
- **Cause:** Docker Desktop is not running or Supabase container stopped.
- **Fix:** Open Docker Desktop, then run `supabase start` from the project root.

#### Issue 2: `Port 3000 already in use`
- **Cause:** An existing backend instance is running in another terminal.
- **Fix:** Stop the running process or kill port 3000:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
  ```

## 🌐 7. Local Network Ports Cheat Sheet

Here is a breakdown of all ports used by local Supabase, the backend API, and the frontend app:

| Port | Service Name | Protocol / URL | What it is used for |
| :--- | :--- | :--- | :--- |
| **`54322`** | **PostgreSQL Database (Direct)** | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | **Primary DB Port**. Used by Prisma ORM, DBeaver, and `psql` to execute raw queries against local Postgres. |
| **`54321`** | **Supabase API Gateway (Kong)** | `http://127.0.0.1:54321` | Central HTTP Gateway routing traffic to PostgREST, Auth (GoTrue), and Storage. |
| **`54323`** | **Supabase Studio Dashboard** | `http://127.0.0.1:54323` | Local Web Browser GUI for managing DB tables, executing SQL, and managing bucket files. |
| **`54324`** | **Mailpit (Email Inspector)** | `http://127.0.0.1:54324` | Local Email Dashboard that catches all sent confirmation emails, OTPs, and password reset links. |
| **`54325`** | **PgBouncer (Connection Pooler)** | `127.0.0.1:54325` | Optional connection pooler for managing high-concurrency client connections. |
| **`54326`** | **Vector Analytics / Logs** | `127.0.0.1:54326` | Internal logging and metrics aggregation engine. |
| **`54327`** | **Inbucket SMTP Server** | `127.0.0.1:54327` | Internal mail transfer agent for Supabase Auth notifications. |
| **`3000`** | **ElysiaJS Backend API** | `http://localhost:3000` | Your main Bun + ElysiaJS REST API server! |
| **`3000/swagger`** | **Interactive Swagger Docs** | `http://localhost:3000/swagger` | Auto-generated OpenAPI interactive testing documentation. |
| **`8081`** | **Expo React Native Frontend** | `http://localhost:8081` | Web and mobile frontend development server! |

