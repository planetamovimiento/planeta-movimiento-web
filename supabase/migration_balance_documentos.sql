-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Balance Económico: carpetas de categorías + facturas/justificantes
--
-- Fase 1 del gestor documental del balance:
--   · las categorías pasan a ser CARPETAS por entidad (empresa / club) y tipo
--     (gasto / ingreso), con subcarpetas (parent_id);
--   · nueva tabla `facturas` para los documentos subidos (PDF, foto o ticket),
--     con sus datos fiscales, su estado de documento y su estado de pago;
--   · `facturas_auditoria` guarda quién sube, corrige, confirma o anula.
--
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo:
-- no toca los gastos ni los ingresos que ya existen.
--
-- ADEMÁS: crear en Storage un bucket PRIVADO llamado "facturas"
--   (Storage → New bucket → name: facturas → Public bucket: OFF).
--   Los documentos llevan datos fiscales: nunca se sirven por URL pública,
--   solo con enlaces firmados de corta duración que genera el servidor.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Categorías como carpetas ──────────────────────────────────────────────
alter table gasto_categorias add column if not exists ambito      text default 'empresa';  -- empresa | club
alter table gasto_categorias add column if not exists tipo        text default 'gasto';    -- gasto | ingreso
alter table gasto_categorias add column if not exists parent_id   uuid references gasto_categorias(id) on delete cascade;
alter table gasto_categorias add column if not exists descripcion text;
alter table gasto_categorias add column if not exists icono       text;

-- El nombre solo tiene que ser único DENTRO de su entidad, tipo y carpeta padre.
alter table gasto_categorias drop constraint if exists gasto_categorias_nombre_key;
create unique index if not exists idx_gasto_categorias_unicas
  on gasto_categorias (lower(nombre), ambito, tipo, coalesce(parent_id, '00000000-0000-0000-0000-000000000000'::uuid));
create index if not exists idx_gasto_categorias_ambito on gasto_categorias (ambito, tipo);

-- ── 2. Facturas y justificantes ──────────────────────────────────────────────
create table if not exists facturas (
  id                uuid primary key default gen_random_uuid(),
  ambito            text not null default 'empresa',   -- empresa | club
  tipo              text not null default 'gasto',     -- gasto | ingreso
  es_ticket         boolean default false,

  -- Clasificación (texto, igual que en gastos/ingresos_manuales, + enlace a la carpeta)
  categoria         text,
  subcategoria      text,
  categoria_id      uuid references gasto_categorias(id) on delete set null,

  -- Datos fiscales del documento
  proveedor         text,          -- o cliente, si es una factura de ingreso
  cif               text,
  numero            text,          -- nº de factura
  concepto          text,
  fecha_emision     date,
  fecha_vencimiento date,
  fecha_pago        date,          -- salida/entrada real del dinero
  base              numeric,
  iva_pct           numeric,
  iva_importe       numeric,
  retencion         numeric,
  total             numeric,
  moneda            text default 'EUR',
  metodo_pago       text,

  -- Estados: el del documento y el del dinero van por separado
  estado_doc        text not null default 'revision',  -- procesando|revision|confirmada|rechazada|duplicada|error|archivada
  estado_pago       text not null default 'pendiente', -- pendiente|pagado|parcial|vencido

  -- Archivo original (bucket PRIVADO "facturas")
  archivo_path      text,
  archivo_nombre    text,
  archivo_mime      text,
  archivo_tamano    bigint,
  archivo_hash      text,          -- sha256 del fichero: detección de duplicados

  -- Lectura automática (fase 2): datos crudos + confianza por campo
  extraido          jsonb,
  notas             text,

  -- Movimiento del balance creado al confirmar (uno solo por factura)
  gasto_id          uuid,
  ingreso_id        uuid,

  created_at        timestamptz default now(),
  created_by        text,
  updated_at        timestamptz,
  updated_by        text
);
create index if not exists idx_facturas_ambito on facturas (ambito, tipo);
create index if not exists idx_facturas_estado on facturas (estado_doc);
create index if not exists idx_facturas_categoria on facturas (categoria);
create index if not exists idx_facturas_fecha on facturas (fecha_emision);
create index if not exists idx_facturas_hash on facturas (archivo_hash);

-- ── 3. Enlace factura ↔ movimiento (para no contabilizar dos veces) ──────────
alter table gastos            add column if not exists factura_id uuid references facturas(id) on delete set null;
alter table ingresos_manuales add column if not exists factura_id uuid references facturas(id) on delete set null;
create unique index if not exists idx_gastos_factura   on gastos (factura_id) where factura_id is not null;
create unique index if not exists idx_ingresos_factura on ingresos_manuales (factura_id) where factura_id is not null;

-- ── 4. Auditoría de los documentos ───────────────────────────────────────────
create table if not exists facturas_auditoria (
  id              uuid primary key default gen_random_uuid(),
  factura_id      uuid references facturas(id) on delete cascade,
  accion          text not null,     -- subida|lectura|correccion|confirmacion|rechazo|anulacion|descarga|borrado
  campo           text,
  valor_anterior  text,
  valor_nuevo     text,
  actor           text,
  created_at      timestamptz default now()
);
create index if not exists idx_facturas_auditoria on facturas_auditoria (factura_id, created_at desc);

