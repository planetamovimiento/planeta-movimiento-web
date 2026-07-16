-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · 50 días en 50 provincias: donaciones
--   · Códigos QR de donación (portada)
--   · Objetivo de gasolina (cifras manuales, en reto50_config)
--   · Ranking de colaboradores de gasolina
--
-- Ejecutar UNA vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- Se puede ejecutar aunque migration_reto50.sql no se haya ejecutado todavía.
-- RLS activado SIN policy pública: solo el servidor accede (service-role).
--
-- Las imágenes de los QR y los avatares se suben al bucket público ya
-- existente "fotos" desde el panel; no hace falta bucket nuevo.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Códigos QR de donación ─────────────────────────────────────────────────
create table if not exists reto50_qr (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  descripcion text,
  imagen_url  text,               -- la imagen del QR la sube el admin
  enlace_url  text,               -- opcional
  activo      boolean default true,
  orden       int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Ranking de colaboradores de gasolina ───────────────────────────────────
-- privacidad: 'publico' es opt-in (por defecto NO se publica). Si está en
-- false la aportación puede contar para el total, pero no sale en el ranking.
create table if not exists reto50_donantes (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,             -- nombre o alias autorizado, nada sensible
  importe    numeric not null default 0,
  avatar_url text,
  fecha      date,
  publico    boolean default false,
  activo     boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Configuración clave/valor (por si esta migración va sola) ───────────────
create table if not exists reto50_config (
  clave      text primary key,
  valor      text,
  updated_at timestamptz default now(),
  updated_by text
);

create index if not exists reto50_qr_orden_idx        on reto50_qr(orden);
create index if not exists reto50_donantes_importe_idx on reto50_donantes(importe desc);

-- RLS: bloqueo total al público. La web pública lee desde el servidor.
alter table reto50_qr       enable row level security;
alter table reto50_donantes enable row level security;
alter table reto50_config   enable row level security;

-- ── Objetivo de gasolina ───────────────────────────────────────────────────
-- 750 litros ≈ 1.500 €. Editable desde el panel; de aquí sale la equivalencia
-- litros/euro, así que si se cambia el objetivo los litros siguen cuadrando.
-- La recaudación se deja vacía a propósito: vacío = sin dato, no es 0 €.
insert into reto50_config (clave, valor) values
  ('gasolina_objetivo_eur', '1500'),
  ('gasolina_objetivo_litros', '750')
on conflict (clave) do nothing;
