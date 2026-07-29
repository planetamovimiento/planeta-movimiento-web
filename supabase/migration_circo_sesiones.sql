-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Circo Inclusivo: sesiones y evaluación por sesión
--
-- Añade la jornada semanal (ci_sesiones) y una evaluación por participante y
-- sesión (ci_eval_sesion). Las medias mensuales/trimestrales se calcularán a
-- partir de estas (fase siguiente). NO toca ci_evaluaciones (mensual/trimestral
-- histórico), que se conserva.
--
-- Ejecutar UNA vez. Idempotente y no destructivo. RLS sin policy pública.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists ci_sesiones (
  id            uuid primary key default gen_random_uuid(),
  fecha         date not null,
  hora          text,
  grupo_id      uuid references ci_grupos(id) on delete set null,
  lugar         text,
  monitor       text,
  estado        text default 'programada',   -- programada | realizada | cancelada | aplazada
  observaciones text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists ci_sesiones_fecha_idx on ci_sesiones (fecha);
create index if not exists ci_sesiones_grupo_idx on ci_sesiones (grupo_id);

create table if not exists ci_eval_sesion (
  id              uuid primary key default gen_random_uuid(),
  sesion_id       uuid not null references ci_sesiones(id) on delete cascade,
  participante_id uuid not null references ci_participantes(id) on delete cascade,
  -- asiste | justificada | no_justificada | no_evaluable. La ausencia NO es un 0.
  asistencia      text default 'asiste',
  items           jsonb default '{}',        -- { criterio: 1..4 }
  media           numeric,                   -- media de los criterios puntuados (null si no evaluable)
  observaciones   text,
  estado          text default 'borrador',   -- borrador | completada
  evaluador       text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  -- Una sola evaluación por participante y sesión (evita duplicados por doble clic).
  unique (sesion_id, participante_id)
);

create index if not exists ci_eval_sesion_sesion_idx on ci_eval_sesion (sesion_id);
create index if not exists ci_eval_sesion_part_idx   on ci_eval_sesion (participante_id);

alter table ci_sesiones    enable row level security;
alter table ci_eval_sesion enable row level security;