alter table facturas           enable row level security;
alter table facturas_auditoria enable row level security;
-- Sin policy pública: solo el servidor (service-role) accede a estos datos.

-- ── 5. Carpetas por defecto ──────────────────────────────────────────────────
-- Las de gasto de la EMPRESA ya existen (EQUIPO, INSTALACIONES…): solo se
-- marcan como empresa/gasto. El resto se crean si faltan.
update gasto_categorias set ambito = coalesce(ambito, 'empresa'), tipo = coalesce(tipo, 'gasto');

insert into gasto_categorias (nombre, color, activa, orden, ambito, tipo)
values
  -- Gastos · Club Deportivo Origen
  ('EQUIPO TÉCNICO',        'rose',    true, 10, 'club', 'gasto'),
  ('INSTALACIONES',         'slate',   true, 20, 'club', 'gasto'),
  ('MATERIAL DEPORTIVO',    'green',   true, 30, 'club', 'gasto'),
  ('COMPETICIONES Y VIAJES','sky',     true, 40, 'club', 'gasto'),
  ('SEGUROS Y LICENCIAS',   'indigo',  true, 50, 'club', 'gasto'),
  ('EQUIPACIONES',          'orange',  true, 60, 'club', 'gasto'),
  ('MARKETING',             'fuchsia', true, 70, 'club', 'gasto'),
  ('OTROS GASTOS',          'gray',    true, 80, 'club', 'gasto'),
  -- Ingresos · Empresa
  ('SERVICIOS',             'green',   true, 10, 'empresa', 'ingreso'),
  ('EVENTOS',               'sky',     true, 20, 'empresa', 'ingreso'),
  ('CAMPAMENTOS',           'amber',   true, 30, 'empresa', 'ingreso'),
  ('CUMPLEAÑOS',            'rose',    true, 40, 'empresa', 'ingreso'),
  ('TALLERES',              'fuchsia', true, 50, 'empresa', 'ingreso'),
  ('FORMACIÓN',             'indigo',  true, 60, 'empresa', 'ingreso'),
  ('SUBVENCIONES',          'slate',   true, 70, 'empresa', 'ingreso'),
  ('PATROCINIOS',           'orange',  true, 80, 'empresa', 'ingreso'),
  ('OTROS INGRESOS',        'gray',    true, 90, 'empresa', 'ingreso'),
  -- Ingresos · Club
  ('CUOTAS',                'green',   true, 10, 'club', 'ingreso'),
  ('CUOTA DE SOCIO',        'sky',     true, 20, 'club', 'ingreso'),
  ('TALLERES INTENSIVOS',   'fuchsia', true, 30, 'club', 'ingreso'),
  ('SUBVENCIONES',          'slate',   true, 40, 'club', 'ingreso'),
  ('PATROCINIOS',           'orange',  true, 50, 'club', 'ingreso'),
  ('OTROS INGRESOS',        'gray',    true, 60, 'club', 'ingreso')
on conflict do nothing;

-- Subcarpetas de gasto de la empresa (las que ya se usaban como subcategoría).
insert into gasto_categorias (nombre, color, activa, orden, ambito, tipo, parent_id)
select sub.nombre, p.color, true, sub.orden, 'empresa', 'gasto', p.id
from gasto_categorias p
join (values
  ('EQUIPO', 'Sueldos / Nóminas', 10),
  ('EQUIPO', 'Seguridad Social', 20),
  ('EQUIPO', 'Pagos Metálico', 30),
  ('EQUIPO EXTERNO', 'Gestoría', 10),
  ('EQUIPO EXTERNO', 'Equipo limpieza', 20),
  ('EQUIPO EXTERNO', 'Protección de datos', 30),
  ('EQUIPO EXTERNO', 'Prevención de riesgos laborales', 40),
  ('EQUIPO EXTERNO', 'Servicios profesionales', 50),
  ('INSTALACIONES', 'Alquiler / Hipoteca', 10),
  ('INSTALACIONES', 'Reformas y mantenimiento', 20),
  ('INSTALACIONES', 'Suministros', 30),
  ('INSTALACIONES', 'Impuestos', 40),
  ('INSTALACIONES', 'Material deportivo', 50),
  ('INSTALACIONES', 'Equipamiento', 60),
  ('INSTALACIONES', 'Limpieza', 70),
  ('MARKETING', 'Mantenimiento y actualización web', 10),
  ('MARKETING', 'Publicidad', 20),
  ('MARKETING', 'Imprenta', 30),
  ('MARKETING', 'Papelería', 40),
  ('SEGUROS', 'Responsabilidad civil', 10),
  ('SEGUROS', 'Seguro de la instalación', 20),
  ('SEGUROS', 'Seguro hipotecario', 30),
  ('ACTIVIDAD', 'Meriendas', 10),
  ('ACTIVIDAD', 'Desplazamientos y gasolina', 20),
  ('ACTIVIDAD', 'Dietas y celebraciones', 30),
  ('ACTIVIDAD', 'Formación', 40),
  ('OTROS GASTOS', 'Tecnología y software', 10),
  ('OTROS GASTOS', 'Telecomunicaciones', 20)
) as sub(padre, nombre, orden) on lower(p.nombre) = lower(sub.padre)
where p.ambito = 'empresa' and p.tipo = 'gasto' and p.parent_id is null
on conflict do nothing;
