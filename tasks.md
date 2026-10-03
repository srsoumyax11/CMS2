## 📱 Universal Cross-Platform Frontend (Web, iOS, Android)
- [x] React Native + Expo SDK 57 Setup
- [x] Expo Router File-Based Navigation (`app/` layout, tabs, auth, student, warden, faculty, parent, admin, 404, html)
- [x] Web Platform Bundling & HTML Export (Metro bundler)
- [x] iOS Platform Support (bundleIdentifier & tablet ready)
- [x] Android Platform Support (adaptive icons & gesture config)
- [x] Frontend Base Cleanup & Reset (Clean base structure for Flat Design rewrite per `design.md`)
- [x] Design Tokens System Architecture (`frontend/src/theme/tokens.ts` with 4-6 solid colors, 0 shadows, 0 gradients, flat 2D borders)
- [x] Master Senior UI/UX Detailed Frontend Plan & Edge Case Checklist (`frontend_plan.md`)
- [x] Phase 1: Authentication & Onboarding Flow (`app/(auth)/` - Landing Page, Login, 3-step Register Wizard, Role Selection, Parent Link)
- [x] Phase 2: Shared Shell, Navigation & Platform Utilities (`app/(tabs)/` - Universal Header, Persona Switcher, Notifications, SOS Floating Button, Dynamic QR Presenter/Scanner)
- [x] Phase 3: Student Experience Portal (`app/(student)/` - Dashboard, Timetable, Attendance, Outpass Pass, Fees, Library Catalog, Hostel Room & Mess, Campus Clubs & Placements, Digital Rotatable ID Card)
- [x] Phase 4: Warden Operations Console (`app/(warden)/` - Warden Console Dashboard, Outpass Approval Inbox, Emergency SOS Control Room, Hostel Room Allocator, Night Roll Call & Visitor Gate Log)
- [x] Phase 5: Faculty Academic Workspace (`app/(faculty)/` - Faculty Dashboard, Live Rotating QR Attendance Launcher, Course Assignments & Rubric Grading, Attendance Dispute Resolution, Mentee Progress Tracking)
- [x] Phase 6: Parent Guardian Portal (`app/(parent)/` - Multi-Child Dashboard Switcher, Parent Outpass Authorization Inbox, Child Fee Invoices & Payment Gateway, Safety Alerts Feed)
- [x] Phase 7: Administration & Governance Suite (`app/(admin)/` - User Directory & Account Governance, Self-Signup Role Approval Queue, Academic Hierarchy & Location Tree, System Compliance & Audit Logs)

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
  - [x] `POST /api/v1/auth/login` - Authenticate student, faculty, warden, parent, admin (with 2FA challenge support)
  - [x] `POST /api/v1/auth/2fa/verify` - Verify 2FA OTP to complete login session
  - [x] `POST /api/v1/auth/mfa/enable` & `POST /api/v1/auth/mfa/disable` - Enable/disable account 2FA/MFA
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
  - [x] `user_flow_simulation.test.ts` - Real-world end-to-end user registration & 2FA authentication flow simulation script
  - [x] `registration_flow.test.ts` - Standard OTP registration and direct login test script

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

---

## 🔐 Phase 8: Signup, Onboarding & RBAC Role Approval Flow (`/api/v1`)
- [x] **1. Signup & Onboarding (Public & Self):**
  - [x] `POST /api/v1/auth/register` - Public registration with phone/email (rate limited, captcha)
  - [x] `POST /api/v1/auth/register/verify-otp` - Verify OTP, transition account status to `registered`
  - [x] `POST /api/v1/auth/register/resend-otp` - Resend registration OTP with cooldown
  - [x] `GET /api/v1/me/onboarding` - Retrieve user next step, open requests, current onboarding status
  - [x] `GET /api/v1/roles/requestable` - List requestable roles, required evidence, and approval mode
  - [x] `GET /api/v1/me/roles` - Retrieve current active user roles
  - [x] `POST /api/v1/me/active-role` - Switch active operational role
  - [x] `GET /api/v1/me/permissions` - Query active permission set (`v_active_permissions`)
  - [x] `POST /api/v1/me/contact-change` & `POST /api/v1/me/contact-change/verify` - Initiate and verify email/phone change with OTP
  - [x] `GET, POST /api/v1/me/addresses` & `PATCH, DELETE /api/v1/me/addresses/{id}` - Manage user address list
  - [x] `GET /api/v1/lookup/pin-codes/{pin}` - City and state lookup from PIN code
  - [x] `GET, POST /api/v1/me/emergency-contacts` & `PATCH, DELETE /api/v1/me/emergency-contacts/{id}` - Manage personal emergency contacts
