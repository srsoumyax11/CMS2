### Milestone 5: Web Project Setup (Vite + React + TS + Bun)
- [x] Task 5.1: Initialize Vite React-TS project in `frontend/web` using Bun.
- [x] Task 5.2: Install runtime and dev dependencies with Bun.
- [x] Task 5.3: Create folder structure and setup module alias (`@/`), Zod env validation, config files.
- [x] Task 5.4: Set up Tailwind CSS, shadcn/ui setup, ESLint, Prettier, and package.json scripts.
- [x] Task 5.5: Create `AGENTS.md`, `README.md`, and run typecheck, lint, and build verifications.

### Milestone 6: Day 1 Web Application Implementation
- [ ] Task 6.0: Step 0 Cleanup - Remove Vite demo assets, delete `frontend/AGENT.md`, configure `@theme` in Tailwind CSS, run `bun run api:types`, log gaps to `BACKEND_GAPS.md`.
- [ ] Task 6.1: Step 1 Foundation - Setup QueryClient & Auth Providers, Router with account-status guards, Layouts, robust `apiClient.ts` with error mapping, refresh single-flight, `auth.ts` in-memory token & silent restore, and shared UI components.
- [ ] Task 6.2: Step 2 Pages - Implement Welcome, Sign Up (with OTP & 429 Retry-After handling), Login (2FA & backup code support), Common Dashboard, Profile (devices & password), Request Role & Role Forms (student, faculty, warden, parent), Signed URL Evidence Upload, My Applications timeline, and Notifications list.
- [ ] Task 6.3: Step 3 Verification & Tests - Write unit tests for Auth Client & Route Guards, run typecheck, lint, build, test.
