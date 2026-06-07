-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Configuración editable de eventos (p. ej. Mañanas Mágicas)
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists eventos_config (
  id          text primary key,           -- 'manana-magica', y futuros eventos
  contenido   jsonb default '{}'::jsonb,   -- campos editables (personaje, fecha, precio, actividades...)
  estado      text default 'proximo',      -- proximo | abierto | completo
  updated_at  timestamptz default now(),
  updated_by  text
);

-- El panel accede con la service-role key (RLS sin políticas = bloqueo al público).
alter table eventos_config enable row level security;
