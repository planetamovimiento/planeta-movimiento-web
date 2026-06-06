-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Gestión de inscripciones del Club Deportivo Origen
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- Solo AÑADE tablas; no modifica ni borra nada existente.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Capa de gestión manual sobre cada inscripción del club ───────────────────
-- Los datos personales viven en form_submissions (tipo = 'inscripcion_club').
-- Aquí guardamos SOLO lo que el club gestiona a mano: grupo, estado, pagos...
create table if not exists club_gestion (
  submission_id   uuid primary key references form_submissions(id) on delete cascade,
  grupo           text,
  estado_general  text default 'pendiente',     -- activo | pendiente | baja | espera | archivado
  temporada       text default '2025/26',
  pagos           jsonb default '{}'::jsonb,     -- { "sep":"pagado", "oct":"pendiente", "nov":"baja", ... }
  observaciones   text,
  fecha_alta      date,
  fecha_baja      date,
  updated_at      timestamptz default now(),
  updated_by      text
);

-- ── Grupos configurables (globales o por actividad) ──────────────────────────
create table if not exists club_grupos (
  id         uuid primary key default gen_random_uuid(),
  actividad  text,                       -- null = grupo global (vale para cualquier actividad)
  nombre     text not null,
  orden      int default 0,
  created_at timestamptz default now()
);

-- RLS: bloqueo total al público. El panel accede con la service-role key.
alter table club_gestion enable row level security;
alter table club_grupos  enable row level security;

-- ── Grupos base (solo se siembran si la tabla está vacía) ─────────────────────
insert into club_grupos (actividad, nombre, orden)
select * from (values
  (null::text, 'Iniciación 1', 1),
  (null::text, 'Iniciación 2', 2),
  (null::text, 'Iniciación 3', 3),
  (null::text, 'Medio 1',      4),
  (null::text, 'Medio 2',      5),
  (null::text, 'Medio 3',      6),
  (null::text, 'Avanzado',     7)
) as base(actividad, nombre, orden)
where not exists (select 1 from club_grupos);
