# Agentic OS Roadmap

Last updated: 2026-06-29

## Phase 0: Design Documents

- Create implementation handoff docs.
- Capture video research and Jimi-specific adaptation.
- Define security boundaries before UI work.

## Phase 1: Static OS Shell

- Add `/os`, `/os/auth/callback`, and `/os/settings`.
- Keep the public portfolio unchanged.
- Build with static export.

## Phase 2: Supabase Auth and RLS

- Add owner-only auth gate.
- Add schema migration with RLS.
- Add Edge Function stubs for future AI execution.

## Phase 3: Command Center MVP

- Mission Control.
- Project Hub.
- Memory Galaxy.
- Tool Registry.
- Dream Inbox.
- Agent run and approval previews.

## Phase 4: Local Bridge

- Add local Bridge CLI.
- Add health check, search, read, sync, and write-proposal endpoints.
- Add bridge settings and offline/online status in UI.

## Phase 5: Agentic Layer

- Add builder/judge/human approval loop.
- Add daily dream scan.
- Add model/provider switching.
- Track token and subscription costs.
- Add artifact gallery and provenance search.

## Phase 6: Hardening

- Add richer automated RLS tests.
- Add rate limiting for Edge Functions.
- Add audit/event log table.
- Add optional server-hosted private app if frontend code privacy becomes required.
