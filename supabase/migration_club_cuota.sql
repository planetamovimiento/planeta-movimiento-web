-- ─────────────────────────────────────────────────────────────────────────────
-- Cuota de socio del Club Deportivo Origen (temporada 2026/27 en adelante).
-- Añade a club_gestion los campos de cuota, talla de equipación y número de socio.
-- Idempotente y NO destructivo: no toca datos existentes.
-- ─────────────────────────────────────────────────────────────────────────────

alter table club_gestion add column if not exists cuota_estado      text;   -- pendiente | pagada | exenta | no_aplica (null = sin definir)
alter table club_gestion add column if not exists cuota_importe_cents bigint; -- importe real cobrado, en céntimos (nunca coma flotante)
alter table club_gestion add column if not exists cuota_fecha_pago  date;
alter table club_gestion add column if not exists talla             text;   -- talla de equipación (selector estándar)
alter table club_gestion add column if not exists numero_socio      text;   -- número de socio (manual por ahora)

-- Índice para poder listar/asegurar unicidad de socio por temporada si se quiere
-- (no se fuerza única todavía: la numeración es manual y puede quedar vacía).
create index if not exists club_gestion_numero_socio_idx on club_gestion (numero_socio);
