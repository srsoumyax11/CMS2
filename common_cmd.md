# College Management System - Common Commands & Cheat Sheet

## 1. Supabase Commands
Run these commands from the root project directory (`d:\APP_DEV\PS7`):

### Start Supabase Local Stack
```powershell
supabase start
```

### Stop Supabase Local Stack
```powershell
supabase stop
```

### Check Supabase Status & Ports
```powershell
supabase status
```

### Fresh Reset (Wipes local database & re-runs migrations)
```powershell
supabase db reset
```

---

## 2. Backend Commands (ElysiaJS + Bun)
Run these commands inside the `backend` directory (`d:\APP_DEV\PS7\backend`):

### Start Backend Development Server (with Auto-Reload)
```powershell
cd backend
bun run --watch src/index.ts
```

### Install Dependencies
```powershell
cd backend
bun install
```

---

## 3. Prisma & Database Commands
Run these commands inside the `backend` directory (`d:\APP_DEV\PS7\backend`):

### Push Schema Changes directly to DB (Development)
```powershell
bunx prisma db push
```

### Create & Apply Migration (Production tracking)
```powershell
bunx prisma migrate dev --name init
```

### Generate Prisma Client (Run after modifying `schema.prisma`)
```powershell
bunx prisma generate
```

### Open Prisma Studio (GUI for viewing/editing DB data)
```powershell
bunx prisma studio
```

---

## 4. Local URLs Cheat Sheet
- **API Server Base:** http://localhost:3000
- **Interactive Swagger API Docs:** http://localhost:3000/swagger
- **Supabase Studio Dashboard:** http://127.0.0.1:54323
- **Mailpit (Local Email Testing):** http://127.0.0.1:54324

---

## 5. Frontend Commands (React Native + Expo Router)
```powershell
cd frontend
bun run web # Run Web version
bun run android # Run Android app
bun run ios # Run iOS app
bun run build:web # Export static web build
```

---

## 6. Testing & Quality Verification Commands
Run these commands inside the `backend` directory (`d:\APP_DEV\PS7\backend`):

### Run All Automated Integration Tests
```powershell
cd backend
bun test
```

### Run Specific Test Suite (e.g. Auth, Student, Admin)
```powershell
cd backend
bun test tests/auth.test.ts
bun test tests/student.test.ts
bun test tests/admin.test.ts
```

### Run TypeScript Strict Type Check
```powershell
cd backend
bunx tsc --noEmit
```

1. 🌐 View the Frontend Web App
The Expo React Native Web server is currently running in your background terminal.

Open your browser and navigate to: http://localhost:8081
2. ⚡ View the Backend & Interactive Swagger API Docs
The ElysiaJS + Bun API server is running locally:

Open your browser and navigate to: http://localhost:3000/swagger
3. 📱 Mobile & Dev Server Commands (common_cmd.md)
Web App: cd frontend && bun run web (Opens at http://localhost:8081)
Android: cd frontend && bun run android
iOS: cd frontend && bun run ios
Backend Server: cd backend && bun run --watch src/index.ts (Runs at http://localhost:3000)
Backend Test Suite: cd backend && bun test
