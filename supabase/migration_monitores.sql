-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Portal de Monitores (gestión del equipo de trabajo)
-- Fichas de monitores, calendario de actividades asignadas, fichaje de jornada,
-- y biblioteca de recursos (carpetas + documentos).
--
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- RLS activado SIN policy pública: solo el servidor accede (service-role).
--
-- ADEMÁS: crear en Storage un bucket público llamado "recursos"
--   (Storage → New bucket → name: recursos → Public bucket: ON).
-- ═══════════════════════════════════════════════════════════════════════════

-- Ficha de cada monitor. `email` enlaza con admin_users (login por enlace mágico).
create table if not exists monitores (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  nombre          text,
  apellidos       text,
  foto_url        text,
  telefono        text,
  fecha_alta      date,
  especialidades  text[] default '{}',
  estado          text default 'activo',   -- activo | baja | vacaciones | inactivo
  observaciones   text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Actividades asignadas (calendario de trabajo).
create table if not exists monitor_actividades (
  id            uuid primary key default gen_random_uuid(),
  monitor_id    uuid references monitores(id) on delete cascade,
  fecha         date not null,
  hora_inicio   text,
  hora_fin      text,
  actividad     text,
  lugar         text,
  grupo         text,
  observaciones text,
  created_at    timestamptz default now()
);
create index if not exists idx_monitor_actividades_monitor on monitor_actividades(monitor_id, fecha);

-- Fichajes de jornada (control horario). salida null = jornada abierta.
create table if not exists monitor_fichajes (
  id            uuid primary key default gen_random_uuid(),
  monitor_id    uuid references monitores(id) on delete cascade,
  fecha         date not null,
  entrada       timestamptz not null,
  salida        timestamptz,
  actividad     text,
  observaciones text,
  created_at    timestamptz default now()
);
create index if not exists idx_monitor_fichajes_monitor on monitor_fichajes(monitor_id, fecha);

-- Biblioteca de recursos: carpetas y documentos.
create table if not exists recursos_carpetas (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  orden       int default 0,
  created_at  timestamptz default now()
);

create table if not exists recursos_documentos (
  id          uuid primary key default gen_random_uuid(),
  carpeta_id  uuid references recursos_carpetas(id) on delete cascade,
  nombre      text not null,
  tipo        text,                          -- pdf | word | excel | imagen | video | presentacion | otro
  url         text not null,
  tamano      bigint,
  subido_por  text,
  created_at  timestamptz default now()
);
create index if not exists idx_recursos_documentos_carpeta on recursos_documentos(carpeta_id);

alter table monitores            enable row level security;
alter table monitor_actividades  enable row level security;
alter table monitor_fichajes     enable row level security;
alter table recursos_carpetas    enable row level security;
alter table recursos_documentos  enable row level security;
