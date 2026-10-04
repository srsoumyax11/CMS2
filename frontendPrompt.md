# MASTER PROMPT: Build the Campus App Frontend (Expo: iOS, Android, Web)

## 0. Your role and permissions

You are a senior frontend engineer. You build the frontend only.

- The `backend/` folder is READ ONLY. Read it to learn the structure, routes, auth, permissions, schema and process. Never create, edit, move or delete anything inside `backend/`.
- If the backend is missing something (endpoint, field, wrong type, unclear error format), do NOT fix it. Write it in `docs/BACKEND_GAPS.md` (what is missing, which screen needs it, suggested shape) and continue with a typed mock.
- Never invent an endpoint. Use only what exists in the backend code or OpenAPI file. If unsure, ask me one short question or log it in `BACKEND_GAPS.md`.
- Work in small steps. Before coding, write a short plan to `docs/PLAN.md`. After each milestone, update `docs/PROGRESS.md`.

## 1. Product in one paragraph

An all-in-one college app that follows a person from admission to alumni. It removes paperwork and missed alerts. Main roles: **Student, Faculty, Parent, Warden, Admin**. One login, one notice feed, one request flow with status tracking, SOS for emergencies, and an offline backup for key screens. One codebase must ship as **iOS app, Android app and website**.

## 2. Tech stack (fixed)

| Layer | Choice |
|---|---|
| Framework | Expo (latest stable SDK) + React Native + React Native Web |
| Language | TypeScript, strict mode, no `any` |
| Routing | Expo Router (file based, deep links, same routes on app and web) |
| Server data | TanStack Query (cache, retry, offline, invalidation) |
| App state | Zustand, only for session, active role, UI state |
| Forms | React Hook Form + Zod (one schema for form and validation) |
| Offline storage | MMKV or expo-sqlite, plus a sync queue |
| Secure storage | expo-secure-store (tokens), web fallback with httpOnly cookie if backend supports it |
| i18n | i18next, languages: English (en), Hindi (hi), Odia (or) |
| Monorepo | pnpm workspaces + Turborepo |
| Testing | Vitest, React Native Testing Library, Maestro (mobile E2E), Playwright (web E2E), Storybook for `ui` |
| Quality | ESLint, Prettier, Husky pre-commit, commitlint |
| Errors | Sentry (app and web) |
| Build | EAS Build, EAS Update (OTA), GitHub Actions |

Do not add a library that is not in this table without writing a short ADR in `docs/adr/`.

## 3. Repo structure

```
apps/
  app/                  Expo app. Routes only. Thin screens.
packages/
  api-client/           Types and hooks generated from OpenAPI (or hand typed from backend code)
  design-tokens/        Colors, spacing, radius, type, shadow, motion, z-index, breakpoints
  ui/                   Reusable components (Button, Input, Card, Sheet, Timeline, Table, EmptyState, ...)
  features/             One folder per feature (auth, onboarding, outpass, complaints, ...)
  config/               appConfig, env, feature flags, role and permission map, route map, status maps
  logger/               Logger and error reporting wrapper
  i18n/                 en.json, hi.json, or.json
  utils/                Pure helpers (date, money, validators, storage)
docs/
  PLAN.md  PROGRESS.md  BACKEND_GAPS.md  HOW_TO_ADD_A_FEATURE.md  adr/
```

Each feature folder: `screens/`, `components/`, `hooks/`, `schema/`, `config.ts`, `index.ts`.

Import rules (enforce with ESLint boundaries):
- A feature may import only `ui`, `api-client`, `config`, `design-tokens`, `logger`, `i18n`, `utils`.
- A feature must NEVER import another feature.
- `ui` must not know about any feature or API.

## 4. Engineering rules

| Rule | What to do |
|---|---|
| SSOT | API types come from the backend contract. Roles, permissions, statuses, routes, menu items live in `config` only. Colors and spacing live in `design-tokens` only. No copied constants. |
| Data driven | Build UI from config: menus per role, dashboard cards, form fields, table columns, status timelines, request types. Adding a request type means adding a config entry, not a new screen. |
| DRY | One `StatusTimeline`, one `RequestCard`, one `ApprovalInbox`, one `FormRenderer`, one `DataList`. Reuse for outpass, leave, documents, role requests, guardian links, refunds, waivers. |
| KISS | Plain functions and hooks. No custom state library. No deep inheritance. Small files (under 200 lines). |
| SRP | Screen = layout only. Hook = data and logic. Service = API call. Schema = validation. |
| Open/Closed | Extend by config. Do not edit shared components for one feature. |
| Liskov | All list and card components accept the same base props. |
| Interface segregation | Small hooks (`useOutpass`, `usePermission`), not one big store. |
| Dependency inversion | Screens depend on interfaces (`StorageService`, `Logger`, `Notifier`, `LocationService`). Native and web supply the real ones. |
| No magic | No hard coded text (use i18n), colors (use tokens), URLs (use config), roles (use enums). |

## 5. Design tokens and global config

