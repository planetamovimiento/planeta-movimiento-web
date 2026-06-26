-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Eventos manuales del calendario de administración
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists calendario_eventos (
  id          uuid primary key default gen_random_uuid(),
  fecha       date not null,
  titulo      text not null,
  servicio    text,
  hora        text,
  nota        text,
  created_by  text,
  created_at  timestamptz default now()
);

-- Columna de hora para tablas ya creadas antes de esta migración.
alter table calendario_eventos add column if not exists hora text;

alter table calendario_eventos enable row level security;
