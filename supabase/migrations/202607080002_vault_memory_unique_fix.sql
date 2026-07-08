-- 202607080001 が張った「部分」ユニークインデックスは、PostgreSQL の
-- INSERT ... ON CONFLICT (owner_id, source_path) から推論できない。
-- 述語付き（partial）インデックスを推論させるには conflict_target に同じ WHERE 述語を
-- 書く必要があるが、PostgREST(supabase-js の upsert) はそれを送れない。
-- 結果として本番で 42P10 "there is no unique or exclusion constraint matching the
-- ON CONFLICT specification" が発生し、Vault 同期が常に失敗していた（E2Eで検出）。
--
-- 述語なしのユニークインデックスへ置き換える。source_path が NULL の行（手動メモ等）は
-- Postgres の既定 NULLS DISTINCT により互いに衝突しないため、影響を受けない。

drop index if exists public.memory_items_owner_source_path_uniq;

-- 念のため、非 vault 行も含めた (owner_id, source_path) の重複を先に解消する。
delete from public.memory_items dup
using public.memory_items keep
where dup.source_path is not null
  and keep.source_path is not null
  and dup.owner_id = keep.owner_id
  and dup.source_path = keep.source_path
  and dup.id <> keep.id
  and (
    dup.created_at > keep.created_at
    or (dup.created_at = keep.created_at and dup.id > keep.id)
  );

create unique index if not exists memory_items_owner_source_path_uniq
  on public.memory_items (owner_id, source_path);