- Tokens: color (semantic names such as `surface`, `text`, `primary`, `danger`, `success`, `warning`), spacing scale, radius, font sizes, line heights, shadows, motion durations, z-index, breakpoints.
- Light and dark theme from one token set. Never raw hex or pixel numbers inside components.
- Accessibility: support large text scale, contrast AA, 44px minimum touch target, screen reader labels on every control, focus order, reduced motion.
- One typed `appConfig`: API base URL, environment, feature flags, min app version, supported languages, upload limits, polling intervals. Load from env plus remote config.
- Permission helper: `can('outpass.approve')`, `<Gate permission="..." scope="...">`, `useActiveRole()`. UI hides what the user cannot do. The backend still decides. Never trust the UI alone.

## 6. Responsive and cross platform rules

- Breakpoints: phone, tablet, desktop. Same screen adapts.
- Phone: bottom tabs and stack. Tablet and desktop web: side navigation, two pane layouts (list and detail), tables for admin.
- Use flex and tokens, no fixed widths. Safe area handling on iOS and Android notches.
- Web must support: keyboard navigation, URLs for every screen, refresh without losing place, SEO for public pages (fees, dates, verify certificate), PWA install.
- Platform specific code only behind small adapters (`*.native.ts`, `*.web.ts`).
- Test at 360px, 768px, 1280px.

## 7. API client rules

- Base path `/api/v1`. Read the backend routes and generate or hand type the client.
- One client with: auth token attach, silent refresh, retry with backoff (GET only), timeout, request ID header sent and logged, uniform error mapping.
- Idempotency key header on payments, SOS, bookings, and any create action that must not double submit.
- Standard error screen shows the request ID so support can trace it.
- Pagination, filters and sorting are handled by one shared hook.
- Optimistic updates only where safe (mark read, cancel booking). Never for payments, approvals, marks.
- Online and offline queue: writes that must work offline (attendance marks, roll call, SOS retry, outpass check-in, leave) go to a persistent queue, with a visible sync status badge and conflict rules (server wins, show a message).

## 8. Auth, signup and approval flow (must match backend)

Account states: `registered`, `pending_approval`, `active`, `rejected`, `frozen`, `archived`.

1. Sign up with phone or email, OTP verify (resend with cooldown, captcha when asked). Result: `registered`, no role. The user gets a limited onboarding token that works only on onboarding routes.
2. Onboarding screen shows next step and open requests. The user picks a role from the requestable list:
   - Student, Faculty, Warden: role request with ID code, department or hostel, and evidence upload.
   - Parent: link to a child with admission number, DOB and relation. The child confirms in the app, or an admin approves. Request expires after 7 days.
3. Status screens: pending, needs more info (user can answer and upload), approved, rejected with reason, cancelled.
4. After approval the user logs in with a full token. Users with many roles get a role switcher.
5. Login extras: OTP, backup codes (lost phone), device list, force logout a device, odd login alerts, password reset, change email or phone with OTP.
6. Pending, rejected and frozen users must see only onboarding, status and help screens.

## 9. Features to build

### Common to everyone
Sign up, OTP, onboarding, role request status, role switcher, profile, addresses (PIN lookup), emergency contacts, password, devices, backup codes, language (en, hi, or), large text, dark mode, role based home dashboard, one notice feed with read status, notifications inbox, quiet hours, SOS button (also shake or power button x5 on mobile), emergency contacts list, help desk and ticket tracker, anonymous report, FAQ, global search, QR scanner, offline mode with sync badge, update prompt (min version), maintenance notice.

### Student
- Joining: admission tracker, checklist, document upload, digital ID card with QR (works offline), campus map (offline cache), roommate suggestions.
- Academics: live timetable with change alerts, subjects and syllabus, notes and slides, assignments with submit, results, recheck request and tracker.
- Attendance: percent per subject with short attendance alert, scan rotating QR or enter code to mark, apply leave (medical, event) with evidence, raise "I was present" dispute.
- Hostel: my room and bed, room change request, complaint with photo and status timeline, reopen, outpass apply and history, return check-in, mess menu and feedback, lost and found board with claim.
- Campus: library search, loans, reservations, fines; gym slot booking; canteen menu; bus routes and live location.
- Money: fee page with all heads and due dates, invoices, pay (with student name check), receipts, history, refund request and tracker, scholarships browse and apply.
- Documents: apply (bonafide, bort, transfer and more), track stage, download QR verified PDF.
- Activities: events with one tap register, teams, clubs, placements drives and apply, awards and certificates.
- Privacy: parent link requests, choose what each parent can see, unlink.
- Support: faculty feedback (anonymous), counselling booking, warnings and fines, mentor info.
- End: no-dues checklist, transcripts, alumni network and profile.

### Faculty
Today view, attendance session with rotating QR or code, manual tick list, correct a record, review disputes; timetable view, change room or time with clash message, cancel class; leave apply and pick substitute; upload notes with versions; create assignments, view submissions, similarity score, rubric grading, bulk feedback; marks Excel upload with validation, submit and lock, change request; exam paper upload with time lock, duty list accept or swap, incident report; at risk students list, refer to counselling; mentees, private notes, meeting log, progress; one approval inbox with delegate; messages with reply hours; class SOS; complaints against me with reply; profile and records; feedback summary.

