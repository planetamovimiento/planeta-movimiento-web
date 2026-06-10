-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Módulo "Calendario Club" (Club Deportivo Origen)
-- Calendario interno editable: clases recurrentes, festivos, eventos, galas,
-- campamentos, talleres y actividades, con tipos/colores y excepciones.
--
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- Solo AÑADE tablas (prefijo cc_). RLS activado SIN policy pública (solo panel).
-- ═══════════════════════════════════════════════════════════════════════════

-- Tipos de evento con color editable
create table if not exists cc_tipos (
  id     text primary key,        -- clase | festivo | sin_clase | sin_cole | evento | gala | campamento | taller | puntual | empresa
  label  text not null,
  color  text not null,           -- clave de paleta (azul, rojo, gris, naranja, morado, verde, amarillo, negro, teal, rosa)
  orden  int default 0
);

create table if not exists cc_eventos (
  id           uuid primary key default gen_random_uuid(),
  tipo         text not null,
  titulo       text not null,
  actividad    text,
  grupo        text,
  monitor      text,
  ubicacion    text,
  temporada    text,
  fecha        date not null,           -- inicio (o día único)
  fecha_fin    date,                    -- para marcadores de varios días (festivo/campamento) sin recurrencia
  hora_inicio  text,                    -- 'HH:MM' (null = todo el día)
  hora_fin     text,
  todo_el_dia  boolean default false,
  recurrencia  jsonb,                   -- null = puntual; { dias:[1..7], hasta, excluir_festivos, excluir_sin_clase }
  color        text,                    -- override de paleta (null = color del tipo)
  estado       text default 'activo',   -- activo | cancelado
  publico      boolean default true,    -- true = aparece en la exportación para familias
  descripcion  text,
  observaciones text,                   -- internas
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  updated_by   text
);

-- Excepciones por sesión de un evento recurrente
create table if not exists cc_excepciones (
  id         uuid primary key default gen_random_uuid(),
  evento_id  uuid references cc_eventos(id) on delete cascade,
  fecha      date not null,
  accion     text not null,             -- cancelar | modificar
  cambios    jsonb,                     -- overrides para 'modificar'
  created_at timestamptz default now(),
  unique (evento_id, fecha)
);

create index if not exists cc_eventos_fecha_idx on cc_eventos(fecha);
create index if not exists cc_excepciones_evento_idx on cc_excepciones(evento_id);

alter table cc_tipos       enable row level security;
alter table cc_eventos     enable row level security;
alter table cc_excepciones enable row level security;

-- Tipos base con colores por defecto (solo si la tabla está vacía)
insert into cc_tipos (id, label, color, orden)
select * from (values
  ('clase',      'Clase regular',    'azul',     1),
  ('festivo',    'Día festivo',      'rojo',     2),
  ('sin_clase',  'Día sin clase',    'gris',     3),
  ('sin_cole',   'Día sin cole',     'naranja',  4),
  ('evento',     'Evento especial',  'teal',     5),
  ('gala',       'Gala',             'morado',   6),
  ('campamento', 'Campamento',       'verde',    7),
  ('taller',     'Taller intensivo', 'amarillo', 8),
  ('puntual',    'Actividad puntual','rosa',     9),
  ('empresa',    'Servicio empresa', 'negro',    10)
) as base(id, label, color, orden)
where not exists (select 1 from cc_tipos);
