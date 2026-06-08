-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Balance Económico (CRM)
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- Crea: gasto_categorias, gastos, ingresos_manuales.
-- Los INGRESOS automáticos se calculan en la app desde bookings/orders (CRM);
-- aquí solo se guardan los GASTOS y los INGRESOS manuales (histórico/efectivo).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Categorías de gasto (configurables desde el panel) ───────────────────────
create table if not exists gasto_categorias (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null unique,
  color       text default 'gray',
  activa      boolean default true,
  orden       int default 0,
  created_at  timestamptz default now()
);

-- ── Gastos (manuales) ────────────────────────────────────────────────────────
create table if not exists gastos (
  id            uuid primary key default gen_random_uuid(),
  fecha         date not null,
  concepto      text not null,
  categoria     text,
  subcategoria  text,
  proveedor     text,
  importe       numeric not null default 0,   -- importe base (sin IVA si se desglosa)
  iva           numeric,                       -- % (ej. 21) o null si no aplica
  metodo_pago   text,                          -- Transferencia|Tarjeta|Efectivo|Bizum|Domiciliación
  estado        text default 'pagado',         -- pendiente|pagado|programado|cancelado
  observaciones text,
  adjunto_url   text,                           -- justificante/foto de factura
  factura_ref   text,                           -- nº de factura / referencia
  created_at    timestamptz default now(),
  created_by    text,
  updated_at    timestamptz,
  updated_by    text
);
create index if not exists idx_gastos_fecha on gastos (fecha);
create index if not exists idx_gastos_categoria on gastos (categoria);

-- ── Ingresos manuales (cuando no provienen de una reserva/pedido) ────────────
create table if not exists ingresos_manuales (
  id            uuid primary key default gen_random_uuid(),
  fecha         date not null,
  concepto      text not null,
  servicio      text,
  categoria     text,
  cliente       text,
  importe       numeric not null default 0,
  pagado        numeric,
  metodo_pago   text,
  estado        text default 'pagado',         -- pendiente|pagado|parcial|cancelado|reembolsado
  referencia    text,
  observaciones text,
  created_at    timestamptz default now(),
  created_by    text,
  updated_at    timestamptz,
  updated_by    text
);
create index if not exists idx_ingresos_manuales_fecha on ingresos_manuales (fecha);

-- ── RLS: sin políticas públicas (solo el service-role del panel accede) ──────
alter table gasto_categorias  enable row level security;
alter table gastos            enable row level security;
alter table ingresos_manuales enable row level security;

-- ── Semilla de categorías (estructura real del Excel de tesorería) ───────────
insert into gasto_categorias (nombre, color, orden) values
  ('EQUIPO',                      'rose',    10),
  ('EQUIPO EXTERNO',              'orange',  20),
  ('INSTALACIONES',               'slate',   30),
  ('MARKETING',                   'fuchsia', 40),
  ('SEGUROS',                     'indigo',  50),
  ('ACTIVIDAD',                   'green',   60),
  ('PATROCINIOS Y APORTACIONES',  'amber',   70),
  ('OTROS GASTOS',                'gray',    80)
on conflict (nombre) do nothing;
