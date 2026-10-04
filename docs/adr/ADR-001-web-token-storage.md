# ADR-001: Web Token Storage & Security Architecture

- **Status**: Accepted & Implemented (GAP-004 Resolved)
- **Date**: 2026-10-04
- **Authors**: Senior Frontend Architect

## Context & Problem Statement

Cross-platform security guidelines require tokens to be stored securely across mobile (iOS/Android) and web.
While mobile platforms use native secure hardware storage (`expo-secure-store`), web environments are vulnerable to Cross-Site Scripting (XSS) attacks if access tokens or refresh tokens are stored in unencrypted browser storage (`localStorage` or `sessionStorage`).

## Decision Drivers

1. **XSS Resistance**: `localStorage` and `sessionStorage` are directly readable by JavaScript. Any malicious third-party script or XSS vector can steal raw tokens.
2. **Same-Origin Policy & httpOnly Cookies**: `httpOnly` cookies cannot be accessed or read via `document.cookie` in JavaScript, making them immune to token theft via XSS.
3. **Cross-Platform Parity**: Mobile continues to use `expo-secure-store`. Web uses an `InMemoryTokenStore` for short-lived access tokens combined with an `httpOnly` cookie for long-lived refresh tokens.

## Implemented Strategy

1. **Mobile (iOS / Android)**:
   - Tokens stored securely using `expo-secure-store` (`SecureStoreTokenStore`).

2. **Web Browser (Desktop / Mobile Web)**:
   - **Header Identification**: Web requests send `x-client: web` and `credentials: 'include'`.
   - **Access Token**: Kept strictly in memory (`InMemoryTokenStore`). Never written to disk or localStorage.
   - **Refresh Token**: Managed via `httpOnly`, `SameSite=Lax/Strict`, `Secure` HTTP cookies set by the backend `/auth/login`, `/auth/2fa/verify`, `/auth/register`, and `/auth/token/refresh` endpoints.
   - **Silent Session Restoration**: On app load, `@campus/api-client` executes `silentRestoreSession()`, sending a request with `x-client: web` and `credentials: 'include'` to restore the in-memory access token without storing refresh tokens in JS memory or browser storage.
