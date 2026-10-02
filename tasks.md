## 📱 Universal Cross-Platform Frontend (Web, iOS, Android)
- [x] React Native + Expo SDK 57 Setup
- [x] Expo Router File-Based Navigation (app/ layout, tabs, auth, 404, html)
- [x] Web Platform Bundling & HTML Export (Metro bundler)
- [x] iOS Platform Support (bundleIdentifier & tablet ready)
- [x] Android Platform Support (adaptive icons & gesture config)
- [x] Cross-Platform UI Dashboard & Services Hub
- [x] Student Digital Outpass Request & QR Gate Pass Screen (`frontend/app/student/outpass.tsx`)
- [x] Emergency SOS Pulse Trigger & Control Dispatch Screen (`frontend/app/student/sos.tsx`)
- [x] Warden Outpass Approval & Decision Inbox Screen (`frontend/app/warden/outpasses.tsx`)
- [x] Faculty Live Attendance Generator & Roll Call Screen (`frontend/app/faculty/attendance.tsx`)
- [x] Admin User Governance & Account Freezing Screen (`frontend/app/admin/users.tsx`)
- [x] Parent Portal, Outpass Approval & Razorpay Fee Payment Screen (`frontend/app/parent/children.tsx`)

---

# Campus Management System - Production Backend Implementation Plan

> **Note:** This task ledger follows **YAGNI**, **DRY**, **KISS**, **SOLID**, **SWOT**, and **SSOT** principles. Tasks are marked completed `[x]` as they are built and verified.

---

## 🏗️ Phase 0: Infrastructure & Core Architecture (Completed)
- [x] Initialize local Supabase PostgreSQL database containers via Docker CLI
- [x] Apply full 1,680-line `campus_schema.sql` database tables, views, triggers, and functions
- [x] Apply `campus_schema_002_self_signup.sql` self-signup & RBAC approval rules
- [x] Introspect PostgreSQL schema & configure modular Prisma setup (`prisma db pull --force`)
- [x] Setup Bun + ElysiaJS backend server with interactive `@elysiajs/swagger` docs at `/swagger`
- [x] Define global workspace guidelines in `.agents/AGENTS.md` & `common_cmd.md`

---

## 🔐 Phase 1: Shared System & Core Auth Architecture
- [x] Build modular backend directory structure (`routes/`, `controllers/`, `services/`, `middleware/`, `utils/`, `types/`)
- [x] Implement Password Hashing & Standard Response utilities (`password.ts`, `response.ts`)
- [x] Implement Auth Middleware (`jwtAuth`, `requireRoles` guard)
- [x] Build `/api/v1/auth` Endpoints:
  - [x] `POST /api/v1/auth/login` - Authenticate student, faculty, warden, parent, admin
  - [x] `POST /api/v1/auth/register` - Direct registration with email/phone & password after verified OTP
  - [x] `POST /api/v1/auth/otp/send` - Generate & send OTP
  - [x] `POST /api/v1/auth/otp/verify` - Verify & consume OTP code
  - [x] `POST /api/v1/auth/token/refresh` - Refresh access token
  - [x] `POST /api/v1/auth/backup-code/verify` - Verify emergency backup code
  - [x] `POST /api/v1/auth/role-request` - Self-signup role request workflow
  - [x] `POST /api/v1/auth/logout` - Revoke current session
  - [x] `POST /api/v1/auth/password/reset` - Password reset with verified OTP token
  - [x] `GET /api/v1/auth/devices` & `DELETE /api/v1/auth/devices/{id}` - List and force logout devices
  - [x] `GET /api/v1/auth/login-alerts` - Odd login history and security alerts

---

## 🎓 Phase 2: Student APIs (`/api/v1/student`)
- [x] **Profile & Onboarding:**
  - [x] `GET, PATCH /me` - Profile management
  - [x] `POST /me/name-correction` - Name correction requests
  - [x] `GET /me/joining-checklist` & `GET /admission/status` - Onboarding status & joining checklist
  - [x] `GET /me/id-card` - Digital ID Card with QR code payload
- [x] **Academics & Courseware:**
  - [x] `GET /timetable` - Live timetable schedule
  - [x] `GET /subjects` - Enrolled subject list
  - [x] `GET /assignments` & `POST /assignments/{id}/submit` - Assignments and student submissions
- [x] **Attendance & Disputes:**
  - [x] `GET /attendance/summary` - Attendance percentage per subject
  - [x] `POST /attendance/disputes` & `GET /attendance/disputes/{id}` - Attendance dispute handling
