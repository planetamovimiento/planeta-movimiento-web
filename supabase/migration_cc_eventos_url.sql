-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Enlace en los eventos del Calendario Club
-- Permite que un evento (p. ej. «Domingos en Familia») lleve a una página:
-- la familia pincha el evento en su portal y se le abre para reservar.
--
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- ═══════════════════════════════════════════════════════════════════════════

alter table cc_eventos add column if not exists url text;
