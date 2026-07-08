# Security Model

Last updated: 2026-06-29

## Core Principle

The GitHub Pages site can be publicly downloaded. Therefore, secrecy must not rely on hiding frontend code. Private data and privileged actions are protected by Supabase Auth, RLS, Edge Function checks, and the Local Bridge token.

## Auth

- Owner email defaults to `jimiaki7@gmail.com`.
- The client refuses private UI/data for non-owner accounts.
- Supabase RLS remains the source of truth. Client checks improve UX but are not authorization.

## RLS

- RLS is enabled on every exposed table.
- Policies target `authenticated` and include owner checks.
- `UPDATE` policies include both `USING` and `WITH CHECK`.
- Browser clients only use the publishable/anon key.
- `service_role` is never exposed to browser code.

## Local Bridge

- Bind to `127.0.0.1` only.
- Require `Authorization: Bearer <local token>`.
- Allow only `https://jimiaki7.github.io`, `http://localhost:*`, and `http://127.0.0.1:*` origins.
- Read-only by default.
- Vault writes return proposals/diffs only.
- Exclude files matching sensitive patterns:
  - `**/重要データ.md`
  - `**/*secret*`
  - `**/*credential*`
  - `**/keys.json`
  - `**/.env*`

## Agent Actions

All external or destructive actions must create an `approval_requests` record first. Examples:

- Writing to Vault.
- Sending email.
- Deploying.
- Charging money.
- Modifying Supabase schema/data outside owner-scoped tables.

## Audit Trail

Agent runs, steps, artifacts, approvals, and cost events should be append-only in normal operation. Later phases can add immutable event logs if the OS begins taking external actions.

## Known MVP Limits

- Static frontend code is public.
- Browser localStorage can store the Supabase session and Bridge token. The token should be treated as local-machine secret material.
- GitHub Pages cannot enforce HTTP-only auth cookies. Moving the OS to Vercel or another server host is the future option if code delivery must also be private.
