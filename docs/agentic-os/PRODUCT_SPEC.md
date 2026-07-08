# Product Spec: Jimi Personal AI Agentic OS

Last updated: 2026-06-29

## Goal

Add a protected `/os` area to the existing portfolio site. The public portfolio remains a static GitHub Pages site. The OS becomes Jimi's private command center for AI tools, second-brain memory, generated artifacts, projects, and approvals.

## Users

- Owner: Jimi. Full access to private OS data and integrations.
- Future viewer: optional read-only collaborator role. Not part of the MVP UI.
- Public visitor: can only see the portfolio and a login gate at `/os`.

## Routes

- `/os`: protected Command Center.
- `/os/auth/callback`: static Supabase Auth callback.
- `/os/settings`: protected connection and security settings.

Static export constraints mean the MVP avoids request-dependent Route Handlers, Server Actions, cookies, middleware, and dynamic App Router segments.

## Command Center Modules

- Mission Control: daily priorities, active projects, pending approvals, latest runs, cost estimate, memory status.
- Project Hub: pastoral, development, and side-business projects with status and priority.
- Memory Galaxy: searchable memory items from Vault, AI conversations, generated artifacts, and manual notes.
- Tool Registry: model providers, CLIs, apps, local Bridge, project systems, and connection state.
- Dream Inbox: AI-generated or manually captured recommendations requiring approval or dismissal.
- Agent Runs: history of builder/judge loops, step status, and resulting artifacts.

## Required States

- Supabase not configured: show setup instructions without exposing private UI.
- Unauthenticated: show login form only.
- Authenticated but not owner: show access-denied state and sign-out.
- Owner authenticated, no records: show useful seeded empty states and creation affordances.
- Bridge offline: show graceful offline state and manual token/URL settings.
- Bridge online: allow read-only Vault search and sync actions.

## Non-Goals For MVP

- Direct Vault writes.
- Browser-side API keys for AI providers.
- Fully autonomous external actions.
- Payments, email sending, or public sharing.
- Replacing Keryx, Obsidian, or Claude Code. The OS coordinates them.

## Acceptance Criteria

- Public `/` and `/tokushoho` still build and render.
- `/os` is usable as a static-export-safe client app.
- Private data is fetched only after owner authentication.
- The UI exposes the core modules above with realistic default states.
- Settings make Bridge and Supabase configuration understandable.
