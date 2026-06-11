-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Portal de Familias del Club Deportivo Origen
-- Cuentas familiares (login por correo) vinculadas a los alumnos del CRM, y
-- campos visibles para la familia en la capa de gestión (foto, observaciones,
-- horario).
--
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- RLS activado SIN policy pública: solo el servidor accede (service-role).
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists club_familias (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,        -- correo de acceso (login magic link)
  nombre        text,                         -- nombre del padre/madre/tutor
  telefono      text,
  estado        text default 'activo',        -- activo | pendiente | bloqueado | desactivado
  created_at    timestamptz default now(),
  ultimo_acceso timestamptz
);

-- Vínculos familia ↔ alumno (inscripción). Gestionables desde el admin.
create table if not exists club_familia_alumnos (
  familia_id    uuid references club_familias(id) on delete cascade,
  submission_id uuid references form_submissions(id) on delete cascade,
  created_at    timestamptz default now(),
  primary key (familia_id, submission_id)
);

-- Campos del alumno visibles para la familia (capa de gestión del CRM).
alter table club_gestion add column if not exists foto_url             text;
alter table club_gestion add column if not exists observaciones_familia text;
alter table club_gestion add column if not exists horario              text;

alter table club_familias        enable row level security;
alter table club_familia_alumnos enable row level security;
