-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Hojas de horas trabajadas firmadas por el monitor
-- El administrador sube la hoja (PDF o imagen) desde la ficha del monitor y el
-- monitor la firma desde su portal (ratón o dedo). La firma se guarda como PNG
-- en el bucket PRIVADO "monitores-docs", junto a la propia hoja.
--
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- RLS activado SIN policy pública: solo el servidor accede (service-role).
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists monitor_hojas_horas (
  id            uuid primary key default gen_random_uuid(),
  monitor_id    uuid references monitores(id) on delete cascade,
  periodo       text not null,              -- "Septiembre 2026", "Semana 12"…
  archivo_path  text not null,              -- ruta en el bucket privado monitores-docs
  archivo_tipo  text,                       -- application/pdf, image/jpeg…
  subido_por    text,
  observaciones text,
  firmado_at    timestamptz,                -- null = pendiente de firma
  firma_path    text,                       -- PNG de la firma (bucket privado)
  firma_nombre  text,                       -- nombre con el que firmó el monitor
  created_at    timestamptz default now()
);

create index if not exists idx_hojas_horas_monitor on monitor_hojas_horas (monitor_id, created_at desc);

alter table monitor_hojas_horas enable row level security;
