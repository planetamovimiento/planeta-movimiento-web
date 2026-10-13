-- ─────────────────────────────────────────────────────────────────────────────
-- LA FÁBRICA DE PAPÁ NOEL — pases, entradas y control de aforo
--
-- Pegar entero en Supabase → SQL Editor → Run. Es idempotente: se puede volver
-- a ejecutar sin romper nada.
--
-- El aforo se controla AQUÍ (no en el navegador): la función navidad_reservar
-- bloquea la fila del pase (SELECT ... FOR UPDATE) antes de contar plazas, así
-- dos personas comprando a la vez nunca pueden pasarse del aforo.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Pases (fecha + hora) ─────────────────────────────────────────────────────
create table if not exists navidad_pases (
  id         uuid primary key default gen_random_uuid(),
  fecha      date not null,
  hora       text not null,                 -- '10:00'
  hora_fin   text not null default '',      -- '10:50'
  aforo      int  not null default 25,
  bloqueado  boolean not null default false,
  created_at timestamptz default now(),
  unique (fecha, hora)
);

-- ── Entradas (una fila por compra) ───────────────────────────────────────────
create table if not exists navidad_reservas (
  id              uuid primary key default gen_random_uuid(),
  pase_id         uuid not null references navidad_pases(id) on delete restrict,
  localizador     text not null unique,     -- 'PN-XXXXXX'
  booking_id      uuid,                     -- fila de bookings (CRM) si existe
  ds_order        text,                     -- nº de pedido Redsys (enlaza el cobro)

  cliente_nombre   text not null,
  cliente_email    text not null,
  cliente_telefono text not null,
  notas            text default '',

  ninos   int not null default 0,
  adultos int not null default 0,
  bebes   int not null default 0,
  plazas  int not null,                     -- ninos + adultos + bebes (ocupa aforo)

  -- Importes SIEMPRE en céntimos (se calculan en el servidor).
  subtotal_cents  int not null default 0,
  descuento_tipo  text not null default 'ninguno',   -- ninguno | grupo | socio
  descuento_pct   int  not null default 0,
  descuento_cents int  not null default 0,
  total_cents     int  not null default 0,
  socio_numero    text default '',

  estado     text not null default 'pendiente',      -- pendiente | confirmada | cancelada | reembolsada
  expira_at  timestamptz,                            -- solo mientras está pendiente de pago
  asistio    boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_navidad_reservas_pase  on navidad_reservas(pase_id);
create index if not exists idx_navidad_reservas_order on navidad_reservas(ds_order);
create index if not exists idx_navidad_reservas_email on navidad_reservas(cliente_email);

-- ── Ocupación: confirmadas + pendientes aún no caducadas ─────────────────────
-- Las reservas pendientes caducadas liberan su plaza solas (no hace falta
-- ningún proceso de limpieza).
create or replace view navidad_ocupacion as
select p.id as pase_id,
       coalesce(sum(r.plazas) filter (
         where r.estado = 'confirmada'
            or (r.estado = 'pendiente' and r.expira_at > now())
       ), 0)::int as ocupadas
from navidad_pases p
left join navidad_reservas r on r.pase_id = p.id
group by p.id;

-- ── Reserva atómica (anti-sobreventa) ────────────────────────────────────────
-- Devuelve la fila creada. Lanza:
--   'PASE_NO_EXISTE' | 'PASE_BLOQUEADO' | 'SIN_PLAZAS:<libres>'
create or replace function navidad_reservar(
  p_pase_id         uuid,
  p_localizador     text,
  p_nombre          text,
  p_email           text,
  p_telefono        text,
  p_notas           text,
  p_ninos           int,
  p_adultos         int,
  p_bebes           int,
  p_subtotal_cents  int,
  p_descuento_tipo  text,
  p_descuento_pct   int,
  p_descuento_cents int,
  p_total_cents     int,
  p_socio           text,
  p_minutos         int default 30
) returns navidad_reservas
language plpgsql
as $$
declare
  v_pase     navidad_pases;
  v_ocupadas int;
  v_plazas   int := coalesce(p_ninos,0) + coalesce(p_adultos,0) + coalesce(p_bebes,0);
  v_fila     navidad_reservas;
begin
  if v_plazas < 1 then
    raise exception 'SIN_ASISTENTES';
  end if;

  -- Cerrojo de fila: serializa las compras simultáneas del mismo pase.
  select * into v_pase from navidad_pases where id = p_pase_id for update;
  if not found then
    raise exception 'PASE_NO_EXISTE';
  end if;
  if v_pase.bloqueado then
    raise exception 'PASE_BLOQUEADO';
  end if;

  select coalesce(sum(plazas), 0) into v_ocupadas
  from navidad_reservas
  where pase_id = p_pase_id
    and (estado = 'confirmada' or (estado = 'pendiente' and expira_at > now()));

  if v_ocupadas + v_plazas > v_pase.aforo then
    raise exception 'SIN_PLAZAS:%', greatest(v_pase.aforo - v_ocupadas, 0);
  end if;

  insert into navidad_reservas (
    pase_id, localizador, cliente_nombre, cliente_email, cliente_telefono, notas,
    ninos, adultos, bebes, plazas,
    subtotal_cents, descuento_tipo, descuento_pct, descuento_cents, total_cents,
    socio_numero, estado, expira_at
  ) values (
    p_pase_id, p_localizador, p_nombre, p_email, p_telefono, coalesce(p_notas, ''),
    coalesce(p_ninos,0), coalesce(p_adultos,0), coalesce(p_bebes,0), v_plazas,
    p_subtotal_cents, coalesce(p_descuento_tipo,'ninguno'), coalesce(p_descuento_pct,0),
    coalesce(p_descuento_cents,0), p_total_cents,
    coalesce(p_socio,''), 'pendiente', now() + make_interval(mins => greatest(p_minutos, 5))
  ) returning * into v_fila;

  return v_fila;
end;
$$;

-- ── Bajar el aforo nunca por debajo de lo ya vendido ─────────────────────────
create or replace function navidad_set_aforo(p_pase_id uuid, p_aforo int)
returns navidad_pases
language plpgsql
as $$
declare
  v_pase     navidad_pases;
  v_ocupadas int;
begin
  select * into v_pase from navidad_pases where id = p_pase_id for update;
  if not found then
    raise exception 'PASE_NO_EXISTE';
  end if;

  select coalesce(sum(plazas), 0) into v_ocupadas
  from navidad_reservas
  where pase_id = p_pase_id
    and (estado = 'confirmada' or (estado = 'pendiente' and expira_at > now()));

  if p_aforo < v_ocupadas then
    raise exception 'AFORO_MENOR_QUE_VENDIDO:%', v_ocupadas;
  end if;

  update navidad_pases set aforo = p_aforo where id = p_pase_id returning * into v_pase;
  return v_pase;
end;
$$;

-- ── Pases de la edición 2026 ─────────────────────────────────────────────────
-- 18, 19, 22 y 23 de diciembre: 7 pases. 24 de diciembre: solo mañanas.
insert into navidad_pases (fecha, hora, hora_fin, aforo)
select dias.d::date, h.inicio, h.fin, 25
from (values
  ('2026-12-18'), ('2026-12-19'), ('2026-12-22'), ('2026-12-23')
) as dias(d)
cross join (values
  ('10:00','10:50'), ('11:00','11:50'), ('12:00','12:50'),
  ('16:00','16:50'), ('17:00','17:50'), ('18:00','18:50'), ('19:00','19:50')
) as h(inicio, fin)
on conflict (fecha, hora) do nothing;

insert into navidad_pases (fecha, hora, hora_fin, aforo)
values
  ('2026-12-24','10:00','10:50',25),
  ('2026-12-24','11:00','11:50',25),
  ('2026-12-24','12:00','12:50',25)
on conflict (fecha, hora) do nothing;

-- ── Seguridad: solo el servidor (service role) toca estas tablas ─────────────
alter table navidad_pases    enable row level security;
alter table navidad_reservas enable row level security;
