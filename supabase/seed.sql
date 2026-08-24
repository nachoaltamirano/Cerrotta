-- Datos reales de Lic. Cerrotta relevados del PDF de respuestas.
-- Correr despues de 0001_init.sql.

insert into sedes (nombre, direccion) values
  ('Unbex', 'Pacheco 1956'),
  ('Pfk Palermo', '3401, 6° D');

-- Horarios semanales: Unbex lunes y miercoles 9-12 y 14-17 (pausa 12-14). Pfk Palermo viernes 9-15.
insert into horarios_sede (sede_id, dia_semana, hora_inicio, hora_fin, pausa_inicio, pausa_fin)
select id, dia, '09:00', '17:00', '12:00', '14:00'
from sedes, unnest(array[1, 3]) as dia
where nombre = 'Unbex';

insert into horarios_sede (sede_id, dia_semana, hora_inicio, hora_fin)
select id, 5, '09:00', '15:00'
from sedes
where nombre = 'Pfk Palermo';

-- Servicios
insert into servicios (nombre, duracion_minutos, precio, disponible_online) values
  ('Consulta nutricional completa (plan + antropometría)', 60, 60000, true),
  ('Antropometría', 40, 40000, true),
  ('Consulta nutricional', 40, 40000, true);

-- Los 3 servicios se ofrecen en ambas sedes.
insert into servicio_sedes (servicio_id, sede_id)
select s.id, sd.id
from servicios s
cross join sedes sd;
