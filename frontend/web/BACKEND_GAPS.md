# Backend Gaps Ledger

This file tracks missing API endpoints, missing fields, or contract mismatches discovered during web development.

| Date | Feature | Endpoint / Field Missing | Description / Typed Mock Used | Status |
| ---- | ------- | ------------------------ | ----------------------------- | ------ |
| 2026-10-04 | Auth / Onboarding | Swagger OpenAPI Types | Response Schema Audit: **88 operations** have real non-`never` response schemas in `api.d.ts` (out of 164 routes). 194 response schemas have `content?: never`. Feature Zod schemas placed in `src/features/*/schema.ts` for strict client validation. | Audited |
| 2026-10-04 | Attendance | `/api/v1/student/attendance/summary` | Response schema omits `minimumThreshold`; frontend uses `APP_CONSTANTS.DEFAULT_ATTENDANCE_WARNING_THRESHOLD` (75%) as fallback. | Audited |
| 2026-10-04 | Data Table | List endpoints (`/api/v1/warden/outpasses`, `/api/v1/complaints`) | List routes accept `limit`, `offset`, `status` but omit dynamic full-text `search` and `sort` query parameters; frontend handles filtering via client-side fallbacks when backend omits param support. | Audited |
| 2026-10-04 | Admin Notices | `/api/v1/admin/notices/approval-queue` | Backend lacks dedicated notice approval/recall workflow endpoint; notice governance uses `adminNoticesResource` with mock fallback. | Audited |
