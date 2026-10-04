# Backend Gaps Ledger

This file tracks missing API endpoints, missing fields, or contract mismatches discovered during web development.

| Date | Feature | Endpoint / Field Missing | Description / Typed Mock Used | Status |
| ---- | ------- | ------------------------ | ----------------------------- | ------ |
| 2026-10-04 | Auth / Onboarding | Swagger OpenAPI Types | Response Schema Audit: **88 operations** have real non-`never` response schemas in `api.d.ts` (out of 164 routes). 194 response schemas have `content?: never`. Feature Zod schemas placed in `src/features/*/schema.ts` for strict client validation. | Audited |
| 2026-10-04 | Role Forms | `/api/v1/auth/role-request` fields | Backend role-request payload accepts `userId`, `roleCode`, `claimedCode`, `departmentId`, `hostelId`. UI fields `registrationNumber`, `course`, `admissionYear`, and `evidenceUrl` are not stored in raw role-request body; UI logs them as client metadata without sending unaccepted fields. | Audited / OK |
