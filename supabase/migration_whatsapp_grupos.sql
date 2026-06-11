-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · Enlace al grupo de WhatsApp (Portal de Familias)
-- URL del grupo de WhatsApp por grupo (defecto) y por alumno (override).
-- Ejecutar una vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- ═══════════════════════════════════════════════════════════════════════════

alter table club_grupos  add column if not exists whatsapp_url text;
alter table club_gestion add column if not exists whatsapp_url text;