- [x] **2. Role Requests (User Side):**
  - [x] `POST /api/v1/role-requests` - Submit role request with claimed code, department, hostel, or evidence
  - [x] `GET /api/v1/role-requests` - List user's role requests
  - [x] `GET /api/v1/role-requests/{id}` - View request details, status, and reviewer notes
  - [x] `PATCH /api/v1/role-requests/{id}` - Respond to `needs_info` state or fix claimed code
  - [x] `POST /api/v1/role-requests/{id}/evidence` - Upload ID card or supporting documentation file
  - [x] `POST /api/v1/role-requests/{id}/cancel` - Cancel pending role request
- [x] **3. Role Approvals (Approver Side):**
  - [x] `GET /api/v1/approvals/role-requests` - Approver queue filtered by status and role
  - [x] `GET /api/v1/approvals/role-requests/{id}` - Request details with automated checks (duplicate code, record match)
  - [x] `POST /api/v1/approvals/role-requests/{id}/approve` - Execute single-transaction role approval (`approve_role_request`)
  - [x] `POST /api/v1/approvals/role-requests/{id}/reject` - Reject request with audit reason
  - [x] `POST /api/v1/approvals/role-requests/{id}/request-info` - Request additional evidence from applicant
  - [x] `POST /api/v1/approvals/role-requests/{id}/reassign` - Reassign approval item to another authorized reviewer
  - [x] `POST /api/v1/approvals/role-requests/bulk-approve` - Bulk approve requests matching pre-verified identities
  - [x] `GET /api/v1/approvals/stats` - Approver queue statistics and average processing time
  - [x] `GET, PUT /api/v1/admin/role-approval-rules` & `/{roleId}` - Configure role requestability and approver matrix
  - [x] `GET, PATCH /api/v1/admin/signup-settings` - Manage registration flags and allowed email domains
  - [x] `POST /api/v1/admin/identities/import` - Import pre-registered student/employee codes into `pre_registered_identities`
  - [x] `POST /api/v1/admin/registrations/purge-stale` - Purge stale accounts without assigned roles after N days
  - [x] `POST /api/v1/admin/users/{id}/set-code` - Set/fix user unique identification code with collision checks
  - [x] `GET /api/v1/admin/users?status=registered,pending_approval,rejected` - Queue of onboarding and rejected users
- [x] **4. Parent Link Flow:**
  - [x] `POST /api/v1/guardian-links` - Submit guardian link request with admission no, DOB match, and relation
  - [x] `GET /api/v1/guardian-links` - List parent's submitted link requests
  - [x] `POST /api/v1/guardian-links/{id}/resend` - Resend link confirmation notification to student
  - [x] `DELETE /api/v1/guardian-links/{id}` - Cancel pending guardian link request
  - [x] `GET /api/v1/me/guardian-requests` - Student inbox of pending parent link requests
  - [x] `POST /api/v1/me/guardian-requests/{id}/confirm` & `POST /api/v1/me/guardian-requests/{id}/reject` - Student confirm/reject guardian link
  - [x] `GET /api/v1/me/guardians` & `DELETE /api/v1/me/guardians/{guardianId}` - View linked guardians and unlink
  - [x] `GET, PUT /api/v1/me/guardians/{guardianId}/consents` - Manage granular data sharing permissions for linked parent
  - [x] `GET /api/v1/admin/guardian-links` - Admin guardian link request management queue
  - [x] `POST /api/v1/admin/guardian-links/{id}/approve` & `/reject` - Admin decisioning on guardian link requests
  - [x] `POST, DELETE /api/v1/admin/students/{id}/guardians` - Direct admin management of student guardians

---

