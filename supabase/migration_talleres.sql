-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Gestión de Talleres Intensivos desde el panel
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists talleres_intensivos (
  id          text primary key,          -- 'telas', 'backflip', 'verticales', 'jiujitsu'
  contenido   jsonb default '{}'::jsonb,  -- campos editables (fecha, horario, precio, profesor, plazas, descripción, imagen...)
  estado      text default 'proximamente', -- proximamente | abierto | ultimas | completo
  updated_at  timestamptz default now(),
  updated_by  text
);

alter table talleres_intensivos enable row level security;

-- Lectura pública (la web muestra los talleres)
do $$ begin
  create policy "public read talleres" on talleres_intensivos for select to anon using (true);
exception when duplicate_object then null; end $$;
