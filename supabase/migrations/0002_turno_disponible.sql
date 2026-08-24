-- Permite publicar un turno "disponible" desde el panel sin asignarle un paciente todavia:
-- paciente_id null = turno abierto para que cualquier paciente lo tome desde /reservar.
-- Al reservarlo, el flujo publico completa paciente_id y pasa el estado a 'confirmado'.

alter table turnos alter column paciente_id drop not null;

create index turnos_disponibles_idx on turnos (servicio_id, sede_id, fecha)
  where paciente_id is null;