## 🏛️ Phase 9: Extended Campus Operations & Infrastructure (`/api/v1`)
- [x] **1. College Setup & Academic Admin:**
  - [x] `GET, POST /api/v1/admin/academic-years` & `/terms` - Academic year and term configuration
  - [x] `PUT /api/v1/admin/batches/{id}/terms/{termId}` - Map semester sequence numbers to terms per batch
  - [x] `GET, POST /api/v1/admin/periods` - Define daily timetable period slots
  - [x] `GET, POST /api/v1/admin/buildings` & `GET, POST, PATCH /api/v1/admin/locations` - Manage campus, building, floor, room location tree
  - [x] `GET, POST /api/v1/admin/leave-types` - Leave policy types configuration
  - [x] `PUT /api/v1/admin/courses/{id}/subjects` - Assign course curriculum subjects per semester
  - [x] `GET, POST, PATCH /api/v1/admin/subject-offerings` - Assign faculty, section, and term to subject offerings
  - [x] `GET /api/v1/admin/students/{id}/batch-history` - View student department/batch change history
  - [x] `GET /api/v1/admin/students/{id}/status-history` - Track student status transitions (active, suspended, dropped)
  - [x] `GET, POST, DELETE /api/v1/admin/role-conflicts` - Define mutually exclusive role pairs for segregation of duties
- [x] **2. Expanded Student Operations:**
  - [x] `GET /api/v1/invoices` & `GET /api/v1/invoices/{id}` - View fee invoices with itemized charges, balances, and due dates
  - [x] `GET /api/v1/scholarships` & `POST /api/v1/scholarships/{id}/apply` - Browse available scholarships and submit applications
  - [x] `GET /api/v1/me/scholarships` - Track status of applied student scholarships
  - [x] `GET, POST /api/v1/messages` - Official 1:1 messaging channel with assigned mentor or hostel warden
  - [x] `GET /api/v1/me/mentor` - Retrieve assigned mentor details
  - [x] `GET /api/v1/me/warnings` - View disciplinary warnings and posted fines
  - [x] `GET /api/v1/library/reservations` & `DELETE /api/v1/library/reservations/{id}` - Manage book reservations
  - [x] `GET /api/v1/clubs` & `POST /api/v1/clubs/{id}/join` - Explore campus clubs and request membership
  - [x] `GET /api/v1/me/awards` - View earned event awards and digital certificates
  - [x] `GET /api/v1/feedback/pending` - View pending faculty feedback forms
  - [x] `GET /api/v1/me/batch-history` - View own academic batch and branch history
- [x] **3. Library Desk Operations:**
  - [x] `GET, POST, PATCH /api/v1/library/books` & `/authors` - Manage library catalog and author directory
  - [x] `POST /api/v1/library/books/{id}/copies` - Add physical book copies with unique accession numbers
  - [x] `POST /api/v1/library/loans` - Issue book copy loan to student/staff
  - [x] `POST /api/v1/library/loans/{id}/return` & `/renew` - Process book loan return and renewal
  - [x] `GET /api/v1/library/overdue` - Generate overdue book loans report
  - [x] `POST /api/v1/library/fines/post` - Post overdue fines to student fee invoice
  - [x] `POST /api/v1/library/reservations/{id}/fulfil` - Hand over reserved book to user

---

## 💳 Phase 10: Financial, Mess, Exam & Safety Gaps (`/api/v1`)
- [x] **1. Financial Administration:**
  - [x] `GET, POST /api/v1/admin/fee-heads` - Define standard fee heads
  - [x] `PUT /api/v1/admin/fee-structures/{id}/items` - Set line item amounts and due dates per fee structure
  - [x] `POST /api/v1/admin/invoices/generate` - Bulk generate fee invoices for an academic batch
  - [x] `POST /api/v1/admin/invoices/{id}/items` - Append custom charge, fine, waiver, or scholarship line to invoice
  - [x] `POST /api/v1/admin/invoices/{id}/cancel` - Cancel fee invoice with audit reason
  - [x] `POST /api/v1/admin/fines/run` - Trigger manual/scheduled late fee fine assessment run
  - [x] `GET, POST /api/v1/admin/waiver-requests` - Process fee waiver applications
  - [x] `GET /api/v1/admin/student-scholarships` & `POST /api/v1/admin/student-scholarships/{id}/decide` - Review and decide scholarship applications
  - [x] `GET /api/v1/admin/payments/gateway-events` & `POST /api/v1/admin/payments/gateway-events/{id}/replay` - Payment gateway webhook audit log & replay
