# College Management System - Backend API

Production-ready modular backend for the College Management System built with **Bun**, **ElysiaJS**, **Prisma ORM**, **PostgreSQL (Supabase Local)**, and **Redis**.

---

## 📖 Developer Guide & Quick Setup

For complete local setup instructions, prerequisites, database start/wipe commands, and debugging configuration, please refer to the comprehensive developer guide:

👉 [**Backend Developer Setup & Local Environment Guide (`DEVELOPMENT_GUIDE.md`)**](./DEVELOPMENT_GUIDE.md)

---

## 🚀 Quick Commands

```bash
# 1. Start Local Supabase Database (from project root)
supabase start

# 2. Start Backend Server in Watch Mode (from backend/ directory)
cd backend
bun install
bun run --watch src/index.ts
```

- **Interactive Swagger API Docs:** [http://localhost:3000/swagger](http://localhost:3000/swagger)
- **Supabase DB Studio:** [http://127.0.0.1:54323](http://127.0.0.1:54323)
- **Run Tests:** `bun test`
- **Type Check:** `bunx tsc --noEmit`
