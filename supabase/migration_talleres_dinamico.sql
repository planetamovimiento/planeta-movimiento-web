-- ═══════════════════════════════════════════════════════════════════════════
-- Talleres Intensivos DINÁMICOS. La tabla talleres_intensivos pasa a ser la
-- FUENTE DE VERDAD (crear/editar/duplicar/archivar cualquier intensivo), en vez
-- de guardar solo overrides de los 4 fijos del código. Idempotente, no destructivo.
-- Los campos ricos (descripciones, imágenes, galería, profesor, nivel, edades,
-- plazas, precio, pago {texto,iban,concepto}, sesiones[], modalidades[],
-- observaciones internas, alt) viven en `contenido` jsonb.
-- ═══════════════════════════════════════════════════════════════════════════

alter table talleres_intensivos add column if not exists slug         text;
alter table talleres_intensivos add column if not exists titulo       text;
alter table talleres_intensivos add column if not exists disciplina   text;
alter table talleres_intensivos add column if not exists profesor     text;
alter table talleres_intensivos add column if not exists prioridad    int default 50;   -- 100 alta, 50 normal, 10 baja
alter table talleres_intensivos add column if not exists orden        int default 0;    -- orden manual (desempate)
alter table talleres_intensivos add column if not exists destacado    boolean default false;
alter table talleres_intensivos add column if not exists archivado    boolean default false;
alter table talleres_intensivos add column if not exists publicado_at timestamptz;
alter table talleres_intensivos add column if not exists created_at   timestamptz default now();

create unique index if not exists talleres_intensivos_slug_uidx on talleres_intensivos (slug) where slug is not null;
create index if not exists talleres_intensivos_orden_idx on talleres_intensivos (archivado, prioridad desc, orden);

-- Inscripciones por taller (Club Deportivo Origen: por formulario, pago manual).
create table if not exists taller_inscripciones (
  id                 uuid primary key default gen_random_uuid(),
  taller_id          text not null references talleres_intensivos(id) on delete cascade,
  nombre             text,
  apellidos          text,
  edad               text,
  fecha_nacimiento   date,
  tutor              text,
  telefono           text,
  email              text,
  experiencia        text,
  modalidad          text,
  fechas             text,        -- fechas/sesiones elegidas (texto)
  observaciones      text,
  estado             text default 'nueva',      -- nueva | confirmada | pendiente | cancelada | espera
  pago_estado        text default 'pendiente',  -- pendiente | transferencia | instalacion | exento
  pago_importe_cents bigint,
  pago_fecha         date,
  pago_obs           text,
  created_at         timestamptz default now()
);
create index if not exists taller_inscripciones_taller_idx on taller_inscripciones (taller_id, created_at desc);

alter table taller_inscripciones enable row level security;
