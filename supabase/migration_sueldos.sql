-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Sueldos de los monitores (Balance Económico)
-- Cada línea es algo que se le paga a un monitor: una clase, un cumpleaños,
-- un taller, la nómina del mes… Con su importe bruto, lo que se le entrega en
-- mano o por transferencia, y si está pagado o pendiente.
--
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- RLS activado SIN policy pública: solo el servidor accede (service-role).
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists sueldos (
  id            uuid primary key default gen_random_uuid(),
  monitor_id    uuid references monitores(id) on delete cascade,
  -- 'empresa' (Planeta Movimiento S.L.) o 'club' (Club Deportivo Origen)
  ambito        text not null default 'empresa',
  fecha         date not null,
  -- Qué se le paga: Cumpleaños, Taller, Clases, Campamento, Nómina…
  concepto      text not null,
  detalle       text,
  -- Importes en euros
  bruto         numeric not null default 0,
  neto          numeric not null default 0,
  -- 'efectivo' | 'nomina' | 'transferencia'
  metodo        text not null default 'efectivo',
  -- 'pendiente' | 'pagado'
  estado        text not null default 'pendiente',
  fecha_pago    date,
  horas         numeric,
  notas         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  updated_by    text
);

create index if not exists sueldos_monitor_idx on sueldos (monitor_id, fecha desc);
create index if not exists sueldos_fecha_idx   on sueldos (fecha desc);

alter table sueldos enable row level security;
