# Campus CMS - Web Frontend

A modern, web-only frontend application built with Vite, React, TypeScript, Bun, Tailwind CSS, TanStack Query, and React Hook Form.

## Prerequisites

- [Bun](https://bun.sh) (v1.0 or higher)

> **Important**: Use `bun` exclusively for package management and script execution. Do not use `npm`, `yarn`, or `pnpm`.

## Quick Start & Commands

### 1. Installation
Install project dependencies using Bun:
```bash
bun install
```

### 2. Development Server
Start the Vite local development server:
```bash
bun run dev
```

### 3. TypeScript Type Checking
Execute full strict TypeScript compilation check:
```bash
bun run typecheck
```

### 4. Code Linting
Run ESLint flat config code checks:
```bash
bun run lint
```

### 5. Automated Tests
Run Vitest unit and integration test suite:
```bash
bun run test
```

### 6. Production Build
Compile TypeScript and generate optimized production bundle in `dist/`:
```bash
bun run build
```

### 7. Preview Production Build
Preview the production build locally:
```bash
bun run preview
```

### 8. Generate OpenAPI API Types
Fetch the OpenAPI specification from the backend Swagger endpoint (`http://localhost:3000/swagger/json`) and generate TypeScript types into `src/types/api.d.ts`:
```bash
bun run api:types
```

## Project Architecture

- **`src/app`**: Application router, root providers, and layout frames.
- **`src/pages`**: Composition pages rendering features and layouts.
- **`src/features`**: Feature modules (`auth`, `onboarding`, `outpass`, `complaints`, `fees`, `attendance`, `sos`, `approvals`).
- **`src/components`**: Shared atomic UI components.
- **`src/lib`**: Utilities (`apiClient`, `auth`, `logger`, `utils`).
- **`src/config`**: Single source of truth configuration files (`env.ts`, `routes.ts`, `roles.ts`, `permissions.ts`, `constants.ts`, `statuses.ts`).
- **`src/i18n`**: Localization strings (`en.json`).
- **`src/styles`**: Design system tokens (`tokens.css`).
- **`src/types`**: Generated API types (`api.d.ts`).
