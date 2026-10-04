# Project Rules & Workspace Guidelines

> [!IMPORTANT]
> **CURRENT SCOPE: BACKEND ONLY**
> Frontend development is currently paused/out of scope. Focus exclusively on the Bun + ElysiaJS + Prisma + PostgreSQL backend under `backend/`.
> 
> **MANDATORY RULE**: ALWAYS make a structured implementation plan (in `tasks.md` or plan artifact) BEFORE writing any code.

## Tech Stack
- **Backend**: Bun + ElysiaJS (TypeScript)
- **Database & Auth**: Supabase (Local Docker via CLI) + Prisma ORM
- **API Documentation**: `@elysiajs/swagger` at `/swagger`
- **Testing**: `bun test` (Native Bun Test Runner)
- **Frontend (PAUSED - OUT OF SCOPE FOR CURRENT PHASES)**: React Native + Expo (TypeScript)


## Core Architectural & Engineering Principles (MANDATORY)
2. **DRY (Don't Repeat Yourself)**: Reuse shared utilities, Prisma types, shared UI elements (`components/ui/`), and error handling across routes, services, and views.
3. **KISS (Keep It Simple, Stupid)**: Keep controller handlers and UI components thin, presentational, and straightforward. Delegate business logic to dedicated service layers or custom hooks (`useAuth`, `useWardenData`).
4. **SOLID**:
   - **Single Responsibility**: Each route file, service module, and screen component must handle one specific domain/concern. Separate layout orchestration from custom query hooks and form validation schemas.
   - **Open/Closed**: Design routes, services, and UI components using clear TypeScript props/variants (e.g., `variant="primary" | "secondary"`) so new features can be added without altering core contracts or layouts.
   - **Liskov Substitution & Interface Segregation**: Use strict TypeScript interfaces for request DTOs, responses, and component props. Avoid passing wide, untyped `any` objects.
   - **Dependency Injection**: Use Elysia's `.decorate()` or context injection for backend services, and React Contexts strictly for global providers (Auth, Theme, QueryClient) injected at root (`app/_layout.tsx`).
5. **SSOT (Single Source of Truth)**:
   - **Backend**: The PostgreSQL database via Prisma is the sole source of truth for schema types and entity states.
   - **Frontend Types & State**: Use Eden Treaty to ensure backend API request/response types drive the frontend data model directly. Server data belongs in React Query cache; local app state belongs in Zustand. Never hardcode duplicate interfaces for backend entities.
6. **SWOT Analysis in Design**: Evaluate performance impacts, bundle size, and native rendering limitations before introducing new dependencies or major architectural changes.

## Development & Mobile Conventions
1. **Expo Router Conventions**: Follow strict file-based routing protocols inside `app/`. Group features using layout groups (`app/(auth)/`, `app/(student)/`, `app/(admin)/`, `app/(tabs)/`).
2. **Safe Area & Platform Handling**: Always use `SafeAreaView` from `react-native-safe-area-context` to handle notches and device cutouts. Use the `Platform` API explicitly when modifying styles or behaviors for iOS vs. Android.
3. **Robust Image & Asset Management**: Cache local graphics and icons properly. Use optimized native image wrappers (like `expo-image`) to prevent memory leaks and dropped frames during rendering.

## Task Tracking, Testing & Quality Conventions
1. **Mandatory OpenAPI / Swagger Documentation**: Whenever researching, adding, or updating any backend route or endpoint contract, you MUST document all request bodies, query params, and response DTO schemas so `/swagger` and `/swagger/json` remain 100% complete.
2. **Unified Task Control**: Always maintain `tasks.md` in the project root (`d:\APP_DEV\PS7\tasks.md`). Update `tasks.md` immediately upon completing any set of backend tasks or frontend UI flows (`[x]`).
2. **Synchronized Command Maps**: Keep `common_cmd.md` updated whenever new dev workflows or commands are added (e.g., clearing Metro cache, building production APKs/IPAs, running local emulation).
3. **Strict TypeScript & Explicit Error Handling**: Maintain strict TypeScript types and explicit status code error handling across backend and frontend code.
4. **Comprehensive Automated Testing (MANDATORY)**:
   - **Backend**: After building any API route or service, write automated tests using `bun test` in `backend/tests/`. Tests MUST cover valid real-life user flows as well as edge cases: uncleaned inputs, invalid formats, missing required fields, non-existent UUIDs, duplicate keys, and unauthorized access.
   - **Frontend**: After building any screen flow, feature hook, or form validation, write automated tests in `frontend/tests/`. Tests MUST cover component behavior during API loading/error states, invalid input validation warnings, guest access redirects, and token expiration recovery.
   - Always verify zero test failures before declaring completion.
5. **Schema & Migration Synchronization (MANDATORY)**: Whenever modifying raw SQL schema files (`campus_schema.sql`) or database migrations, ALWAYS update the Prisma ORM schema and re-run `bunx prisma generate` / `bunx prisma db pull --force` so fresh database setups run cleanly without type or parameter binding errors.
6. **End-to-End Type Safety Verification (MANDATORY)**: Whenever the backend schema or API contract changes, pull fresh types and run `bunx tsc --noEmit` on the frontend and backend. Resolve all compilation, broken component props, and contract breaking changes immediately.
7. **Root Cause Analysis & Architectural Optimization (MANDATORY)**: Whenever encountering recurring bugs, memory leaks, slow list scrolling, process file locks, or auth state edge cases, identify the structural root cause as a senior architect. Document the root cause and mitigation, and implement structural fixes (such as implementing `FlashList` or fixing token storage race conditions) to prevent performance decay.
8. **Post-Refactoring Quality & Type Check (MANDATORY)**: After completing significant structural or feature changes, inspect IDE diagnostics and execute TypeScript type checking (`tsc --noEmit`) to verify zero compilation errors across all screen layers and backend routes.

