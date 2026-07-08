-- Vault由来のmemory_itemsに (owner_id, source_path) の部分ユニーク制約を追加する。
-- upsertVaultMemories が upsert(..., { onConflict: "owner_id,source_path", ignoreDuplicates: true })
-- に移行するための前提（app/os/_lib/os-data.ts）。

-- 既存重複の削除: 同一 owner_id + source_path (source_type = 'vault') の中で
-- 最初に作成された行(古い方)を残し、後から重複挿入された行を削除する。
delete from public.memory_items dup
using public.memory_items keep
where dup.source_type = 'vault'
  and keep.source_type = 'vault'
  and dup.source_path is not null
  and dup.owner_id = keep.owner_id
  and dup.source_path = keep.source_path
  and dup.id <> keep.id
  and (
    dup.created_at > keep.created_at
    or (dup.created_at = keep.created_at and dup.id > keep.id)
  );

create unique index if not exists memory_items_owner_source_path_uniq on public.memory_items(owner_id, source_path) where source_type = 'vault' and source_path is not null;
