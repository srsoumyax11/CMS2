# Backend Gaps Ledger

| Gap ID | Feature / Component | Expected Endpoint / Contract | Current Workaround / Mock |
|---|---|---|---|
| GAP-001 | Documents | GET/POST `/student/documents` | Typed Zod mock in `DocumentApplyScreen.tsx` |
| GAP-002 | Hostel Extras | GET/POST `/hostel/my-room`, `/hostel/mess-menu`, `/hostel/lost-and-found` | Typed Zod mock in `HostelExtrasScreen.tsx` |
| GAP-003 | Anonymous Report | POST `/support/anonymous-report` | Feature flag `enableAnonymousReport` disabled by default in `SupportScreen.tsx` |
| GAP-004 | Web Token Restore | `httpOnly` cookie for `/auth/refresh` | In-memory token storage fallback on web in `tokenStore.ts` |
| GAP-005 | Campus Services | GET/POST `/campus/library`, `/campus/gym`, `/campus/canteen`, `/campus/bus/live` | Typed polling & search mock in `CampusServicesScreen.tsx` |
| GAP-006 | Activities | GET/POST `/activities/events`, `/activities/clubs`, `/activities/placements` | Typed Zod mock in `ActivitiesScreen.tsx` |
| GAP-007 | Privacy Controls | GET/POST `/privacy/parent-links` | Typed Zod mock in `PrivacySettingsScreen.tsx` |
| GAP-008 | Staff & Admin Depth | GET/POST `/faculty/*`, `/warden/*`, `/admin/*`, `/parent/*` | Typed Zod mocks in `FacultyDepthScreen.tsx`, `WardenDepthScreen.tsx`, `AdminDepthScreen.tsx`, `ParentDepthScreen.tsx` |
| GAP-009 | Attendance Warning Threshold | `GET /student/attendance/summary` field `warningThreshold` | Uses `summary.warningThreshold` first, falling back to `appConfig.attendanceThreshold` (75%) if unpopulated |

