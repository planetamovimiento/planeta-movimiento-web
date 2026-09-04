-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Datos laborales del Portal de Monitores
-- Añade a la ficha del monitor: fecha de nacimiento, nº de la Seguridad Social
-- e imágenes del DNI (anverso/reverso), y crea el HISTORIAL de altas y bajas.
--
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
--
-- ADEMÁS: crear en Storage un bucket PRIVADO llamado "monitores-docs"
--   (Storage → New bucket → name: monitores-docs → Public bucket: OFF).
--   Ahí van las fotos del DNI: nunca se sirven por URL pública, solo con
--   enlaces firmados de corta duración que genera el servidor.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Datos personales/laborales de la ficha ───────────────────────────────────
alter table monitores add column if not exists fecha_nacimiento     date;
alter table monitores add column if not exists num_seguridad_social text;
alter table monitores add column if not exists dni_numero           text;
-- Rutas dentro del bucket privado "monitores-docs" (NO son URLs públicas).
alter table monitores add column if not exists dni_frente_path      text;
alter table monitores add column if not exists dni_reverso_path     text;
-- Última baja registrada (la fecha de alta vigente sigue en `fecha_alta`).
alter table monitores add column if not exists fecha_baja           date;

-- ── Historial de altas y bajas ───────────────────────────────────────────────
-- Una fila por cada alta o baja. La ficha guarda siempre la última de cada tipo.
create table if not exists monitor_movimientos (
  id             uuid primary key default gen_random_uuid(),
  monitor_id     uuid references monitores(id) on delete cascade,
  tipo           text not null check (tipo in ('alta', 'baja')),
  fecha          date not null,
  motivo         text,
  registrado_por text,
  created_at     timestamptz default now()
);
create index if not exists idx_monitor_movimientos_monitor on monitor_movimientos(monitor_id, fecha desc);

alter table monitor_movimientos enable row level security;
-- Sin policy pública: solo el servidor (service-role) accede a estos datos.
