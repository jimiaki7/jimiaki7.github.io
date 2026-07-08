# Claude Code Master Prompt

You are implementing Jimi's Personal AI Agentic OS in `/Users/james/syncthing/portfolio`.

Read these first:

- `AGENTS.md`
- `CLAUDE.md`
- `package.json`
- `next.config.ts`
- `app/globals.css`
- `docs/agentic-os/*`

Preserve the public portfolio and GitHub Pages static export. Do not add Next.js Server Actions, middleware, `cookies()`, request-dependent Route Handlers, or secrets in client code.

## Implementation Order

1. Keep `/`, `/tokushoho`, and the GitHub Pages deploy workflow working.
2. Maintain `/os` and `/os/settings` as static-export-safe client routes.
3. Keep Supabase browser auth owner-only.
4. Use existing dark theme tokens and lucide icons.
5. Keep data access typed and validated with zod.
6. Keep Supabase migrations RLS-protected by `owner_id`.
7. Keep Local Bridge integration explicit and gracefully offline.
8. Verify with `npm run lint` and `npm run build`.

## Security Defaults

- Browser only gets Supabase publishable/anon key.
- `service_role` and AI provider keys live only in Supabase Edge Functions or local Bridge.
- JimiVault sensitive files, especially `重要データ.md`, are excluded.
- Any write to Vault is proposal-first and requires explicit approval.

## Acceptance Checks

- Unauthenticated `/os` shows only login/setup messaging.
- Non-owner accounts are rejected.
- Owner dashboard loads.
- Missing Supabase env does not break static build.
- Bridge offline state is understandable.
- Agent runs do not perform external actions without an approval record.
