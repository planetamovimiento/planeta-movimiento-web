-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Horarios y plazas de reserva por servicio
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- Define, por servicio, las franjas semanales reservables y sus plazas.
-- La ocupación de cada fecha se calcula contando `bookings` (no hay filas por fecha).
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists reserva_horarios (
  servicio_id  text primary key,           -- id del servicio del catálogo (p.ej. 'cumpleanos')
  slots        jsonb default '[]'::jsonb,   -- [{ dias:[1..7], horaInicio, horaFin, plazas }]
  updated_at   timestamptz default now(),
  updated_by   text
);

alter table reserva_horarios enable row level security;
-- Sin policy para anon: solo el panel accede con la service-role key.
