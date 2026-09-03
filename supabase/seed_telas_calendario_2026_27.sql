-- ═══════════════════════════════════════════════════════════════════════════
-- SEED · Clases de Telas Aéreas (Escuela de aéreos) en el Calendario Club
-- Temporada 2026/27. Crea las clases recurrentes públicas para que aparezcan en
-- el Calendario Club, en el Portal de Familias y para las listas de asistencia.
--
-- Ejecutar UNA VEZ en el SQL Editor de Supabase (vuelve a insertar si se repite).
-- Los festivos y "días sin clase" se excluyen solos (excluir_festivos/…_sin_clase).
-- Requiere haber ejecutado antes migration_calendario_club.sql.
-- ═══════════════════════════════════════════════════════════════════════════

insert into cc_eventos (tipo, titulo, actividad, grupo, temporada, fecha, hora_inicio, hora_fin, todo_el_dia, recurrencia, publico, estado)
values
  ('clase', 'Telas · Iniciación 1',       'Escuela de aéreos', 'Iniciación 1',       '2026/27', '2026-09-01', '16:00', '17:00', false, '{"dias":[1,3],   "hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Telas · Iniciación 2',       'Escuela de aéreos', 'Iniciación 2',       '2026/27', '2026-09-01', '16:00', '17:00', false, '{"dias":[5],     "hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Telas · Medio 1',            'Escuela de aéreos', 'Medio 1',            '2026/27', '2026-09-01', '17:00', '18:00', false, '{"dias":[1,3],   "hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Telas · Medio 2',            'Escuela de aéreos', 'Medio 2',            '2026/27', '2026-09-01', '16:00', '17:00', false, '{"dias":[2,4],   "hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Telas · Medio 3',            'Escuela de aéreos', 'Medio 3',            '2026/27', '2026-09-01', '17:00', '18:00', false, '{"dias":[5],     "hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Telas · Avanzado 1',         'Escuela de aéreos', 'Avanzado 1',         '2026/27', '2026-09-01', '17:00', '18:00', false, '{"dias":[2,4],   "hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Telas · Adultos / P. libre','Escuela de aéreos', 'Adultos / P. libre', '2026/27', '2026-09-01', '20:00', '21:30', false, '{"dias":[1,2,3,4],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo');
