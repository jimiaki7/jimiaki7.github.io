create extension if not exists pgcrypto;

create or replace function public.set_agentic_os_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_agentic_os_updated_at() from public;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'viewer' check (role in ('owner', 'viewer')),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_owner_is_self check (id = owner_id)
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  source_type text not null check (source_type in ('vault', 'ai_chat', 'artifact', 'manual', 'external')),
  location text,
  status text not null default 'active' check (status in ('active', 'paused', 'offline', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memory_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  title text not null,
  source_type text not null check (source_type in ('vault', 'ai_chat', 'artifact', 'manual')),
  source_path text,
  summary text,
  content_hash text,
  tags text[] not null default '{}'::text[],
  strength integer not null default 50 check (strength between 0 and 100),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memory_edges (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  from_memory_id uuid not null references public.memory_items(id) on delete cascade,
  to_memory_id uuid not null references public.memory_items(id) on delete cascade,
  relationship text not null default 'related',
  weight numeric(5, 2) not null default 1.0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint memory_edges_not_self check (from_memory_id <> to_memory_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  domain text not null check (domain in ('pastoral', 'development', 'business', 'personal')),
  status text not null default 'active' check (status in ('active', 'waiting', 'paused', 'completed')),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  description text,
  next_action text,
  due_date date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tools (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null check (category in ('ai', 'memory', 'project', 'automation', 'infra')),
  status text not null default 'planned' check (status in ('connected', 'manual', 'offline', 'planned')),
  provider text,
  launch_url text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'waiting_approval', 'completed', 'failed')),
  builder_model text,
  judge_model text,
  score numeric(5, 2),
  prompt text,
  result_summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_steps (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  agent_run_id uuid not null references public.agent_runs(id) on delete cascade,
  step_index integer not null,
  role text not null check (role in ('builder', 'judge', 'tool', 'human')),
  status text not null default 'queued' check (status in ('queued', 'running', 'waiting_approval', 'completed', 'failed')),
  input_summary text,
  output_summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_run_id, step_index)
);

create table if not exists public.artifacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  agent_run_id uuid references public.agent_runs(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  artifact_type text not null check (artifact_type in ('draft', 'code', 'report', 'image', 'video', 'note')),
  storage_url text,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null check (category in ('memory', 'cost', 'workflow', 'opportunity', 'risk')),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  status text not null default 'open' check (status in ('open', 'approved', 'dismissed', 'done')),
  rationale text,
  recommendation text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  agent_run_id uuid references public.agent_runs(id) on delete set null,
  title text not null,
  action_type text not null check (action_type in ('vault_write', 'external_action', 'agent_run', 'deploy')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high')),
  requested_by text,
  request_payload jsonb not null default '{}'::jsonb,
  decision_note text,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cost_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  agent_run_id uuid references public.agent_runs(id) on delete set null,
  provider text not null,
  model text,
  amount_usd numeric(12, 4) not null default 0,
  tokens_input integer not null default 0,
  tokens_output integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sources_owner_idx on public.sources(owner_id);
create index if not exists memory_items_owner_updated_idx on public.memory_items(owner_id, updated_at desc);
create index if not exists memory_edges_owner_idx on public.memory_edges(owner_id);
create index if not exists projects_owner_updated_idx on public.projects(owner_id, updated_at desc);
create index if not exists tools_owner_status_idx on public.tools(owner_id, status);
create index if not exists agent_runs_owner_created_idx on public.agent_runs(owner_id, created_at desc);
create index if not exists agent_steps_run_idx on public.agent_steps(agent_run_id, step_index);
create index if not exists artifacts_owner_created_idx on public.artifacts(owner_id, created_at desc);
create index if not exists insights_owner_status_idx on public.insights(owner_id, status, created_at desc);
create index if not exists approval_requests_owner_status_idx on public.approval_requests(owner_id, status, created_at desc);
create index if not exists cost_events_owner_created_idx on public.cost_events(owner_id, created_at desc);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_agentic_os_updated_at();

create trigger sources_set_updated_at
before update on public.sources
for each row execute function public.set_agentic_os_updated_at();

create trigger memory_items_set_updated_at
before update on public.memory_items
for each row execute function public.set_agentic_os_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_agentic_os_updated_at();

create trigger tools_set_updated_at
before update on public.tools
for each row execute function public.set_agentic_os_updated_at();

create trigger agent_runs_set_updated_at
before update on public.agent_runs
for each row execute function public.set_agentic_os_updated_at();

create trigger agent_steps_set_updated_at
before update on public.agent_steps
for each row execute function public.set_agentic_os_updated_at();

create trigger artifacts_set_updated_at
before update on public.artifacts
for each row execute function public.set_agentic_os_updated_at();

create trigger insights_set_updated_at
before update on public.insights
for each row execute function public.set_agentic_os_updated_at();

create trigger approval_requests_set_updated_at
before update on public.approval_requests
for each row execute function public.set_agentic_os_updated_at();

alter table public.profiles enable row level security;
alter table public.sources enable row level security;
alter table public.memory_items enable row level security;
alter table public.memory_edges enable row level security;
alter table public.projects enable row level security;
alter table public.tools enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_steps enable row level security;
alter table public.artifacts enable row level security;
alter table public.insights enable row level security;
alter table public.approval_requests enable row level security;
alter table public.cost_events enable row level security;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.sources to authenticated;
grant select, insert, update, delete on public.memory_items to authenticated;
grant select, insert, update, delete on public.memory_edges to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.tools to authenticated;
grant select, insert, update, delete on public.agent_runs to authenticated;
grant select, insert, update, delete on public.agent_steps to authenticated;
grant select, insert, update, delete on public.artifacts to authenticated;
grant select, insert, update, delete on public.insights to authenticated;
grant select, insert, update, delete on public.approval_requests to authenticated;
grant select, insert on public.cost_events to authenticated;

create policy "profiles owner select"
on public.profiles for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

create policy "profiles owner insert"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_id and (select auth.uid()) = id);

create policy "profiles owner update"
on public.profiles for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_id and (select auth.uid()) = id);

create policy "profiles owner delete"
on public.profiles for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

create policy "sources owner all"
on public.sources for all
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

create policy "memory_items owner all"
on public.memory_items for all
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

create policy "memory_edges owner select"
on public.memory_edges for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

create policy "memory_edges owner insert"
on public.memory_edges for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = owner_id
  and exists (
    select 1 from public.memory_items m
    where m.id = from_memory_id and m.owner_id = (select auth.uid())
  )
  and exists (
    select 1 from public.memory_items m
    where m.id = to_memory_id and m.owner_id = (select auth.uid())
  )
);

create policy "memory_edges owner update"
on public.memory_edges for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

create policy "memory_edges owner delete"
on public.memory_edges for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

create policy "projects owner all"
on public.projects for all
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

create policy "tools owner all"
on public.tools for all
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

create policy "agent_runs owner all"
on public.agent_runs for all
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

create policy "agent_steps owner all"
on public.agent_steps for all
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

create policy "artifacts owner all"
on public.artifacts for all
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

create policy "insights owner all"
on public.insights for all
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

create policy "approval_requests owner all"
on public.approval_requests for all
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

create policy "cost_events owner select"
on public.cost_events for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

create policy "cost_events owner insert"
on public.cost_events for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_id);
