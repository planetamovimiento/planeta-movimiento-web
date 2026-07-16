-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN · 50 días, 50 provincias (reto solidario de Brosjaca a beneficio
-- de la Asociación Española Contra el Cáncer, organizado por Planeta Movimiento).
--
-- Ejecutar UNA vez en el SQL Editor de Supabase. Idempotente y no destructivo.
-- Solo AÑADE tablas con prefijo reto50_; no modifica ni borra nada existente.
-- RLS activado SIN policy pública: solo el servidor accede (service-role).
--
-- Los logos de patrocinadores y las fotos de cada etapa se suben al bucket
-- público ya existente "fotos" desde el panel; no hace falta bucket nuevo.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Etapas: una por día y provincia (50 en total) ──────────────────────────
create table if not exists reto50_etapas (
  id                uuid primary key default gen_random_uuid(),
  dia               int not null unique,              -- 1..50
  fecha             date not null,
  provincia         text not null,
  ciudad            text,
  hora              text,                             -- sin dato oficial todavía
  punto_encuentro   text,                             -- sin dato oficial todavía
  lat               numeric,
  lng               numeric,
  burflips          int,                              -- repeticiones de ese día
  trayecto          text,
  km_aprox          text,
  tiempo_aprox      text,
  descripcion       text,                             -- texto público de la etapa
  estado            text default 'proximamente',      -- ver ESTADOS_ETAPA en lib/reto50/constants.ts
  recaudado         numeric,                          -- null = sin dato (NO es 0 €)
  asistentes        int,                              -- null = sin dato
  resumen           text,                             -- crónica del día
  galeria           text[] default '{}',
  video_url         text,
  enlace_redes      text,
  testimonios       text,
  notas_internas    text,                             -- NUNCA se publica en la web
  orden             int default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ── Patrocinadores y colaboradores (lista abierta y escalable) ─────────────
create table if not exists reto50_patrocinadores (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  descripcion text,
  logo_url    text,
  web_url     text,
  nivel       text default 'colaborador',   -- ver NIVELES_PATROCINIO
  orden       int default 0,
  activo      boolean default true,
  destacado   boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Textos, imágenes y enlaces editables del reto (clave/valor) ────────────
create table if not exists reto50_config (
  clave      text primary key,
  valor      text,
  updated_at timestamptz default now(),
  updated_by text
);

-- ── Preguntas frecuentes ───────────────────────────────────────────────────
create table if not exists reto50_faq (
  id         uuid primary key default gen_random_uuid(),
  pregunta   text not null,
  respuesta  text not null,
  orden      int default 0,
  activo     boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists reto50_etapas_dia_idx    on reto50_etapas(dia);
create index if not exists reto50_etapas_fecha_idx  on reto50_etapas(fecha);
create index if not exists reto50_etapas_estado_idx on reto50_etapas(estado);
create index if not exists reto50_patroc_orden_idx  on reto50_patrocinadores(orden);

-- RLS: bloqueo total al público. La web pública lee desde el servidor.
alter table reto50_etapas         enable row level security;
alter table reto50_patrocinadores enable row level security;
alter table reto50_config         enable row level security;
alter table reto50_faq            enable row level security;

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED · Ruta oficial (PDF "Rutas 50 días 50 provincias", versión 3 revisada).
-- Salida 19/07/2026 en Cuenca (día 200 del reto anual) y cierre 06/09/2026 en
-- Madrid (día 249). Solo se siembra si la tabla está vacía.
-- ═══════════════════════════════════════════════════════════════════════════
-- Ojo: la fecha se convierte a mano. A través de una subconsulta de values,
-- Postgres deja '2026-07-19' como text y no lo casta solo a date.
insert into reto50_etapas (dia, fecha, provincia, ciudad, burflips, km_aprox, tiempo_aprox, trayecto, notas_internas, orden)
select dia, fecha::date, provincia, ciudad, burflips, km_aprox, tiempo_aprox, trayecto, notas_internas, orden
from (values
  (1, '2026-07-19', 'Cuenca', 'Cuenca / Planeta Movimiento', 200, '0', '0h', 'Inicio', 'Salida oficial. Origen, comunidad, equipo e instituciones.', 1),
  (2, '2026-07-20', 'Albacete', 'Albacete', 201, '170', '2h', 'Cuenca → Albacete', 'Actividad local, deporte o AECC provincial.', 2),
  (3, '2026-07-21', 'Murcia', 'Murcia / Cartagena', 202, '150', '1h45-2h', 'Albacete → Murcia', 'Comunidad local. Revisar actos de verano.', 3),
  (4, '2026-07-22', 'Alicante', 'Torrevieja / Alicante', 203, '85', '1h-1h15', 'Murcia → Alicante / Torrevieja', 'Habaneras de Torrevieja: encaja por cultura, familia y tradición.', 4),
  (5, '2026-07-23', 'Castellón', 'Castellón', 204, '260', '3h', 'Alicante → Castellón', 'Costa, acto de verano o comunidad. Evitar macrofiesta nocturna.', 5),
  (6, '2026-07-24', 'Tarragona', 'Tarragona', 205, '190', '2h15', 'Castellón → Tarragona', 'Patrimonio romano, castellers o acto local.', 6),
  (7, '2026-07-25', 'Barcelona', 'Barcelona', 206, '100', '1h15', 'Tarragona → Barcelona', 'Solo creadores si aportan causa, deporte o colaboración real.', 7),
  (8, '2026-07-26', 'Girona', 'Girona / Costa Brava', 207, '105', '1h20', 'Barcelona → Girona / Costa Brava', 'Tradición local, costa y comunidad.', 8),
  (9, '2026-07-27', 'Lleida', 'Lleida', 208, '250', '2h40-2h50', 'Girona → Lleida', 'Provincia de transición. Buscar punto visible y fácil.', 9),
  (10, '2026-07-28', 'Huesca', 'Huesca / Pirineo', 209, '150', '1h45', 'Lleida → Huesca', 'Montaña, deporte y naturaleza. Muy alineado con el reto.', 10),
  (11, '2026-07-29', 'Zaragoza', 'Zaragoza', 210, '75', '1h', 'Huesca → Zaragoza', 'Plaza del Pilar o acto urbano comunitario.', 11),
  (12, '2026-07-30', 'Soria', 'Soria', 211, '160', '2h-2h15', 'Zaragoza → Soria', 'Ajuste para llegar mejor al bloque Villalpardo.', 12),
  (13, '2026-07-31', 'Guadalajara', 'Guadalajara', 212, '350-370', '4h-4h30 total', 'Soria → Guadalajara + traslado a Villalpardo', 'Hacer Guadalajara durante el día. Después, noche en Villalpardo con Basty/Krummel. Villalpardo NO cuenta como provincia.', 13),
  (14, '2026-08-01', 'Teruel', 'Teruel / Albarracín', 213, '170-180', '2h', 'Villalpardo → Teruel', 'Salida real desde Villalpardo. Día pensado para no hacer una paliza.', 14),
  (15, '2026-08-02', 'La Rioja', 'Logroño', 214, '230', '2h45', 'Teruel → Logroño', 'Cultura local, calle y comunidad.', 15),
  (16, '2026-08-03', 'Navarra', 'Pamplona', 215, '95', '1h15', 'Logroño → Pamplona', 'Acto urbano, deporte o asociación local.', 16),
  (17, '2026-08-04', 'Gipuzkoa', 'San Sebastián', 216, '90', '1h15', 'Pamplona → Donostia', 'Semana Grande si cuadra en fechas; ciudad, cultura y comunidad.', 17),
  (18, '2026-08-05', 'Bizkaia', 'Bilbao', 217, '100', '1h15', 'Donostia → Bilbao', 'Aste Nagusia solo si encaja y suma al relato; si no, cultura local.', 18),
  (19, '2026-08-06', 'Álava', 'Vitoria-Gasteiz', 218, '70', '1h', 'Bilbao → Vitoria-Gasteiz', 'Fiestas de La Blanca: muy buen encaje por identidad y comunidad.', 19),
  (20, '2026-08-07', 'Cantabria', 'Santander / Laredo', 219, '160', '2h', 'Vitoria → Santander', 'Costa, comunidad o tradición. Batalla de Flores solo si se reajusta mucho.', 20),
  (21, '2026-08-08', 'Asturias', 'Ribadesella / Oviedo', 220, '200', '2h30', 'Santander → zona Sella / Oviedo', 'Descenso del Sella: evento ancla fuerte por deporte, esfuerzo y tradición.', 21),
  (22, '2026-08-09', 'Lugo', 'Lugo', 221, '230', '2h45', 'Asturias → Lugo', 'Patrimonio y comunidad.', 22),
  (23, '2026-08-10', 'A Coruña', 'A Coruña', 222, '100', '1h15', 'Lugo → A Coruña', 'Costa, ciudad y punto visible.', 23),
  (24, '2026-08-11', 'Pontevedra', 'Pontevedra / Vigo', 223, '140', '1h30', 'A Coruña → Pontevedra / Vigo', 'Comunidad, costa o acto local.', 24),
  (25, '2026-08-12', 'Ourense', 'Ourense', 224, '115', '1h20', 'Pontevedra → Ourense', 'Termas, cultura local y ciudad.', 25),
  (26, '2026-08-13', 'León', 'León', 225, '210', '3h', 'Ourense → León', 'Etapa media-larga. Salir con margen.', 26),
  (27, '2026-08-14', 'Zamora', 'Zamora', 226, '140', '1h45', 'León → Zamora', 'Patrimonio y comunidad.', 27),
  (28, '2026-08-15', 'Salamanca', 'Salamanca', 227, '65', '1h', 'Zamora → Salamanca', 'Día cómodo. Buena opción para contenido bonito.', 28),
  (29, '2026-08-16', 'Cáceres', 'Cáceres', 228, '210', '2h30', 'Salamanca → Cáceres', 'Patrimonio y casco histórico.', 29),
  (30, '2026-08-17', 'Badajoz', 'Badajoz', 229, '95', '1h15', 'Cáceres → Badajoz', 'Comunidad local y punto fácil de reunión.', 30),
  (31, '2026-08-18', 'Huelva', 'Huelva / entorno Doñana', 230, '215', '2h45', 'Badajoz → Huelva', 'Naturaleza y comunidad. Evitar enfoque de ocio nocturno.', 31),
  (32, '2026-08-19', 'Sevilla', 'Sevilla', 231, '95', '1h15', 'Huelva → Sevilla', 'Cultura local. Creadores solo si amplifican la causa.', 32),
  (33, '2026-08-20', 'Cádiz', 'Cádiz / Sanlúcar', 232, '125', '1h30', 'Sevilla → Cádiz / Sanlúcar', 'Tradición, costa y deporte si encaja.', 33),
  (34, '2026-08-21', 'Málaga', 'Málaga', 233, '235', '2h45', 'Cádiz → Málaga', 'Feria de Málaga si se enfoca en lo diurno/cultural, no en exceso.', 34),
  (35, '2026-08-22', 'Granada', 'Granada', 234, '130', '1h40', 'Málaga → Granada', 'Patrimonio, Sierra y mensaje profundo.', 35),
  (36, '2026-08-23', 'Almería', 'Almería / Tabernas', 235, '170', '2h', 'Granada → Almería / Tabernas', 'Desierto, cine y ruta de resistencia.', 36),
  (37, '2026-08-24', 'Jaén', 'Jaén', 236, '205', '2h30', 'Almería → Jaén', 'Olivos, castillo y comunidad rural.', 37),
  (38, '2026-08-25', 'Córdoba', 'Córdoba', 237, '115', '1h30', 'Jaén → Córdoba', 'Patrimonio. Mejor tarde/noche por calor.', 38),
  (39, '2026-08-26', 'Ciudad Real', 'Ciudad Real', 238, '205', '2h30', 'Córdoba → Ciudad Real', 'Interior, raíces y cierre de bloque andaluz.', 39),
  (40, '2026-08-27', 'Valencia', 'Valencia / Buñol', 239, '350', '3h45-4h', 'Ciudad Real → Valencia / Buñol', 'Etapa larga pero asumible. Tomatina queda a revisar: no basar todo el día en eso si no cuadra.', 40),
  (41, '2026-08-28', 'Toledo', 'Toledo', 240, '350', '3h45-4h', 'Valencia → Toledo', 'Etapa larga. Patrimonio y punto muy potente si se organiza bien.', 41),
  (42, '2026-08-29', 'Ávila', 'Ávila', 241, '155', '2h', 'Toledo → Ávila', 'Muralla, patrimonio y comunidad.', 42),
  (43, '2026-08-30', 'Segovia', 'Segovia', 242, '70', '1h', 'Ávila → Segovia', 'Acueducto / punto visual.', 43),
  (44, '2026-08-31', 'Valladolid', 'Valladolid', 243, '120', '1h30', 'Segovia → Valladolid', 'Ciudad, medios locales y comunidad.', 44),
  (45, '2026-09-01', 'Palencia', 'Palencia', 244, '50', '45m', 'Valladolid → Palencia', 'Día cómodo antes de Burgos.', 45),
  (46, '2026-09-02', 'Burgos', 'Burgos', 245, '95', '1h', 'Palencia → Burgos', 'Catedral / patrimonio. Preparar logística de vuelos.', 46),
  (47, '2026-09-03', 'Illes Balears', 'Palma', 246, '245 km + vuelo', '2h45 coche + 1h30 vuelo', 'Burgos → Madrid aeropuerto + vuelo a Palma', 'Reservar antes. Considerar dormir cerca de Madrid la noche previa si conviene.', 47),
  (48, '2026-09-04', 'Las Palmas', 'Gran Canaria', 247, 'Vuelo', '3h-5h con escala', 'Palma → Gran Canaria', 'Confirmar vuelo con margen. Evitar improvisar salto de islas.', 48),
  (49, '2026-09-05', 'Santa Cruz de Tenerife', 'Tenerife', 248, 'Vuelo/ferry', '40m-1h30', 'Gran Canaria → Tenerife', 'Cierre natural de islas. Teide si es viable y seguro.', 49),
  (50, '2026-09-06', 'Madrid', 'Madrid', 249, 'Vuelo', '2h45-3h', 'Tenerife → Madrid', 'Cierre final nacional: comunidad, instituciones, AECC y equipo.', 50)
) as base(dia, fecha, provincia, ciudad, burflips, km_aprox, tiempo_aprox, trayecto, notas_internas, orden)
where not exists (select 1 from reto50_etapas);

-- ── Patrocinadores iniciales ───────────────────────────────────────────────
insert into reto50_patrocinadores (nombre, descripcion, nivel, orden, destacado)
select * from (values
  ('Planeta Movimiento', 'Escuela conquense de deporte, ocio saludable y educación física. Organiza y coordina el reto: logística de la ruta, patrocinadores y comunicación diaria.', 'organizador', 1, true),
  ('KGM', 'Aporta el vehículo todoterreno oficial que hace posible el recorrido por las 50 provincias.', 'principal', 2, true)
) as base(nombre, descripcion, nivel, orden, destacado)
where not exists (select 1 from reto50_patrocinadores);

-- ── Preguntas frecuentes iniciales ─────────────────────────────────────────
insert into reto50_faq (pregunta, respuesta, orden)
select * from (values
  ('¿Qué es un burflip?', 'Es el ejercicio que Brosjaca repite cada día de su reto anual: una repetición más cada jornada. Cuando arranca "50 días, 50 provincias" ya va por 200 repeticiones diarias, y al llegar a Madrid serán 249.', 1),
  ('¿Hay que pagar para participar?', 'No. Las quedadas en cada provincia son gratuitas y abiertas a todo el mundo. La recaudación se destina a la lucha contra el cáncer a través de la Asociación Española Contra el Cáncer.', 2),
  ('¿Puedo ir aunque no entrene?', 'Sí. La idea es reunir al mayor número posible de personas en cada provincia: se puede acompañar, animar o hacer las repeticiones que cada uno quiera.', 3),
  ('¿Cómo sé la hora y el punto exacto de mi provincia?', 'Cada etapa se confirma con antelación. Consulta el calendario de esta página y las redes oficiales de Brosjaca los días previos a la parada.', 4),
  ('¿Cómo puede colaborar mi ayuntamiento o mi empresa?', 'Escríbenos y lo hablamos. Buscamos un espacio público céntrico para el vehículo del reto, difusión institucional y apoyo logístico puntual.', 5)
) as base(pregunta, respuesta, orden)
where not exists (select 1 from reto50_faq);
