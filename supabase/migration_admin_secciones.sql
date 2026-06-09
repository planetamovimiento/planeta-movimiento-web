-- ─────────────────────────────────────────────────────────────────────────────
-- Permisos por sección para administradores del panel.
-- Añade la columna `secciones` (apartados visibles) a la tabla admin_users.
--
-- Es SEGURA y retrocompatible:
--   · NULL = acceso a todas las secciones asignables.
--   · Los administradores "principal" tienen acceso total (la columna se ignora).
--   · No bloquea ni altera el funcionamiento actual de la web.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.admin_users
  add column if not exists secciones text[];

-- Mantener EXACTAMENTE la visibilidad que ya tenían las cuentas no-principal:
-- antes veían todo menos "Pagos" y "Administradores". Les fijamos esa lista.
update public.admin_users
set secciones = array['club','reservas','productos','formularios','calendario','servicios','clientes','balance','actividad']
where role <> 'principal'
  and secciones is null;

-- (Los administradores principal no necesitan lista: ven todo siempre.)
