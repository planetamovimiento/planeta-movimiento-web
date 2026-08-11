-- ─────────────────────────────────────────────────────────────────────────────
-- Forma de pago de la cuota de socio (efectivo / transferencia), registrada a
-- mano en el CRM. Idempotente y NO destructiva.
-- ─────────────────────────────────────────────────────────────────────────────

alter table club_gestion add column if not exists cuota_forma_pago text; -- 'efectivo' | 'transferencia' | null
