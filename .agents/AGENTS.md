# Project Rules & Workspace Guidelines

## Tech Stack
- **Frontend**: React Native + Expo (TypeScript)
- **Backend**: Bun + ElysiaJS (TypeScript)
- **Database & Auth**: Supabase (Local Docker via CLI) + Prisma ORM
- **API Documentation**: `@elysiajs/swagger` at `/swagger`
- **Testing**: `bun test` (Native Bun Test Runner)

## Core Architectural & Engineering Principles (MANDATORY)
1. **YAGNI (You Aren't Gonna Need It)**: Do not write speculative code or unnecessary abstractions. Build exactly what is needed for the current active task.
2. **DRY (Don't Repeat Yourself)**: Reuse shared utilities, Prisma types, and error handling across routes and services.
3. **KISS (Keep It Simple, Stupid)**: Keep controller handlers thin and straightforward. Delegate business logic to dedicated service layers.
4. **SOLID**:
   - **Single Responsibility**: Each route file and service module must handle one specific domain (Auth, Student, Warden, Faculty, Parent, Admin).
   - **Open/Closed**: Design routes and services so new features can be added via new endpoints or plugins without breaking existing contracts.
   - **Liskov Substitution & Interface Segregation**: Use strict TypeScript interfaces for request DTOs and responses.
   - **Dependency Injection**: Use Elysia's `.decorate()` or context injection for Prisma, logger, and auth services.
5. **SSOT (Single Source of Truth)**: The PostgreSQL database via Prisma is the sole source of truth for schema types and entity states.
6. **SWOT Analysis in Design**: Evaluate Strengths, Weaknesses, Opportunities, and Threats when introducing new dependencies or major architectural changes.

## Development & Task Tracking Conventions
1. Always maintain `tasks.md` in the project root (`d:\APP_DEV\PS7\tasks.md`).
2. `tasks.md` MUST use Markdown checkboxes (`[ ]` for pending, `[x]` for completed).
3. **Update `tasks.md` immediately after completing any set of tasks or features.**
4. Keep `common_cmd.md` updated whenever new dev workflows or commands are added.
5. Maintain strict TypeScript types and explicit status code error handling across backend code.
6. **Comprehensive Automated Testing (MANDATORY)**: After building any API route or service, write automated tests using `bun test` in `backend/tests/`. Tests MUST cover valid real-life user flows as well as edge cases: uncleaned inputs, invalid formats, missing required fields, non-existent UUIDs, duplicate keys, and unauthorized access. Always run `bun test` to verify zero failures before declaring completion.
7. **Schema & Migration Synchronization (MANDATORY)**: Whenever modifying raw SQL schema files (`campus_schema.sql`) or database migrations, ALWAYS update the Prisma ORM schema and re-run `bunx prisma generate` / `bunx prisma db pull --force` so that fresh database setups (`supabase db reset`) or new environments run cleanly without type or parameter binding errors.
8. **Root Cause Analysis & Architectural Bug Prevention (MANDATORY)**: Whenever encountering recurring or repeated bugs (e.g. database binary format mismatches, process file locks, or auth state edge cases), identify the root cause as a senior architect/engineer. Formulate a clear plan, document the root cause and mitigation, and implement structural fixes to prevent recurrence.
9. **Post-Refactoring Quality & Type Check (MANDATORY)**: After completing significant structural or feature changes, inspect IDE diagnostics and execute TypeScript type checking to verify zero compilation errors and resolve any underlying bugs.
