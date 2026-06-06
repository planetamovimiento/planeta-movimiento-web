-- ═══════════════════════════════════════════════════════════════════════════
-- PLANETA MOVIMIENTO · Esquema del panel de administración
-- Ejecutar una vez en el SQL Editor de Supabase. Es idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Roles ───────────────────────────────────────────────────────────────────
do $$ begin
  create type admin_role as enum ('principal', 'gestor', 'lectura');
exception when duplicate_object then null; end $$;

-- ── Administradores autorizados ──────────────────────────────────────────────
create table if not exists admin_users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  nombre      text,
  role        admin_role not null default 'gestor',
  activo      boolean not null default true,
  invited_by  text,
  created_at  timestamptz default now()
);

-- ── Clientes / contactos ─────────────────────────────────────────────────────
create table if not exists customers (
  id              uuid primary key default gen_random_uuid(),
  nombre          text,
  email           text unique,
  telefono        text,
  notas           text,
  ultimo_contacto timestamptz,
  created_at      timestamptz default now()
);

-- ── Servicios (contenido editable de la web) ─────────────────────────────────
create table if not exists services (
  id          text primary key,          -- slug, ej. 'cumpleanos'
  nombre      text not null,
  categoria   text,                       -- club, ocio, educacion, eventos, ecommerce
  descripcion text,
  precio      numeric,
  estado      text default 'activo',      -- activo, inactivo, completo, proximamente
  destacado   boolean default false,
  enlace      text,
  orden       int default 0,
  updated_at  timestamptz default now()
);

-- ── Reservas ─────────────────────────────────────────────────────────────────
create table if not exists bookings (
  id                uuid primary key default gen_random_uuid(),
  numero            text unique,
  servicio          text,
  cliente_id        uuid references customers(id) on delete set null,
  cliente_nombre    text,
  cliente_email     text,
  cliente_telefono  text,
  fecha             date,
  hora              text,
  participantes     int,
  precio            numeric,
  estado_reserva    text default 'pendiente',  -- pendiente, confirmada, pagada, cancelada, espera, reembolsada
  estado_pago       text default 'pendiente',  -- pendiente, pagado, fallido, reembolsado, parcial
  observaciones     text,
  notas_internas    text,
  created_at        timestamptz default now()
);

-- ── Pagos ────────────────────────────────────────────────────────────────────
create table if not exists payments (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid references bookings(id) on delete set null,
  cliente_nombre  text,
  servicio        text,
  importe         numeric,
  fianza          numeric,
  pendiente       numeric,
  metodo          text,                      -- tarjeta, transferencia, efectivo, bizum
  estado          text default 'pendiente',  -- pendiente, pagado, fallido, reembolsado, parcial
  referencia      text,
  fecha           timestamptz default now()
);

-- ── Formularios y solicitudes ────────────────────────────────────────────────
create table if not exists form_submissions (
  id          uuid primary key default gen_random_uuid(),
  tipo        text,                      -- informacion, presupuesto, colchonetas, contacto, inscripcion, colegio, ayuntamiento, empresa
  nombre      text,
  email       text,
  telefono    text,
  asunto      text,
  mensaje     text,
  datos       jsonb,
  estado      text default 'nueva',      -- nueva, leida, respondida, seguimiento, cerrada
  created_at  timestamptz default now()
);

-- ── Disponibilidad / calendario ──────────────────────────────────────────────
create table if not exists availability (
  id               uuid primary key default gen_random_uuid(),
  servicio         text,
  fecha            date,
  hora_inicio      text,
  hora_fin         text,
  plazas_total     int,
  plazas_ocupadas  int default 0,
  estado           text default 'disponible',  -- disponible, completo, bloqueado
  created_at       timestamptz default now()
);

-- ── Productos (ecommerce) ────────────────────────────────────────────────────
create table if not exists products (
  id          text primary key,
  nombre      text,
  precio      numeric,
  colores     jsonb,
  variantes   jsonb,
  stock       int,
  activo      boolean default true,
  updated_at  timestamptz default now()
);

-- ── Pedidos y personalizaciones ──────────────────────────────────────────────
create table if not exists product_orders (
  id                uuid primary key default gen_random_uuid(),
  cliente_nombre    text,
  cliente_email     text,
  cliente_telefono  text,
  items             jsonb,
  total             numeric,
  estado            text default 'nuevo',     -- nuevo, preparando, enviado, entregado, cancelado
  tipo              text default 'pedido',     -- pedido, personalizacion
  detalle           text,
  created_at        timestamptz default now()
);

-- ── Registro de actividad ────────────────────────────────────────────────────
create table if not exists activity_log (
  id           uuid primary key default gen_random_uuid(),
  actor_email  text,
  accion       text,
  entidad      text,
  entidad_id   text,
  detalle      text,
  created_at   timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS — Bloqueo total al público; el panel accede con la service-role key.
-- El sitio público solo puede INSERTAR formularios, reservas y pedidos.
-- ═══════════════════════════════════════════════════════════════════════════
alter table admin_users      enable row level security;
alter table customers        enable row level security;
alter table services         enable row level security;
alter table bookings         enable row level security;
alter table payments         enable row level security;
alter table form_submissions enable row level security;
alter table availability     enable row level security;
alter table products         enable row level security;
alter table product_orders   enable row level security;
alter table activity_log     enable row level security;

-- El público puede enviar formularios / reservas / pedidos (INSERT)
do $$ begin
  create policy "public insert forms"  on form_submissions for insert to anon with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public insert booking" on bookings for insert to anon with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public insert order"  on product_orders for insert to anon with check (true);
exception when duplicate_object then null; end $$;

-- Los servicios y productos activos pueden leerse públicamente (web)
do $$ begin
  create policy "public read services" on services for select to anon using (estado = 'activo');
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read products" on products for select to anon using (activo = true);
exception when duplicate_object then null; end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED · Administrador principal
-- ═══════════════════════════════════════════════════════════════════════════
insert into admin_users (email, nombre, role, invited_by)
values ('zumitolol@gmail.com', 'Administrador principal', 'principal', 'sistema')
on conflict (email) do update set role = 'principal', activo = true;
