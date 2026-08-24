-- Un turno "disponible" tampoco fija el servicio: lo elige el paciente que lo toma, no
-- quien lo publica desde el panel. servicio_id queda null junto con paciente_id hasta que
-- alguien reserva ese horario (el flujo publico completa ambos al tomarlo).

alter table turnos alter column servicio_id drop not null;

drop index if exists turnos_disponibles_idx;

create index turnos_disponibles_idx on turnos (sede_id, fecha)
  where paciente_id is null;
