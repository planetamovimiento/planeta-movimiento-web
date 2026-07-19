-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · 50 días en 50 provincias: colaboradores locales
--
-- Tercera categoría de apoyo, independiente de patrocinadores y colaboradores.
-- Solo nombre y logo (el enlace es opcional), y se asocia a una o varias
-- provincias del reto para que salga en el detalle de esas etapas.
--
-- El vínculo va en una tabla aparte (relación N a N) para no duplicar el
-- registro: un mismo colaborador que apoye tres provincias se guarda UNA vez.
--
-- Se relaciona por nombre de provincia, no por id de etapa: las 50 provincias
-- son únicas y no cambian, así que el vínculo sobrevive aunque se reescriban
-- las filas de reto50_etapas.
--
-- Ejecutar UNA vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists reto50_colaboradores_locales (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  logo_url   text,
  web_url    text,                      -- opcional: si está vacío, el logo no enlaza
  orden      int default 0,
  activo     boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Vínculo con las provincias/etapas donde colabora.
create table if not exists reto50_colaborador_provincia (
  colaborador_id uuid not null references reto50_colaboradores_locales(id) on delete cascade,
  provincia      text not null,
  created_at     timestamptz default now(),
  primary key (colaborador_id, provincia)
);

create index if not exists reto50_colab_local_orden_idx on reto50_colaboradores_locales(orden);
create index if not exists reto50_colab_prov_idx        on reto50_colaborador_provincia(provincia);

-- RLS: bloqueo total al público. La web pública lee desde el servidor.
alter table reto50_colaboradores_locales enable row level security;
alter table reto50_colaborador_provincia enable row level security;