### Parent
Link child flow and status, children switcher, fees and pay, receipts, refund tracker, outpass alerts (and approve when rule needs it), attendance and results, warnings with reply, SOS live updates, health alerts (no details), hostel info and warden contact, bus status, meeting request, messages, complaints with ticket number, anonymous report, scholarships with last dates, documents request and download, final year no-dues and documents, fraud report, SMS and call fallback info page.

### Warden
Outpass approval inbox (single and bulk), overdue list, notify parent; complaint board with assign and status; live SOS screen with acknowledge, escalate, updates, close; emergency broadcast; room and bed map, vacant beds, allocate, room change decisions; night roll call (offline); visitor log and pre approval; mess menu editor, feedback, headcount, hygiene checklist; warnings; lost and found verify; hostel notices; daily report export.

### Admin
Approval queues (role requests, guardian links) with auto check hints; roles, permissions, scopes, temporary access, role conflicts, backup approver; users (search, freeze, force logout, reset, merge duplicates, bulk import); students (assign batch, branch change, mentor, hostel, status, parent link); courses, departments, batches, subjects, offerings, terms, periods; timetable builder with clash check; admission queue; exams, papers, duties, seating, results publish and withdraw; mark change approvals; hostels and beds; assets with QR, issue, return, damage; tickets with SLA and escalation rules; fee structures, invoices, fines, waivers, refunds, reconciliation, gateway events; library, gym, canteen, transport, vendors, events and clubs, placements; notices approval and recall, broadcast, emergency alert, online class or lockdown mode; SOS steps and emergency directory; safety cases (committee only) with access log; audit log viewer; rules with versions; backups and restore; feature flags; security alerts; reports and exports; dashboard; system health; signup settings and identity import.

### Required shared screens and states
Every list has: loading skeleton, empty state, error with retry (shows request ID), pull to refresh, pagination. Every request has: status timeline, who is handling it, reply time, "request sent" confirmation, cancel or reopen where allowed. Confirm dialogs for risky actions (refund, delete, approve, SOS cancel).

## 10. Logging, errors and monitoring

- One `logger` (debug, info, warn, error). `console.log` is banned by lint.
- Redact by default. Never log OTP, passwords, tokens, marks, health data, anonymous report text.
- Global error boundary and per route boundary with a friendly retry screen.
- Sentry with release, platform, role and request ID tags.
- Analytics event names in one enum, no personal data.
- Log API failures with request ID, status and route (not body).

## 11. Security rules

- Tokens in secure storage only. No secrets in the bundle.
- Session timeout and re-auth for sensitive actions (pay, refund approve, role change).
- Block screenshots on health, marks and anonymous report screens (mobile).
- Validate all input with Zod. Sanitize rendered rich text.
- File uploads: use signed upload links, show progress, retry, size and type limits from config.
- Deep links are validated and checked against permissions.
- SOS must work with poor network: queue, retry, and show SMS fallback.

## 12. Performance rules

List virtualization, image resize and caching, lazy routes and code split on web, bundle size budget, avoid re-renders (memo only where measured), query cache with sensible stale times, background sync on mobile.

## 13. Quality gates (a task is not done until all pass)

- `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.
- New shared component has a Storybook story and a test.
- New feature has: schema, hook tests, one E2E path.
- No hard coded text, colors or URLs.
- Works at 360px, 768px, 1280px, light and dark, large text, screen reader labels present.
- Works offline where listed in section 7.
- Docs updated: `PROGRESS.md`, `HOW_TO_ADD_A_FEATURE.md` if a pattern changed.

## 14. Build order (milestones)

1. Monorepo, tooling, design tokens, `ui` basics, logger, config, i18n, API client. Storybook running. CI running.
2. Auth: signup, OTP, onboarding, role request and guardian link flows, status screens, role switcher, permission gate, secure session.
3. Shared engine: `FormRenderer`, `DataList`, `StatusTimeline`, `ApprovalInbox`, notices feed, notifications, SOS, offline queue.
4. Student MVP: outpass, complaints, attendance, fees, documents, notices.
5. Warden and Faculty screens.
6. Parent screens.
7. Admin screens (start with approval queues, users, roles, notices, tickets, fees).
8. Remaining student and campus features (library, gym, transport, activities, placements, alumni).
9. Offline hardening, accessibility pass, performance pass, i18n review (Hindi, Odia).
10. Store release: EAS builds, staged rollout, OTA, web deploy.

After each milestone: stop, summarize what works, list gaps in `BACKEND_GAPS.md`, and wait for my review.

## 15. How to start (first reply)

1. Read the `backend/` folder (read only). Summarize: auth method, route groups, error format, pagination style, permission model, file upload method, realtime method (WebSocket or polling), and anything unclear.
2. Write `docs/PLAN.md` with your exact folder tree, chosen package versions and the first milestone tasks.
3. Ask me at most 3 questions, only if the backend does not answer them. Then begin milestone 1.

## 16. EXTRA REQUIREMENTS (owner will paste here)

<!-- Paste the extra points you wanted to add. The AI must treat them as part of this spec and update PLAN.md. -->