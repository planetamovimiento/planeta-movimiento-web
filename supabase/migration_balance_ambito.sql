-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Ámbito del Balance (empresa vs Club Deportivo Origen)
-- Permite separar los gastos e ingresos manuales entre la empresa y el Club.
-- Los ingresos del Club también se calculan solos desde las cuotas cobradas
-- del CRM (club_gestion.pagos_meta), no hace falta meterlos aquí.
--
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- Las filas existentes quedan como 'empresa' (valor por defecto).
-- ═══════════════════════════════════════════════════════════════════════════

alter table gastos            add column if not exists ambito text default 'empresa';
alter table ingresos_manuales add column if not exists ambito text default 'empresa';
