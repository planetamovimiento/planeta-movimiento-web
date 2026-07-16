-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · 50 días en 50 provincias: patrocinadores y colaboradores
--
-- Separa las dos categorías, que antes iban mezcladas en una sola lista.
-- Ejecutar UNA vez en el SQL Editor de Supabase. Idempotente y no destructivo.
--
-- Es segura tanto si migration_reto50.sql ya se ejecutó como si no: si la
-- tabla todavía no existe, esta migración no hace nada (la columna ya viene
-- incluida en migration_reto50.sql para instalaciones nuevas).
-- ═══════════════════════════════════════════════════════════════════════════

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'reto50_patrocinadores'
  ) then
    -- patrocinador | colaborador. Lo que ya existía pasa a patrocinador.
    alter table reto50_patrocinadores add column if not exists categoria text default 'patrocinador';
    update reto50_patrocinadores set categoria = 'patrocinador' where categoria is null;
  end if;
end $$;