- [x] **2. Hostel, Mess & Exam Management:**
  - [x] `GET, POST /api/v1/admin/dishes` - Mess dish master catalog
  - [x] `PUT /api/v1/warden/mess/menu/{date}` - Publish daily mess meal menu
  - [x] `POST, PATCH /api/v1/admin/hostels/{id}/rooms/{roomId}/beds` - Manage room bed layout and maintenance status
  - [x] `GET, POST /api/v1/admin/exams/{id}/papers` - Exam schedule and question paper management
  - [x] `POST /api/v1/admin/exam-duties/{id}/decide` - Approve or reject invigilation duty swap request
  - [x] `POST /api/v1/admin/exams/{id}/seating` - Generate automated exam seating plan
- [x] **3. Safety, Health & Medical:**
  - [x] `GET, PUT /api/v1/admin/sos/escalation-steps` - Configure emergency SOS escalation hierarchy and timeout rules
  - [x] `GET, POST, PATCH /api/v1/admin/emergency-directory` - Campus emergency directory (ambulance, clinic, security)
  - [x] `GET, POST /api/v1/safety/cases`, `/responses`, `PATCH /safety/cases/{id}/status` - Disciplinary & safety committee case management
  - [x] `GET, POST /api/v1/counselling/slots` & `GET, PATCH /api/v1/counselling/bookings` - Mental health counselling scheduling
  - [x] `POST, GET /api/v1/medical/visits` & `POST /api/v1/medical/visits/{id}/link-leave` - Nurse clinic visit records and medical leave linking

---

## 🚌 Phase 11: Transport, Activities, Placement & System Governance (`/api/v1`)
- [x] **1. Transport, Extra-Curricular & Placements:**
  - [x] `GET, POST, PATCH /api/v1/admin/vehicles` & `PUT /api/v1/admin/routes/{id}/stops` - Fleet vehicles, drivers, and route stop schedules
  - [x] `POST /api/v1/driver/trips/start`, `/stop` & `POST /api/v1/driver/vehicles/{id}/location` - Driver trip controls and live telemetry streaming
  - [x] `GET, POST, PATCH /api/v1/clubs` & `/clubs/{id}/members` - Manage student clubs, office bearers, and memberships
  - [x] `POST /api/v1/events/{id}/awards` - Issue official event awards and digital certificates
  - [x] `GET, POST /api/v1/placements/companies` - Manage placement company portal profiles
  - [x] `PUT /api/v1/placements/drives/{id}/eligible-courses` - Configure placement drive eligibility rules
  - [x] `PATCH /api/v1/placements/applications/{driveId}/{studentId}` - Shortlist, interview, or select placement candidates
  - [x] `GET, PATCH /api/v1/alumni/profile` - Manage alumni network directory profiles
- [x] **2. System, Compliance & Privacy Governance:**
  - [x] `PATCH /api/v1/notifications/quiet-hours` - User notification quiet hours preference
  - [x] `GET /api/v1/admin/access-logs?subjectId=` - Security & privacy access audit log
  - [x] `GET /api/v1/admin/consents?userId=` - Data processing consent records audit
  - [x] `GET, PUT /api/v1/admin/app-config` - Mobile app force update versioning and maintenance mode toggles
  - [x] `GET, PUT /api/v1/admin/retention` - Data retention and auto-archival policies
  - [x] `GET /api/v1/admin/login-events?risk=` - Anomaly detection login event log

---

## 🔒 Phase 12: Production Security Hardening & Audit Remediation (Completed)
- [x] **1. Real JWT Authentication & Token Security (`SEC-001`)**:
  - [x] Remove hardcoded `mock_jwt_token_` bypass in `backend/src/middleware/auth.ts`
  - [x] Implement production JWT signing/verification utility (`utils/jwt.ts`) with HMAC/RSA signing & expiration
  - [x] Implement access (15m) and refresh (7d) token rotation logic in `routes/auth.ts`
- [x] **2. Secure Password Hashing (`SEC-003`)**:
  - [x] Audit & enforce `Bun.password` / `bcrypt` hashing on registration, password resets, and login verification in `routes/auth.ts`
- [x] **3. Zod Input Validation Layer (`SEC-002`)**:
  - [x] Create Zod schemas in `backend/src/schemas/auth.ts` for login, registration, OTP, and password updates
  - [x] Integrate schema validation across auth & onboarding handlers to block invalid payload formats
