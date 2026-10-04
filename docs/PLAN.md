# Campus App Frontend Architecture & Implementation Plan

> **Specification**: Based on `frontendPrompt.md`
> **Status**: Milestone 1 Initialization

---

## 1. Monorepo Directory Tree

```
d:\APP_DEV\PS7\
├── apps/
│   └── app/                        # Expo App (Expo Router, thin screens, platform entrypoints)
│       ├── app/                    # File-based routes
│       │   ├── _layout.tsx         # Global Providers (QueryClient, Auth, Theme, i18n)
│       │   ├── (auth)/             # Auth & Onboarding stack
│       │   │   ├── login.tsx
│       │   │   ├── register.tsx
│       │   │   ├── otp.tsx
│       │   │   └── onboarding.tsx
│       │   ├── (tabs)/             # Main app shell & persona dashboards
│       │   ├── (student)/          # Student feature screens
│       │   ├── (faculty)/          # Faculty feature screens
│       │   ├── (warden)/           # Warden feature screens
│       │   ├── (parent)/           # Parent feature screens
│       │   ├── (admin)/            # Admin feature screens
│       │   └── +not-found.tsx
│       ├── index.js
│       ├── app.json
│       ├── metro.config.js
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── api-client/                 # Typed API client & query hooks derived from backend OpenAPI
│   │   ├── src/
│   │   │   ├── client.ts           # Axios / fetch wrapper with Bearer token & refresh
│   │   │   ├── endpoints/          # Grouped API calls (auth, student, warden, etc.)
│   │   │   └── hooks/              # TanStack Query custom hooks
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── design-tokens/              # Core design tokens (colors, spacing, radius, typography, motion)
│   │   ├── src/
│   │   │   ├── colors.ts
│   │   │   ├── spacing.ts
│   │   │   ├── typography.ts
│   │   │   ├── theme.ts            # Light & Dark theme definitions
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui/                         # Pure presentational React Native & Web primitives
│   │   ├── src/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   ├── Sheet/
│   │   │   ├── StatusTimeline/
│   │   │   ├── DataList/
│   │   │   ├── EmptyState/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── features/                   # Feature-based domain logic and screens
│   │   ├── auth/
│   │   ├── outpass/
│   │   ├── attendance/
│   │   ├── complaints/
│   │   ├── fees/
│   │   └── index.ts
│   ├── config/                     # Typed appConfig, feature flags, permissions, routes
│   │   ├── src/
│   │   │   ├── appConfig.ts
│   │   │   ├── permissions.ts
│   │   │   └── index.ts
│   ├── logger/                     # Redacting logger wrapper with Sentry integration
│   │   ├── src/
│   │   │   └── index.ts
│   ├── i18n/                       # Translations (English, Hindi, Odia)
│   │   ├── src/
│   │   │   ├── en.json
│   │   │   ├── hi.json
│   │   │   ├── or.json
│   │   │   └── index.ts
│   └── utils/                      # Pure helper functions (date, currency, validators)
│       ├── src/
│       │   └── index.ts
├── docs/
│   ├── PLAN.md                     # Architecture plan (this file)
│   ├── PROGRESS.md                 # Milestone tracking ledger
│   └── BACKEND_GAPS.md             # Backend gaps & requested API enhancements
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
└── tsconfig.json
```

---

## 2. Chosen Package Stack & Target Versions

| Category | Package | Version | Purpose |
|---|---|---|---|
| Framework | `expo` | Latest Stable (pinned by `expo install`) | Universal cross-platform mobile & web SDK |
| Core | `react` / `react-native` | Latest (pinned by `expo install`) | React Native cross-platform engine |
| Navigation | `expo-router` | Latest (pinned by `expo install`) | File-based typed routing |
| Async State | `@tanstack/react-query` | Latest (`^5.x`) | Query caching, invalidation & offline sync |
| App State | `zustand` | Latest (`^4.x` / `^5.x`) | Lightweight session & UI state |
| Forms & Validation | `react-hook-form` / `zod` | Latest | Form handling & SSOT schema validation |
| Secure Storage | `expo-secure-store` | Latest (pinned by `expo install`) | Mobile secure token persistence |
| Storage | `expo-sqlite` / `@react-native-async-storage/async-storage` | Latest (pinned by `expo install`) | SQLite / Key-Value offline queue persistence |
| i18n | `i18next` / `react-i18next` | Latest | English, Hindi, and Odia localization |
| Testing | `jest` + `jest-expo` + RNTL (App/UI) / `vitest` (Pure packages: utils, config, logger) | Latest | Hybrid component & unit testing |
| Quality & Lint | `eslint` (v9 Flat Config) + `prettier` | Latest | Strict import boundaries & formatting |

---

## 3. Milestone 1 Implementation Roadmap

- [ ] **Task 1.1**: Initialize Monorepo Structure with `pnpm-workspace.yaml` & `turbo.json`.
- [ ] **Task 1.2**: Set up `@campus/design-tokens` package (Color palettes, Spacing scale, Radius, Typography, Light/Dark tokens).
- [ ] **Task 1.3**: Set up `@campus/logger` package with sensitive data redaction filter (OTP, password, tokens).
- [ ] **Task 1.4**: Set up `@campus/config` package (`appConfig`, permissions map `v_active_permissions`, feature flags).
- [ ] **Task 1.5**: Set up `@campus/i18n` package with `en.json`, `hi.json`, `or.json` translation files.
- [ ] **Task 1.6**: Set up `@campus/api-client` package with JWT attachment, silent token refresh, request ID tracking, and standardized `ApiResponse` error handling.
- [ ] **Task 1.7**: Set up `@campus/ui` package with foundational atomic components (`Button`, `Input`, `Card`, `StatusTimeline`, `DataList`, `EmptyState`).
- [ ] **Task 1.8**: Set up Storybook for `@campus/ui` component visualization.
- [ ] **Task 1.9**: Verify CI pipeline runs typechecks (`pnpm typecheck`), linting (`pnpm lint`), and tests (`pnpm test`).
