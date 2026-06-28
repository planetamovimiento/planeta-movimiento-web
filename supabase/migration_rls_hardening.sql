-- ═══════════════════════════════════════════════════════════════════════════
-- Endurecimiento RLS · cerrar el alta directa con la anon key
-- ═══════════════════════════════════════════════════════════════════════════
-- Las reservas, formularios y pedidos REALES se insertan siempre desde server
-- actions con la clave service-role (lib/forms/actions.ts, app/reservar/actions.ts,
-- app/admin/club/actions.ts), que ignora RLS. Estas tres políticas solo permitían
-- que un bot insertara filas directamente con la anon key, saltándose la capa
-- antispam del servidor (honeypot, tiempo, rate-limit, Turnstile). Las quitamos.
--
-- Ejecutar UNA vez en el SQL Editor de Supabase. Es seguro y reversible
-- (bastaría recrear las políticas para volver atrás).

drop policy if exists "public insert booking" on bookings;
drop policy if exists "public insert forms"   on form_submissions;
drop policy if exists "public insert order"   on product_orders;

-- La lectura pública de servicios/productos activos se mantiene (la necesita la web).