- [x] **4. Role & Scope Guard Enforcement (`AUTH-001`, `AUTH-002`)**:
  - [x] Make `requireRoles` mandatory on protected routes
  - [x] Implement row-level and scope isolation guards for student/warden data access
- [x] **5. Automated Security Test Suite (`TEST-001`)**:
  - [x] Create `backend/tests/auth_security.test.ts` covering JWT signature verification, expired tokens, mock token rejection, password hashing, and Zod input validation
  - [x] Verify zero test failures using `bun test` (128 tests passing across 12 test files)

---

## 🛡️ Phase 13: Data Integrity, Error Handling & Request Tracing (Completed)
- [x] **1. Request Correlation IDs & Error Tracking (`REL-001`)**:
  - [x] Implement request correlation ID middleware (`src/middleware/request-logger.ts`) generating unique `x-request-id`
  - [x] Update central error handler in `src/index.ts` to attach `requestId` to responses without exposing raw stack traces
- [x] **2. Structured Logging System (`LOG-001`, `LOG-002`)**:
  - [x] Create structured logger (`src/config/logger.ts`) for JSON-formatted request/response & audit logs
  - [x] Replace console.error calls in core handlers with structured logger calls
- [x] **3. Row-Level & Scope Access Isolation (`AUTH-002`, `AUTH-003`)**:
  - [x] Implement `verifyStudentScope`, `verifyWardenHostelScope`, `verifyParentChildScope` guards in `src/guards/scope.ts`
  - [x] Apply scope isolation across hostel, department, student, and faculty route modules to eliminate IDOR risks

---

## 🏗️ Phase 14: Business Logic Abstraction & Service Layer Refactoring (Completed)
- [x] **1. Service Layer Architecture (`ARCH-001`)**:
  - [x] Create `src/services/` directory (`student.service.ts`, `warden.service.ts`, `faculty.service.ts`, `parent.service.ts`, `admin.service.ts`)
  - [x] Extract business & domain logic out of route handlers into reusable service methods
- [x] **2. Data Access & Repository Layer (`ARCH-001`, `PERF-001`)**:
  - [x] Optimize Prisma queries with proper includes and batching
- [x] **3. Comprehensive Zod Schemas across All Route Domains (`SEC-002`)**:
  - [x] Expand Zod validation schemas (`schemas/student.ts`, `schemas/warden.ts`, `schemas/faculty.ts`, `schemas/admin.ts`, `schemas/parent.ts`)
  - [x] Integrate input validation across route modules

---

## 🛠️ Phase 14.1: Database Schema Field Synchronization & Type Error Remediation
- [x] **1. Scope Guard Remediation (`scope.ts`)**:
  - [x] Update `verifyParentChildScope` in `src/guards/scope.ts` to directly query `student_guardians` by `student_id` and `guardian_id`
- [x] **2. Admin Service Field Synchronization (`admin.service.ts`)**:
  - [x] Align `decideNameCorrection` to update `decided_by` and `decided_at` matching `name_correction_requests` schema
- [x] **3. Faculty Service Field Synchronization (`faculty.service.ts`)**:
  - [x] Align `decideAttendanceDispute` to update `decided_by` and `decided_at` matching `attendance_disputes` schema
  - [x] Align `gradeSubmission` to update `marks`, `graded_by`, and `graded_at` matching `assignment_submissions` schema
- [x] **4. Warden Service Field Synchronization (`warden.service.ts`)**:
  - [x] Align `acknowledgeSos` to update `status: 'acknowledged'` on `sos_incidents` and log entry to `sos_updates`
- [x] **5. Verification & End-to-End Type Safety**:
  - [x] Run `bunx tsc --noEmit` and `bun test` to ensure 0 compilation errors and 100% passing test suite

---

## ⚡ Phase 15: Security & Resource Management Tuning (Completed)
- [x] **1. Endpoint Rate Limiting (`SEC-004`)**:
  - [x] Create IP & user rate-limiting middleware (`src/middleware/rate-limit.ts`)
  - [x] Apply rate limits to `/auth/login` (10 attempts / 15m), `/auth/otp/send` (5 attempts / hr), and `/auth/register` (5 attempts / hr)
  - [x] Add `Retry-After` headers and standard HTTP 429 response handling
