-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Configuración global (clave/valor) editable desde el admin.
-- Ejecutar UNA vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- Uso actual: 'temporada_activa' del Club Deportivo Origen.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists global_config (
  clave      text primary key,
  valor      text not null,
  updated_at timestamptz default now(),
  updated_by text
);

-- RLS: bloqueo total al público. Solo el panel (service-role) accede.
alter table global_config enable row level security;

-- Temporada activa del Club por defecto (2026/27). No pisa si ya existe.
insert into global_config (clave, valor) values ('temporada_activa', '2026/27')
on conflict (clave) do nothing;
