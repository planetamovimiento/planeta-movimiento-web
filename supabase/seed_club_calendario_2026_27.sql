-- ═══════════════════════════════════════════════════════════════════════════
-- SEED · Clases de TODO el Club en el Calendario Club (temporada 2026/27)
-- Acrobática, Telas (Escuela de aéreos), Infantil, JJB (sábados) y Bienestar.
-- Borra las clases 2026/27 existentes y las vuelve a crear: idempotente.
-- Ejecutar en Supabase → SQL Editor. Requiere migration_calendario_club.sql.
-- ═══════════════════════════════════════════════════════════════════════════

delete from cc_eventos where tipo = 'clase' and temporada = '2026/27';

insert into cc_eventos (tipo, titulo, actividad, grupo, temporada, fecha, hora_inicio, hora_fin, todo_el_dia, recurrencia, publico, estado)
values
  ('clase', 'Acro · Iniciación 1', 'Gimnasia Acrobática', 'Iniciación 1', '2026/27', '2026-09-01', '16:00', '17:00', false, '{"dias":[1,3],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Acro · Iniciación 2', 'Gimnasia Acrobática', 'Iniciación 2', '2026/27', '2026-09-01', '16:00', '17:00', false, '{"dias":[2,4],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Acro · Iniciación 3', 'Gimnasia Acrobática', 'Iniciación 3', '2026/27', '2026-09-01', '16:00', '17:00', false, '{"dias":[5],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Acro · Medio 1', 'Gimnasia Acrobática', 'Medio 1', '2026/27', '2026-09-01', '17:00', '18:00', false, '{"dias":[1,3],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Acro · Medio 2', 'Gimnasia Acrobática', 'Medio 2', '2026/27', '2026-09-01', '17:00', '18:00', false, '{"dias":[2,4],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Acro · Medio 3', 'Gimnasia Acrobática', 'Medio 3', '2026/27', '2026-09-01', '17:00', '18:00', false, '{"dias":[5],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Acro · Avanzado 1', 'Gimnasia Acrobática', 'Avanzado 1', '2026/27', '2026-09-01', '20:00', '21:30', false, '{"dias":[1,3],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Acro · Avanzado 2', 'Gimnasia Acrobática', 'Avanzado 2', '2026/27', '2026-09-01', '20:00', '21:30', false, '{"dias":[2,4],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Acro · Adultos', 'Gimnasia Acrobática', 'Adultos', '2026/27', '2026-09-01', '20:00', '21:30', false, '{"dias":[1,2,3,4],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Telas · Iniciación 1', 'Escuela de aéreos', 'Iniciación 1', '2026/27', '2026-09-01', '16:00', '17:00', false, '{"dias":[1,3],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Telas · Iniciación 2', 'Escuela de aéreos', 'Iniciación 2', '2026/27', '2026-09-01', '16:00', '17:00', false, '{"dias":[5],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Telas · Medio 1', 'Escuela de aéreos', 'Medio 1', '2026/27', '2026-09-01', '17:00', '18:00', false, '{"dias":[1,3],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Telas · Medio 2', 'Escuela de aéreos', 'Medio 2', '2026/27', '2026-09-01', '16:00', '17:00', false, '{"dias":[2,4],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Telas · Medio 3', 'Escuela de aéreos', 'Medio 3', '2026/27', '2026-09-01', '17:00', '18:00', false, '{"dias":[5],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Telas · Avanzado 1', 'Escuela de aéreos', 'Avanzado 1', '2026/27', '2026-09-01', '17:00', '18:00', false, '{"dias":[2,4],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Telas · Adultos / P. libre', 'Escuela de aéreos', 'Adultos / P. libre', '2026/27', '2026-09-01', '20:00', '21:30', false, '{"dias":[1,2,3,4],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Infantil · Infantil 1', 'Escuela infantil', 'Infantil 1', '2026/27', '2026-09-01', '16:00', '17:00', false, '{"dias":[1,3],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Infantil · Infantil 2', 'Escuela infantil', 'Infantil 2', '2026/27', '2026-09-01', '17:00', '18:00', false, '{"dias":[1,3],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Infantil · Infantil 3', 'Escuela infantil', 'Infantil 3', '2026/27', '2026-09-01', '16:00', '17:00', false, '{"dias":[2,4],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Infantil · Infantil 4', 'Escuela infantil', 'Infantil 4', '2026/27', '2026-09-01', '17:00', '18:00', false, '{"dias":[2,4],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Infantil · Infantil 5', 'Escuela infantil', 'Infantil 5', '2026/27', '2026-09-01', '16:00', '17:00', false, '{"dias":[5],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Infantil · Infantil 6', 'Escuela infantil', 'Infantil 6', '2026/27', '2026-09-01', '17:00', '18:00', false, '{"dias":[5],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'JJB · JJB 1', 'Jiu-Jitsu Brasileño', 'JJB 1', '2026/27', '2026-09-01', '11:30', '13:30', false, '{"dias":[6],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo'),
  ('clase', 'Bienestar · Bienestar 1', 'Escuela de Bienestar', 'Bienestar 1', '2026/27', '2026-09-01', '09:30', '10:30', false, '{"dias":[1,3,5],"hasta":"2027-06-30","excluir_festivos":true,"excluir_sin_clase":true}'::jsonb, true, 'activo');
