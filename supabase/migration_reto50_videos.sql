-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · 50 días en 50 provincias: vídeo resumen de cada etapa
--
-- Cada una de las 50 etapas guarda su vídeo de YouTube, de modo que el mapa se
-- convierte en el archivo audiovisual del reto: cualquiera puede pulsar una
-- provincia y ver lo que pasó ese día, aunque llegue con el reto acabado.
--
-- Ejecutar UNA vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- Es segura tanto si migration_reto50.sql ya se ejecutó como si no.
-- (video_url ya existía; aquí solo se añaden los campos que le acompañan.)
-- ═══════════════════════════════════════════════════════════════════════════

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'reto50_etapas'
  ) then
    alter table reto50_etapas add column if not exists video_url         text;
    alter table reto50_etapas add column if not exists video_titulo      text;
    alter table reto50_etapas add column if not exists video_descripcion text;
    alter table reto50_etapas add column if not exists video_miniatura   text;
    alter table reto50_etapas add column if not exists video_fecha       date;
  end if;
end $$;
