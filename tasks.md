### Milestone 5: Web Project Setup (Vite + React + TS + Bun)
- [x] Task 5.1: Initialize Vite React-TS project in `frontend/web` using Bun.
- [x] Task 5.2: Install runtime and dev dependencies with Bun.
- [x] Task 5.3: Create folder structure and setup module alias (`@/`), Zod env validation, config files.
- [x] Task 5.4: Set up Tailwind CSS, shadcn/ui setup, ESLint, Prettier, and package.json scripts.
- [x] Task 5.5: Create `AGENTS.md`, `README.md`, and run typecheck, lint, and build verifications.

### Milestone 6: Day 1 Web Application Implementation
- [x] Task 6.0: Step 0 Cleanup - Remove Vite demo assets, delete `frontend/AGENT.md`, configure `@theme` in Tailwind CSS, run `bun run api:types`, log gaps to `BACKEND_GAPS.md`.
- [x] Task 6.1: Step 1 Foundation - Setup QueryClient & Auth Providers, Router with account-status guards, Layouts, robust `apiClient.ts` with error mapping, refresh single-flight, `auth.ts` in-memory token & silent restore, and shared UI components.
- [x] Task 6.2: Step 2 Pages - Implement Welcome, Sign Up (with OTP & 429 Retry-After handling), Login (2FA & backup code support), Common Dashboard, Profile (devices & password), Request Role & Role Forms (student, faculty, warden, parent), Signed URL Evidence Upload, My Applications timeline, and Notifications list.
- [x] Task 6.3: Step 3 Verification & Tests - Write unit tests for Auth Client & Route Guards, run typecheck, lint, build, test.

### Milestone 7: Day 1 Mandatory Fixes
- [ ] Task 7.1: Fix endpoint refresh bypass paths (`/auth/otp/send`, `/auth/otp/verify`, `/auth/login`, `/auth/register`, `/auth/token/refresh`, `/auth/logout`) & test 401 loop prevention.
- [ ] Task 7.2: Add automated API path validator test (`src/test/apiPaths.test.ts`) comparing all `api.ts` routes against `api.d.ts`. Fix all mismatched paths.
- [ ] Task 7.3: Calculate non-never response body count in `api.d.ts` and document in `BACKEND_GAPS.md`.
- [ ] Task 7.4: Remove silent 404 mock fallbacks. Implement real `/api/v1/files/upload-url` and `/api/v1/auth/devices` endpoints. Restrict mocks behind `VITE_USE_MOCKS` with visible banner.
- [ ] Task 7.5: Audit Role Form fields against backend schemas and record unaccepted fields in `BACKEND_GAPS.md`.
- [ ] Task 7.6: Configure preview deployment settings and report CORS configuration (`CORS_ORIGINS`).

### Milestone 8: Day 2 Feature Implementation
- [ ] Task 8.1: Shared Infrastructure - Role navigation from config with permission-guarded routes, `RequestCard`, `RequestList`, `ApprovalInbox`, `usePolling` hook.
- [ ] Task 8.2: Student Features - Outpass (apply, list, timeline, return check-in), Complaints (create with photo, list, detail, comments, reopen), Attendance (per-subject percent, warning threshold, enter code, leave, dispute), Fees (breakup, invoices, pay with name confirmation, idempotency, gateway verification, receipts), SOS (big button, confirm, send without location, emergency numbers).
- [ ] Task 8.3: Warden Features - Outpass inbox (`ApprovalInbox`), overdue outpass list, SOS control room (acknowledge, update, escalate, close), Complaints board (assign, status, comment).
- [ ] Task 8.4: Admin Features - Role request & Parent link queues (`ApprovalInbox`), notices creation and approval.
- [ ] Task 8.5: Final Verification & Report - Typecheck, build, test suite execution, final report table.
