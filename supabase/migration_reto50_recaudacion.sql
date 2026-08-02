-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · 50 días, 50 provincias: recaudación en DOS magnitudes distintas
--
--   · Kilos de monedas de céntimos (peso, NO se convierte a euros).
--   · Dinero recaudado en billetes (euros, en céntimos → total confirmado).
--
-- Ejecutar UNA vez. Idempotente y no destructivo. La columna antigua `recaudado`
-- NO se borra (queda como copia de seguridad); su valor se copia a billetes.
-- ═══════════════════════════════════════════════════════════════════════════

alter table reto50_etapas add column if not exists centimos_kg          numeric(10,3);           -- kilos de céntimos
alter table reto50_etapas add column if not exists billetes_cents       bigint;                  -- euros en billetes (céntimos)
alter table reto50_etapas add column if not exists recaudacion_estado   text default 'registrado'; -- pendiente|registrado|revisado|confirmado
alter table reto50_etapas add column if not exists recaudacion_actualizado date;
alter table reto50_etapas add column if not exists recaudacion_notas    text;

-- Copia de seguridad + migración: el `recaudado` en euros que ya existía es
-- dinero en billetes (confirmado por el equipo). Se pasa a billetes_cents solo
-- donde aún no hay valor, para no pisar nada si se reejecuta.
update reto50_etapas
   set billetes_cents = round(recaudado * 100)::bigint,
       recaudacion_estado = coalesce(recaudacion_estado, 'registrado')
 where recaudado is not null
   and billetes_cents is null;
