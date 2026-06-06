-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Editor completo de servicios y productos
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- Solo AÑADE columnas; no modifica ni borra nada existente.
-- ═══════════════════════════════════════════════════════════════════════════

-- Contenido editable completo (todos los campos van en este JSON flexible)
alter table services add column if not exists contenido   jsonb default '{}'::jsonb;
alter table services add column if not exists entidad      text default 'empresa';   -- club | empresa
alter table services add column if not exists updated_by   text;

alter table products add column if not exists contenido   jsonb default '{}'::jsonb;
alter table products add column if not exists updated_by   text;

-- Política pública de lectura para servicios visibles
-- (los que NO estén ocultos/inactivos). Reemplaza la anterior.
drop policy if exists "public read services" on services;
do $$ begin
  create policy "public read services visibles" on services
    for select to anon
    using (estado not in ('inactivo', 'oculto', 'borrador'));
exception when duplicate_object then null; end $$;