- [x] **Hostel Operations:**
  - [x] `GET /hostel/room` & `POST /hostel/room-change` - Room details and change requests
  - [x] `POST /outpasses`, `GET /outpasses`, `POST /outpasses/{id}/checkin` - Digital outpass workflow
- [x] **Notices & Communication:**
  - [x] `GET /notices` - Campus notice feed
- [x] **Payments & Safety:**
  - [x] `GET /fees` - Student fee breakdown and invoices
  - [x] `POST /sos`, `POST /sos/{id}/cancel`, `GET /sos/{id}/status` - Emergency SOS trigger

---

## 🏢 Phase 3: Warden APIs (`/api/v1/warden`)
- [x] **Outpass Approvals:**
  - [x] `GET /warden/outpasses?status=pending`, `GET /warden/outpasses/{id}` - Outpass approval inbox
  - [x] `POST /warden/outpasses/{id}/approve` & `POST /warden/outpasses/{id}/reject` - Outpass decisioning
  - [x] `GET /warden/outpasses/overdue` - Overdue alerts
- [x] **SOS & Emergency Response:**
  - [x] `GET /warden/sos/active`, `POST /warden/sos/{id}/acknowledge`, `POST /warden/sos/{id}/close` - SOS control room
- [x] **Rooms, Mess & Roll Call:**
  - [x] `GET /warden/rooms/vacant`, `POST /warden/rooms/allocate` - Room allocations
  - [x] `POST /warden/mess/hygiene-checks` - Mess hygiene inspections
  - [x] `POST /warden/visitors` - Visitors & entry passes

---

## 👨‍🏫 Phase 4: Faculty APIs (`/api/v1/faculty`)
- [x] **Attendance Management:**
  - [x] `POST /faculty/classes/{id}/attendance/session` - Start attendance session & code generation
  - [x] `POST /faculty/classes/{id}/attendance/manual` - Manual attendance entry
  - [x] `GET /faculty/attendance/disputes` & `POST /faculty/attendance/disputes/{id}/decide` - Resolve attendance disputes
- [x] **Timetable & Courseware:**
  - [x] `GET /faculty/timetable` - Live teaching timetable
- [x] **Assignments, Marks & Rubrics:**
  - [x] `POST /faculty/assignments`, `GET /faculty/assignments/{id}/submissions`, `POST /faculty/submissions/{id}/grade` - Assignments & Grading
- [x] **Mentoring:**
  - [x] `GET /faculty/mentees` - Mentees list

---

## 👨‍👩‍👧 Phase 5: Parent APIs (`/api/v1/parent`)
- [x] **Auth, Linking & Consent:**
  - [x] `POST /parent/link/request` - Request student link (Admission No + DOB check)
  - [x] `GET /parent/children` - List linked children
- [x] **Admissions & Fees:**
  - [x] `GET /parent/children/{id}/fees` - View pending fee invoices
  - [x] `POST /parent/payments/initiate` - Initiate official fee payment with gateway URL
- [x] **Outpass & Safety:**
  - [x] `GET /parent/children/{id}/outpasses` - Get outpasses for child
  - [x] `POST /parent/outpasses/{id}/approve` - Parent outpass approval

---

## 🛠️ Phase 6: Admin APIs (`/api/v1/admin`)
- [x] **User Governance & Freezing:**
  - [x] `GET /admin/users` - Paginated user listing with status filters
  - [x] `POST /admin/users/{id}/freeze` - Account status freezing (`status = 'frozen'`)
- [x] **College & Academic Hierarchy:**
  - [x] `GET, POST /admin/departments` - Department management
  - [x] `GET, POST /admin/courses` - Degree course management
  - [x] `GET, POST /admin/batches` - Academic batch management
- [x] **Name Corrections & Broadcasts:**
  - [x] `GET /admin/name-corrections` & `POST /admin/name-corrections/{id}/decide` - Student name fix approvals
  - [x] `POST /admin/broadcast/emergency` - System-wide emergency notification alert

---

## ⚡ Phase 7: Shared Platform Services
- [x] **Files & Storage:** `POST /files/upload-url` (signed URLs)
- [x] **Notifications & Fallback Chain:** `POST /notify/send` (Push -> SMS -> Voice Call)
- [x] **PDF & QR Engine:** `POST /qr/generate` (Dynamic signed QR payload)
- [x] **Gateway & Webhooks:** `POST /webhooks/payment` (Signature check & idempotency reconciliation)
