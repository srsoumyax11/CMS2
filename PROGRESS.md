# Progress Ledger & Status Report

## Current Status: Milestone 4 Remediation & Milestone 5a Completed (Warden & Faculty)

### Milestone 4 Remediation (Real API Wiring & Queue Hardening)
- **Offline Queue Persistence**: Added `PersistentStorageAdapter` supporting localStorage/web and file storage with fallback, verified app-restart single-flight sync test.
- **Attendance Code Rule**: Blocked offline queueing of 6-digit rotating attendance codes, displaying `"Connect to mark attendance"`. Dynamic warning threshold loaded from backend summary with config fallback.
- **File Upload Security**: Enforced signed URL flow (`POST /api/v1/files/upload-url`), removed `example.com`, enforced size (`10MB`) and MIME limits from `appConfig`.
- **Payment Verification**: Displayed student name before payment, re-read payment status from backend after gateway return, disabled double submit.

### Milestone 5a: Warden & Faculty Features
- **Warden Outpass Approval Inbox**: Built `OutpassApprovalInbox` with mandatory rejection reason modal and overdue list (`GET /api/v1/warden/outpasses/overdue`).
- **Warden SOS Live Monitor**: Built `SosControlRoom` with single-flight acknowledge (`POST /api/v1/warden/sos/{id}/acknowledge`), update logs, escalation, and closure.
- **Warden Complaints Board**: Built `ComplaintsBoard` with assignment, status updates, and comment feed.
- **Faculty Timetable & Attendance Control**: Built `FacultyTimetable` and `AttendanceSessionControl` with 6-digit rotating code generation, auto-refresh before expiry, countdown timer, and `DisputeInbox`.
- Verified 100% clean typecheck (`pnpm typecheck` passed 8/8) and unit tests (`pnpm test` passed 17/17 test suites, 56 tests).


