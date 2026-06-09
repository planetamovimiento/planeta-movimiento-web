-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Módulo "Circo Inclusivo" (Club Deportivo Origen)
-- Seguimiento de participantes de circo inclusivo / adaptado, psicomotricidad
-- y grupos especiales: grupos, actividades, participantes y evaluaciones.
--
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- Solo AÑADE tablas (prefijo ci_); no modifica ni borra nada existente.
-- RLS activado SIN policy pública: solo el panel accede (service-role).
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists ci_grupos (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  entidad       text,
  horario       text,
  lugar         text,
  monitor       text,
  observaciones text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists ci_actividades (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  descripcion text,
  orden       int default 0,
  created_at  timestamptz default now()
);

create table if not exists ci_participantes (
  id                uuid primary key default gen_random_uuid(),
  nombre            text not null,
  apellidos         text,
  fecha_nacimiento  date,
  entidad           text,
  grupo_id          uuid references ci_grupos(id) on delete set null,
  actividad         text,
  observaciones     text,
  necesidades_apoyo text,
  info_monitor      text,
  estado            text default 'activo',   -- activo | baja | pausado | archivado
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table if not exists ci_evaluaciones (
  id                uuid primary key default gen_random_uuid(),
  participante_id   uuid references ci_participantes(id) on delete cascade,
  tipo              text not null,            -- mensual | trimestral
  fecha             date not null default current_date,
  periodo           text,                     -- '2026-06' (mensual) | '2026-T2' (trimestral)
  profesional       text,
  items             jsonb default '{}'::jsonb, -- { clave_item: 1..4 }
  textos            jsonb default '{}'::jsonb, -- { clave_campo: texto }
  valoracion_global text,                     -- muy_positiva | positiva | estable | necesita_apoyo
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists ci_participantes_grupo_idx on ci_participantes(grupo_id);
create index if not exists ci_evaluaciones_part_idx   on ci_evaluaciones(participante_id);

-- RLS: bloqueo total al público. El panel accede con la service-role key.
alter table ci_grupos        enable row level security;
alter table ci_actividades   enable row level security;
alter table ci_participantes enable row level security;
alter table ci_evaluaciones  enable row level security;

-- Actividades base (solo se siembran si la tabla está vacía)
insert into ci_actividades (nombre, orden)
select * from (values
  ('Circo inclusivo', 1),
  ('Circo adaptado y psicomotricidad', 2),
  ('Psicomotricidad', 3),
  ('Movimiento adaptado', 4),
  ('Actividades en residencia', 5)
) as base(nombre, orden)
where not exists (select 1 from ci_actividades);
