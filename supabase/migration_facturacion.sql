-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Facturación (facturas y proformas)
--
-- Ejecutar UNA vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- Solo AÑADE tablas con prefijo billing_. RLS activado SIN policy pública: solo
-- el servidor accede (service-role). Los datos fiscales no salen a rutas públicas.
--
-- Decisiones:
--   · Importes en CÉNTIMOS (bigint). Nada de coma flotante en dinero.
--   · Facturas y proformas comparten tabla (billing_documents, discriminadas por
--     `tipo`): misma forma, y convertir proforma→factura es copiar una fila.
--   · Al EMITIR se congela un snapshot jsonb del emisor y del cliente: editar un
--     perfil luego NO cambia las facturas ya emitidas.
--   · Numeración correlativa por serie con bloqueo de fila (función al final).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Perfiles emisores (empresa / autónomo / club / entidad) ────────────────
create table if not exists billing_profiles (
  id                 uuid primary key default gen_random_uuid(),
  nombre_comercial   text not null,
  razon_social       text,
  nif                text,                       -- CIF/NIF/identificador fiscal
  direccion          text,
  cp                 text,
  localidad          text,
  provincia          text,
  pais               text default 'España',
  telefono           text,
  email              text,
  web                text,
  datos_registrales  text,
  texto_legal        text,
  iban               text,
  bic                text,
  forma_pago         text,                       -- predeterminada
  condiciones_pago   text,                       -- predeterminada
  notas              text,                       -- predeterminadas
  pie_factura        text,
  color              text default '#0F1A3D',     -- corporativo
  moneda             text default 'EUR',
  irpf_pct           numeric(6,3) default 0,     -- retención IRPF por defecto
  logo_url           text,
  sello_url          text,
  firma_url          text,
  predeterminado     boolean default false,
  activo             boolean default true,
  archivado          boolean default false,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- Solo puede haber UN perfil predeterminado.
create unique index if not exists billing_profiles_predeterminado_ux
  on billing_profiles (predeterminado) where predeterminado;

-- ── Series de numeración (una o varias por perfil y tipo) ──────────────────
create table if not exists billing_series (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references billing_profiles(id) on delete cascade,
  tipo           text not null default 'factura',   -- factura | proforma
  prefijo        text not null,                      -- p.ej. 'PM', 'CLUB', 'TDH'
  proximo        int not null default 1,             -- siguiente correlativo
  ejercicio      int,                                -- año del contador actual
  reinicia_anual boolean default true,               -- reinicia a 1 cada año
  predeterminada boolean default false,
  activa         boolean default true,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (profile_id, tipo, prefijo)
);

create index if not exists billing_series_profile_idx on billing_series (profile_id, tipo);

-- ── Clientes de facturación (frecuentes, guardados) ────────────────────────
create table if not exists billing_clients (
  id          uuid primary key default gen_random_uuid(),
  tipo        text default 'empresa',   -- empresa|autonomo|particular|administracion|otro
  nombre      text not null,            -- nombre o razón social
  nif         text,                     -- NIF/CIF/NIE
  direccion   text,
  cp          text,
  localidad   text,
  provincia   text,
  pais        text default 'España',
  email       text,
  telefono    text,
  contacto    text,                     -- persona de contacto
  forma_pago  text,
  iban        text,
  notas       text,                     -- internas
  archivado   boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists billing_clients_nombre_idx on billing_clients (nombre);
create index if not exists billing_clients_nif_idx     on billing_clients (nif);

-- ── Documentos: facturas y proformas ───────────────────────────────────────
create table if not exists billing_documents (
  id                uuid primary key default gen_random_uuid(),
  tipo              text not null default 'factura',   -- factura | proforma
  profile_id        uuid references billing_profiles(id) on delete restrict,
  serie_id          uuid references billing_series(id)  on delete restrict,
  client_id         uuid references billing_clients(id) on delete set null,

  numero            text,        -- p.ej. 'PM-2026-0001'. NULL en borrador.
  numero_int        int,         -- correlativo dentro de la serie. NULL en borrador.
  fecha             date,        -- emisión
  vencimiento       date,
  estado            text not null default 'borrador',
  moneda            text default 'EUR',

  forma_pago        text,
  condiciones_pago  text,
  referencia        text,
  num_pedido        text,
  observaciones     text,        -- salen en el PDF
  notas_internas    text,        -- NUNCA en el PDF
  pie_legal         text,
  validez_dias      int,         -- proforma: días de validez

  -- Snapshot inmutable: se rellena al emitir. Editar el perfil/cliente después
  -- NO altera estos datos.
  emisor_snapshot   jsonb,
  cliente_snapshot  jsonb,

  -- Totales en céntimos (se recalculan en el servidor a partir de las líneas).
  base_cents        bigint default 0,   -- base imponible tras descuentos
  descuento_cents   bigint default 0,   -- descuentos aplicados
  iva_cents         bigint default 0,
  irpf_cents        bigint default 0,
  suplidos_cents    bigint default 0,
  total_cents       bigint default 0,
  pagado_cents      bigint default 0,

  -- Enlaces proforma <-> factura
  origen_documento_id      uuid references billing_documents(id) on delete set null,
  convertida_documento_id  uuid references billing_documents(id) on delete set null,

  created_by        text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Nº único dentro de una serie (solo cuando ya está asignado).
create unique index if not exists billing_documents_serie_num_ux
  on billing_documents (serie_id, numero_int) where numero_int is not null;
create index if not exists billing_documents_tipo_estado_idx on billing_documents (tipo, estado);
create index if not exists billing_documents_profile_idx     on billing_documents (profile_id);
create index if not exists billing_documents_client_idx      on billing_documents (client_id);
create index if not exists billing_documents_fecha_idx       on billing_documents (fecha);

-- ── Líneas de documento ─────────────────────────────────────────────────────
create table if not exists billing_document_lines (
  id             uuid primary key default gen_random_uuid(),
  documento_id   uuid not null references billing_documents(id) on delete cascade,
  orden          int default 0,
  concepto       text not null,
  descripcion    text,
  cantidad       numeric(14,4) not null default 1,
  unidad         text,                       -- ud, h, kg…
  precio_cents   bigint not null default 0,  -- precio unitario en céntimos
  descuento_pct  numeric(6,3) default 0,
  descuento_cents bigint default 0,          -- descuento fijo adicional
  iva_pct        numeric(6,3) default 21,
  iva_tipo       text default 'normal',      -- normal|exento|no_sujeto
  irpf_pct       numeric(6,3) default 0,
  base_cents     bigint default 0,           -- base de la línea tras descuentos
  total_cents    bigint default 0            -- base + IVA - IRPF de la línea
);

create index if not exists billing_lines_doc_idx on billing_document_lines (documento_id, orden);

-- ── Pagos de un documento (parciales permitidos) ───────────────────────────
create table if not exists billing_payments (
  id            uuid primary key default gen_random_uuid(),
  documento_id  uuid not null references billing_documents(id) on delete cascade,
  fecha         date not null default current_date,
  importe_cents bigint not null,
  metodo        text,
  referencia    text,
  observaciones text,
  created_by    text,
  created_at    timestamptz default now()
);

create index if not exists billing_payments_doc_idx on billing_payments (documento_id);

-- ── Auditoría (append-only; el panel normal no la edita ni la borra) ───────
create table if not exists billing_audit (
  id            uuid primary key default gen_random_uuid(),
  documento_id  uuid,
  actor_email   text,
  accion        text not null,      -- creado|emitido|editado|pago|anulado|descargado|enviado…
  detalle       jsonb,
  created_at    timestamptz default now()
);

create index if not exists billing_audit_doc_idx on billing_audit (documento_id);

-- ── RLS: bloqueo total al público. Solo el servidor (service-role) accede ──
alter table billing_profiles       enable row level security;
alter table billing_series         enable row level security;
alter table billing_clients        enable row level security;
alter table billing_documents      enable row level security;
alter table billing_document_lines enable row level security;
alter table billing_payments       enable row level security;
alter table billing_audit          enable row level security;

-- ═══════════════════════════════════════════════════════════════════════════
-- Numeración correlativa protegida frente a emisiones simultáneas.
-- Bloquea la fila de la serie (FOR UPDATE), reinicia por ejercicio si procede,
-- incrementa y devuelve el número formateado. Se llama al EMITIR, nunca antes.
-- ═══════════════════════════════════════════════════════════════════════════
create or replace function billing_siguiente_numero(p_serie_id uuid, p_ejercicio int)
returns table (numero_int int, numero text)
language plpgsql
as $$
declare
  s billing_series%rowtype;
  n int;
begin
  select * into s from billing_series where id = p_serie_id for update;
  if not found then
    raise exception 'Serie % no encontrada', p_serie_id;
  end if;

  -- Reinicio anual: si la serie lo tiene activado y cambia el ejercicio.
  if s.reinicia_anual and (s.ejercicio is distinct from p_ejercicio) then
    n := 1;
  else
    n := coalesce(s.proximo, 1);
  end if;

  update billing_series
     set proximo = n + 1, ejercicio = p_ejercicio, updated_at = now()
   where id = p_serie_id;

  numero_int := n;
  numero := s.prefijo || '-' || p_ejercicio::text || '-' || lpad(n::text, 4, '0');
  return next;
end;
$$;