- [x] **2. File Upload Security Hardening (`SEC-006`)**:
  - [x] Enforce size limits (max 10MB) and MIME whitelist validation on file upload handlers in `src/routes/shared.ts`
  - [x] Calculate SHA256 checksum and log scan status (`clean`, `pending`, `infected`) in DB
- [x] **3. Connection Pooling, Query Timeouts & Graceful Shutdown (`DB-002`, `DB-003`, `OPS-001`)**:
  - [x] Configure Prisma connection pool parameters (`connection_limit=10..20`, `idle_timeout=30s`) & 30s query execution timeouts in `src/config/prisma.ts`
  - [x] Add SIGTERM/SIGINT signal listeners in `src/index.ts` to drain database connections gracefully on process termination
- [x] **4. Runtime Environment & Secrets Validation (`SEC-005`)**:
  - [x] Create environment variable validation module (`src/config/env.ts`) using Zod to validate `DATABASE_URL`, `JWT_SECRET`, `PORT`, `NODE_ENV` at application boot

---

## 🧪 Phase 16: Extended Test Coverage & Integration Verification (Completed)
- [x] **1. Service Unit Tests (`TEST-001`)**:
  - [x] Create unit tests under `tests/unit/` (`services.test.ts`, `utils.test.ts`)
  - [x] Unit test security & helper functions (`utils/jwt.ts`, `utils/password.ts`, `utils/response.ts`)
- [x] **2. Domain Route Integration Tests (`TEST-001`)**:
  - [x] Create integration tests under `tests/integration/` (`campus_ops.test.ts`, `finance_health.test.ts`, `transport_placements.test.ts`)
- [x] **3. Scope Security & Authorization Edge-Case Tests**:
  - [x] Write security tests verifying scope isolation, IDOR prevention, and role access rejection (`scope_security.test.ts`, `auth_security.test.ts`, `rate_limit_security.test.ts`)
- [x] **4. API Contract & OpenAPI Schema Tests**:
  - [x] Validate response structure compliance (`{ success: true, data, requestId }`) and error handling across endpoints (186/186 tests passing)

---

## 🚀 Phase 17: Containerization & CI/CD Deployment Infrastructure (Completed)
- [x] **1. Multi-Stage Docker Build (`DEPLOY-001`)**:
  - [x] Write production-optimized multi-stage `Dockerfile` for Bun + Elysia backend (`backend/Dockerfile`)
  - [x] Create `docker-compose.yml` orchestrating API server, PostgreSQL DB, and Redis cache containers (`backend/docker-compose.yml`)
- [x] **2. Environment Configuration & Tooling**:
  - [x] Create `.env.example` detailing required environment variables (`DATABASE_URL`, `JWT_SECRET`, `PORT`, `NODE_ENV`, `CORS_ORIGIN`)
  - [x] Create `.eslintrc.json` and `.prettierrc` for code quality & formatting consistency
- [x] **3. CI/CD Pipeline Setup (`DEPLOY-001`)**:
  - [x] Create GitHub Actions workflow (`.github/workflows/ci.yml`) running type checks (`bunx tsc --noEmit`) and automated tests (`bun test`)
- [x] **4. Deployment Documentation & Runbooks**:
  - [x] Create `deployment/README.md` detailing setup guides, database migration steps, rollback procedures, and health check runbooks

---

## 🏎️ Phase 18: Performance Optimization & Caching Layer (Completed)
- [x] **1. Query Optimization & Index Verification (`PERF-001`)**:
  - [x] Audit Prisma queries across all route modules to eliminate N+1 query bottlenecks using proper `include` batching
  - [x] Verify database indexes on foreign keys and partial unique indexes
- [x] **2. Static Reference Data Caching (`PERF-002`)**:
  - [x] Implement caching layer for frequently accessed static reference data (departments, courses, academic years, fee heads) via `CacheService` (`src/services/cache.service.ts`)

---

## 📋 Phase 19: Pre-Flight Production Release Audit Checklist (Completed)
- [x] **1. Type Safety & Test Pass Verification**:
  - [x] Confirm 0 TypeScript compilation errors using `bunx tsc --noEmit`
  - [x] Confirm 100% test pass rate across unit, integration, and security test suites using `bun test` (188/188 passing across 20 files)
- [x] **2. Production Health & Log Audit**:
  - [x] Verify correlation IDs (`x-request-id`) in all structured log lines and HTTP responses
  - [x] Execute pre-flight deployment check and verify production readiness



