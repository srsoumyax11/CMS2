# Web Project Architecture & Engineering Rules (AGENTS.md)

Always strictly follow these core rules for all web application development:

1. **Separation of Concerns**:
   - **Pages**: Compose components, hooks, and layouts only. No direct state or complex render logic.
   - **Components**: Render UI layout and handle presentation only.
   - **Hooks**: Encapsulate all state management and business logic.
   - **`api.ts` / `apiClient.ts`**: Handle HTTP network requests and server communication only.
   - **`schema.ts`**: Define and export all Zod validation schemas.

2. **Single Source of Truth (SSOT)**:
   - **API Types**: Generated automatically via `bun run api:types` into `src/types/api.d.ts`. Never edit by hand.
   - **Config Values**: All user roles, application routes, entity statuses, limits, and UI labels live strictly under `src/config/`.

3. **No Hardcoded Values & No Magic Numbers**:
   - Every constant, limit, timeout, or key must be defined in `src/config/constants.ts` or derived from `env.ts`.
   - All text strings displayed to users must be referenced via i18n (`src/i18n/en.json`).

4. **Software Principles**:
   - **DRY, KISS, SOLID**: Reuse existing shared components (`src/components`) before creating new abstractions. Keep functions focused and components thin.

5. **Styling & Design System**:
   - Use Tailwind CSS theme tokens and CSS variables only (`src/styles/tokens.css`). Never use raw inline hex colors or arbitrary non-token values.

6. **Authentication & Security**:
   - Access tokens live **in memory only** (`src/lib/auth.ts`). Never save tokens, passwords, or sensitive keys to `localStorage` or `sessionStorage`.
   - Token refresh uses `httpOnly` cookies (`credentials: 'include'`) and `x-client: web` request headers.
   - **Never log** access tokens, refresh tokens, passwords, or OTPs.

7. **UI Component States & Idempotency**:
   - Every data list view MUST explicitly support **Loading**, **Empty**, and **Error** states.
   - All form creation / mutation actions MUST pass a unique `x-idempotency-key` and block duplicate user submit triggers.

8. **Backend Gaps Handling**:
   - If an endpoint or schema field is missing on the server, append a single record to `BACKEND_GAPS.md` and use a typed mock layer. Never invent unapproved endpoint contracts.
