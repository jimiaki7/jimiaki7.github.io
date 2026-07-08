begin;

select plan(10);

select has_table('public', 'projects', 'projects table exists');
select has_table('public', 'memory_items', 'memory_items table exists');
select has_table('public', 'approval_requests', 'approval_requests table exists');
select has_table('public', 'cost_events', 'cost_events table exists');

select policies_are(
  'public',
  'projects',
  array['projects owner all'],
  'projects has owner policy'
);

select policies_are(
  'public',
  'memory_items',
  array['memory_items owner all'],
  'memory_items has owner policy'
);

select policies_are(
  'public',
  'approval_requests',
  array['approval_requests owner all'],
  'approval_requests has owner policy'
);

select policies_are(
  'public',
  'cost_events',
  array['cost_events owner select', 'cost_events owner insert'],
  'cost_events allows owner select/insert only'
);

select col_not_null('public', 'projects', 'owner_id', 'projects.owner_id is required');
select col_not_null('public', 'memory_items', 'owner_id', 'memory_items.owner_id is required');

select * from finish();

rollback;
