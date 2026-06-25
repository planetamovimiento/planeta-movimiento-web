-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Registro de correos enviados (email_log)
-- Guarda cada envío de la web (Resend) para poder auditar entregas y fallos.
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists email_log (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  tipo         text,        -- aviso-interno | confirmacion-cliente | aviso-reserva | ...
  destinatario text,        -- a quién se envió
  asunto       text,
  estado       text,        -- enviado | fallido
  error        text,        -- motivo del fallo, si lo hubo
  meta         jsonb        -- datos extra (servicio, nº de reserva, etc.)
);

create index if not exists idx_email_log_created on email_log(created_at desc);

alter table email_log enable row level security;
