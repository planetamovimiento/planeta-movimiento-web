-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Horario por defecto de cada grupo del Club
-- Permite fijar una hora por grupo (se muestra en el Portal de Familias).
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- ═══════════════════════════════════════════════════════════════════════════

alter table club_grupos add column if not exists horario text;
