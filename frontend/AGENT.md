# Frontend AGENT Guidelines

Permission scope: Web frontend development under `d:\APP_DEV\PS7\frontend\web`.

## Core Development Rules
- Pages compose only. Components render only. Hooks hold logic. api.ts calls the server. schema.ts holds Zod.
- SSOT: API types are generated. Roles, routes, statuses, limits and labels live in src/config.
- No hardcoded values and no magic numbers. Named constants, env values, or i18n text.
- DRY, KISS, SOLID. Reuse shared components before creating new ones.
- Tailwind theme tokens only. No raw hex colors.
- Access token in memory only. Refresh uses the httpOnly cookie (x-client: web, credentials include). Never log tokens, passwords or OTPs.
- Every list has loading, empty and error states. Create actions use an idempotency key and block double submit.
- Missing endpoint or field: add one line to BACKEND_GAPS.md and use a typed mock. Never invent endpoints.
