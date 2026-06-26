-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Registro de seguridad (security_events)
-- Guarda cada evento de seguridad de la web: envíos, bots detectados, spam,
-- rate-limit, accesos, etc. Lo consulta el admin en Admin → Seguridad.
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists security_events (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  tipo        text,        -- envio | bot | spam | rate-limit | login | bloqueo
  ip          text,
  form_tipo   text,        -- contacto | reserva | inscripcion | presupuesto | ...
  motivo      text,
  detalle     jsonb
);

create index if not exists idx_security_events_created on security_events(created_at desc);
create index if not exists idx_security_events_ip on security_events(ip, created_at desc);

alter table security_events enable row level security;
