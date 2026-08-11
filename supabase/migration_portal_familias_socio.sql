-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Portal de Familias — acceso por correo + número de socio.
-- Añade el nº de socio a nivel FAMILIA (credencial), una tabla de sesiones
-- propias (cookie opaca) y un registro de intentos de acceso (rate-limit).
-- Idempotente y NO destructiva. RLS activado (solo el servidor, service-role).
-- ═══════════════════════════════════════════════════════════════════════════

-- Nº de socio de la familia (credencial de acceso). Único cuando no es null.
alter table club_familias add column if not exists numero_socio text;
create unique index if not exists club_familias_numero_socio_uidx
  on club_familias (numero_socio) where numero_socio is not null;

-- Sesiones del portal (token opaco en cookie HttpOnly). Revocables y con caducidad.
create table if not exists club_familia_sesiones (
  token       text primary key,
  familia_id  uuid not null references club_familias(id) on delete cascade,
  created_at  timestamptz default now(),
  expires_at  timestamptz not null,
  user_agent  text
);
create index if not exists club_familia_sesiones_fam_idx on club_familia_sesiones (familia_id);

-- Registro de intentos de acceso (para rate-limit y auditoría). Sin datos sensibles.
create table if not exists club_login_intentos (
  id         bigserial primary key,
  ip         text,
  email      text,
  ok         boolean default false,
  created_at timestamptz default now()
);
create index if not exists club_login_intentos_ip_idx on club_login_intentos (ip, created_at desc);

alter table club_familia_sesiones enable row level security;
alter table club_login_intentos   enable row level security;
