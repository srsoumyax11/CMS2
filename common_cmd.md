# College Management System - Developer Setup & Command Cheat Sheet

Comprehensive guide for setting up, running, testing, building, and managing database state after cloning this project.

---

## 🚀 1. Quick Start: Fresh Clone Setup (First-Time Developers)

### Prerequisites
Make sure you have the following installed on your machine:
* **Node.js** (v20+ LTS) & **pnpm**: `npm install -g pnpm`
* **Bun**: [bun.sh](https://bun.sh) (v1.1+)
* **Docker Desktop**: Required for local PostgreSQL via Supabase CLI
* **Supabase CLI**: `npm install -g supabase` or `brew install supabase/tap/supabase`
* *(Optional for Mobile)* **Android Studio** (Android SDK & Emulator) / **Xcode** (macOS only for iOS Simulator)

### Installation Steps
```bash
# 1. Clone the repository
git clone <repository-url>
cd PS7

# 2. Install workspace dependencies
pnpm install

# 3. Install backend specific dependencies
cd backend
bun install
cd ..
```

---

## 🗄️ 2. Database Controls & Management (Supabase + PostgreSQL)

Run these commands from the root directory (`d:\APP_DEV\PS7`):

### A. Start Database
```powershell
supabase start
```
*Spins up local PostgreSQL container on port `54322`, Supabase Studio GUI on `http://127.0.0.1:54323`, and Storage on `http://127.0.0.1:54321`.*

### B. Stop Database
```powershell
supabase stop
```

### C. Database Reset & Refresh Operations

| Refresh Type | Command | Description |
|---|---|---|
| **Soft Refresh** (Sync Prisma Schema) | `cd backend && bunx prisma db pull --force && bunx prisma generate` | Pulls existing DB structure without touching table data. |
| **Hard Reset** (Wipe DB & Reapply Schema) | `supabase db reset` | Drops database, recreates tables from `campus_schema.sql` & `campus_schema_002_self_signup.sql`, and re-runs seed scripts. |
| **Push Prisma Changes** | `cd backend && bunx prisma db push` | Pushes Prisma schema changes directly to local PostgreSQL. |
| **Database GUI Inspector** | `cd backend && bunx prisma studio` | Opens interactive DB browser UI at `http://localhost:5555`. |

### D. Seed Initial Test Data
```powershell
cd backend
bun test tests/registration_flow.test.ts
bun test tests/user_flow_simulation.test.ts
```

---

## ⚡ 3. Backend Commands (ElysiaJS + Bun)

Run these commands inside `backend/` (`d:\APP_DEV\PS7\backend`):

### Start Backend Development Server (with Live Reload)
```powershell
cd backend
bun run --watch src/index.ts
```
* **API Base URL:** `http://localhost:3000`
* **Interactive Swagger Documentation:** `http://localhost:3000/swagger`

### Verify Backend & Database Compatibility
Run automated backend verification tests (verifies tables, storage upload signed URLs, auth tokens, & RBAC rules):
```powershell
cd backend
bun test
```

---

## 📱 4. Frontend Commands (React Native + Expo SDK 56)

Run these commands from project root or inside `apps/app`:

### A. Web Version (Browser)
```powershell
# From root directory:
pnpm --filter app web

# OR using Expo CLI directly:
npx expo start --web
```
*Opens app in browser at `http://localhost:8081`.*

### B. Mobile Emulators & Devices
```powershell
# Android Emulator (ensure Android Studio emulator is running first):
pnpm --filter app android

# iOS Simulator (macOS only):
pnpm --filter app ios

# Physical Phone via Expo Go (Android/iOS):
pnpm --filter app start
# Scan the displayed QR code using the Expo Go mobile app.
```

---

## 📦 5. Building Production Binaries & Bundles (APK, IPA, Web)

### A. Export Web Build (Static Files)
```powershell
pnpm --filter app build:web
# Outputs production bundle to apps/app/dist or web-build/
```

### B. Build Android APK File (.apk)

#### Option 1: EAS Build CLI (Recommended)
```powershell
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# Build APK locally (without cloud queue)
cd apps/app
eas build --platform android --profile preview --local
```

#### Option 2: Standalone Native Prebuild
```powershell
cd apps/app
npx expo prebuild
npx expo run:android --variant release
```
*Generated APK location:* `apps/app/android/app/build/outputs/apk/release/app-release.apk`

### C. Build iOS App (.ipa)
```powershell
cd apps/app
eas build --platform ios --profile preview --local
```

---

## 🧪 6. Full Monorepo Quality & Verification Gate

Run the master verification command before submitting code:
```powershell
# From root directory:
pnpm verify
```
This automatically runs:
1. `pnpm typecheck` across all 8 workspace packages.
2. `turbo run lint --force` (ESLint static analysis).
3. `pnpm test` (all frontend & backend test suites).
4. `@campus/i18n` translation key validation.
5. `@campus/api-client` contract check.

---

## 🌐 7. Local URLs Reference Card

| Service | Local URL | Notes |
|---|---|---|
| **Frontend Web App** | http://localhost:8081 | Universal React Native Web UI |
| **Backend API Server** | http://localhost:3000 | Bun + ElysiaJS REST API |
| **Swagger API Docs** | http://localhost:3000/swagger | Interactive API playground |
| **Supabase Studio** | http://127.0.0.1:54323 | Local PostgreSQL database GUI |
| **Prisma Studio GUI** | http://localhost:5555 | Active database table browser |
| **Mailpit (Local Email)** | http://127.0.0.1:54324 | Captures sent system emails |
