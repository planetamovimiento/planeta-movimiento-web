-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · CRM de empresa (capa de gestión sobre reservas/leads/pedidos)
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- Solo AÑADE una tabla; no toca nada existente. Independiente del CRM del Club.
-- ═══════════════════════════════════════════════════════════════════════════

-- Capa de gestión unificada para los servicios de EMPRESA.
-- Cada registro de origen (booking / form / order) tiene aquí su gestión CRM.
create table if not exists crm_gestion (
  origen            text not null,            -- 'booking' | 'form' | 'order'
  origen_id         text not null,
  estado_reserva    text,                     -- nueva|revision|pago_pendiente|confirmada|en_curso|finalizada|cancelada|espera
  estado_pago       text,                     -- pagado|pendiente|impagado|parcial|na
  total             numeric,
  pagado            numeric,
  metodo_pago       text,                     -- tarjeta|transferencia|efectivo|bizum
  fecha_realizacion date,
  participantes     int,
  observaciones     text,
  pagos             jsonb default '[]'::jsonb, -- historial: [{ fecha, importe, metodo, nota }]
  updated_at        timestamptz default now(),
  updated_by        text,
  primary key (origen, origen_id)
);

alter table crm_gestion enable row level security;
