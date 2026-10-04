# Backend Gaps & API Interface Log

This log tracks missing endpoints, shape mismatches, missing fields, or realtime capabilities required by the frontend as specified in `frontendPrompt.md`.

---

## Identified Backend Gaps & Status

| Gap ID | Feature / Screen | Description / Missing Capability | Resolution & Implementation Status |
|---|---|---|---|
| **GAP-001** | Driver Telemetry & Live Bus Tracking | Real-time WebSocket connection for live vehicle coordinate updates. | **[RESOLVED]** Native ElysiaJS WebSocket `.ws('/driver/vehicles/:id/location')` and `realtimePubSub` engine implemented in `src/routes/transport_placements.ts`. |
| **GAP-002** | Live SOS Incident Push Notifications | Real-time push alert to active Warden control room when SOS is triggered. | **[RESOLVED]** Native ElysiaJS WebSocket `.ws('/warden/sos/stream')` and `sos:alert` broadcast implemented in `src/routes/warden.ts` and `StudentService`. |
| **GAP-003** | Anonymous Disciplinary & Safety Reports | Endpoint for anonymous complaint submission without user ID tracing. | **[RESOLVED]** Implemented `POST /api/v1/safety/reports/anonymous` in `src/routes/finance_health.ts` storing reports with `complainant_id: null`. |
| **GAP-004** | Web Auth & httpOnly Cookie Refresh | Web browser security requires refresh tokens in `httpOnly`, `SameSite=Strict` cookies to prevent XSS theft. | **[RESOLVED]** Backend updated with `x-client: web` header detection and HttpOnly cookie rotation in `src/routes/auth.ts` and `src/utils/session.ts`. Frontend `@campus/api-client` uses in-memory access tokens with `credentials: 'include'`. |

---

## Endpoint Contract Summary
All backend endpoints strictly return the standardized `ApiResponse` structure:
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  requestId?: string;
  timestamp: string;
}
```
All errors attach HTTP status codes (400, 401, 403, 404, 429, 500) and an `x-request-id` header for correlation tracing.
