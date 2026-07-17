-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · 50 días en 50 provincias: bandera de cada etapa
--
-- Cada etapa puede mostrar en su tarjeta la bandera de su provincia o
-- territorio. La imagen la sube el admin desde el panel; si falta, la tarjeta
-- muestra un hueco neutro.
--
-- Ejecutar UNA vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- Segura tanto si migration_reto50.sql ya se ejecutó como si no.
-- ═══════════════════════════════════════════════════════════════════════════

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'reto50_etapas'
  ) then
    alter table reto50_etapas add column if not exists bandera_url text;
    alter table reto50_etapas add column if not exists bandera_alt text;
  end if;
end $$;
