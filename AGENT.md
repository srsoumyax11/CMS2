# AGENT.md — Development & Engineering Directives

## Primary Focus Directive
> [!IMPORTANT]
> **BACKEND FOCUS ONLY**: We are **NOT** creating or modifying the frontend at this time. Focus exclusively on the **Bun + ElysiaJS + Prisma ORM + PostgreSQL** backend codebase under `backend/`.

---

## Mandatory Engineering Directives

### 1. Mandatory Implementation Planning
- **Plan Before Execution**: BEFORE making any code or architectural changes, ALWAYS construct a structured, step-by-step implementation plan.
- **Task Alignment**: Update `tasks.md` or create a plan artifact detailing design decisions, files affected, security considerations, schema impacts, and testing requirements before touching code.
- **Verification Criteria**: Every plan step must include concrete verification criteria (e.g., specific `bun test` commands or type checks).

### 2. Core Architectural & Design Principles
- **SWOT Analysis in Design**: Evaluate Strengths, Weaknesses, Opportunities, and Threats (performance impacts, security risks, connection pool load, maintenance burden) before introducing new libraries or architectural patterns.
- **DRY (Don't Repeat Yourself)**: Re-use validation schemas, Prisma models, error formatting utilities, auth guards, and service methods.
- **KISS (Keep It Simple, Stupid)**: Keep route handlers thin and presentational. Delegate business logic to dedicated service layers (`services/`) and data operations to repositories/helpers (`repositories/`).
- **SOLID Principles**:
  - **Single Responsibility**: Each route file, service module, schema definition, and test suite must handle exactly one domain concern.
  - **Open/Closed**: Design routes, services, and middleware to be easily extended without modifying core routing infrastructure.
  - **Liskov Substitution & Interface Segregation**: Use strict TypeScript interfaces for request bodies, query params, DTOs, and context objects. Avoid untyped `any` objects.
  - **Dependency Injection**: Use Elysia's `.decorate()` or context injection for database clients, loggers, and services.
- **SSOT (Single Source of Truth)**:
  - The PostgreSQL database schema via **Prisma ORM** is the sole source of truth for entity types and data models.
  - Backend request/response DTOs must drive API contract definitions. Never duplicate interface definitions manually.
- **YAGNI (You Aren't Gonna Need It)**: Build strictly what is required for the active task. Avoid speculative features or dead code.

---

## Backend Codebase Standards & Workflow

### Stack Specifications
- **Runtime**: Bun (`bun run src/index.ts`)
- **Web Framework**: ElysiaJS
- **Database & ORM**: PostgreSQL + Prisma ORM (`prisma/schema.prisma`)
- **API Documentation**: `@elysiajs/swagger` (accessible at `/swagger`)
- **Testing Runner**: Bun Test (`bun test`)

### Quality & Testing Conventions
1. **Mandatory OpenAPI / Swagger Documentation**: Whenever researching, adding, or updating any API route or data contract, you MUST document all request payloads, query params, and response DTO envelopes in Elysia route options (`detail: { tags: [...], summary: '...' }` and `response: defaultResponses`).
2. **Strict Validation**: Every API endpoint MUST validate inputs using Zod schemas before reaching business logic or Prisma queries.
2. **Security First**: 
   - No mock authentication tokens. Real signed JWTs only.
   - Enforce explicit role and scope guards (`requireRoles`, row-level access control) on all protected routes.
   - Hash passwords securely with bcrypt / `Bun.password`.
3. **Automated Testing (MANDATORY)**:
   - Write automated tests under `backend/tests/` using `bun test` for every route and service built.
   - Tests must cover: valid happy paths, invalid input format, missing required fields, non-existent UUIDs, unauthorized role access, and edge case failures.
4. **Schema & Migration Alignment**: Whenever database tables or SQL schemas change, update `schema.prisma` and run `bunx prisma generate`.
5. **Mandatory Type Check Verification**: Run `bunx tsc --noEmit` in `backend/` after every implementation step and refactoring pass to verify 0 compilation errors across all services, routes, schemas, and test files. Zero type errors is mandatory before declaring completion.
6. **Task Control**: Update `tasks.md` immediately upon completing any implementation sub-task (`[x]`).
