-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Importe mensual por alumno (Club Deportivo Origen)
-- Añade el detalle económico de cada mes (importe/fecha/observación) junto al
-- estado de color que ya existe en club_gestion.pagos. Registra el historial de
-- cambios económicos (punto 29).
--
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- ═══════════════════════════════════════════════════════════════════════════

-- Detalle por mes: { "oct": { "importe_cents": 4500, "fecha": "2026-10-05", "obs": "" }, ... }
-- El ESTADO (pagado/pendiente/baja) sigue viviendo en club_gestion.pagos.
alter table club_gestion add column if not exists pagos_meta jsonb default '{}'::jsonb;

-- Historial de cambios económicos mensuales
create table if not exists club_pagos_historial (
  id                uuid primary key default gen_random_uuid(),
  submission_id     text not null,
  mes               text not null,          -- clave de MESES_TEMPORADA (sep..jun)
  estado_ant        text,
  estado_new        text,
  importe_ant_cents int,
  importe_new_cents int,
  usuario           text,                   -- email del admin que hizo el cambio
  created_at        timestamptz default now()
);

create index if not exists club_pagos_hist_sub_idx on club_pagos_historial(submission_id);

-- Solo panel (service role bypasea RLS); sin policy pública.
alter table club_pagos_historial enable row level security;
