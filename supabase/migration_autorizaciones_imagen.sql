-- ─────────────────────────────────────────────────────────────────────────────
-- Autorizaciones de imagen de menores (firma electrónica desde el Portal de
-- Familias o desde planetamovimiento.com/autorizacion).
-- Cada firma es una fila nueva: la última de cada menor es la vigente, y las
-- anteriores quedan como historial (sirven de prueba del consentimiento).
-- Sin políticas RLS: solo el servidor (service role) lee y escribe.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists autorizaciones_imagen (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  origen             text not null check (origen in ('portal', 'enlace')),
  familia_id         uuid references club_familias(id) on delete set null,
  submission_id      uuid,
  actividad          text,
  menor_nombre       text not null,
  tutor_nombre       text not null,
  tutor_dni          text not null,
  tutor_relacion     text not null check (tutor_relacion in ('padre', 'madre', 'tutor')),
  tutor_email        text not null,
  web                boolean not null,
  redes              boolean not null,
  material           boolean not null,
  memorias           boolean not null,
  conformidad_menor  boolean not null default false,
  documento_version  text not null,
  documento_hash     text not null,
  ip                 text,
  user_agent         text
);

create index if not exists autorizaciones_imagen_familia_idx on autorizaciones_imagen (familia_id, created_at desc);
create index if not exists autorizaciones_imagen_fecha_idx on autorizaciones_imagen (created_at desc);

alter table autorizaciones_imagen enable row level security;
