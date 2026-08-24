export type EstadoTurno =
  | "pendiente"
  | "confirmado"
  | "realizado"
  | "cancelado"
  | "reprogramado"
  | "no_asistio";

export const ESTADOS_TURNO: { value: EstadoTurno; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "realizado", label: "Realizado" },
  { value: "cancelado", label: "Cancelado" },
  { value: "reprogramado", label: "Reprogramado" },
  { value: "no_asistio", label: "No asistió" },
];

export interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  activo: boolean;
}

export interface HorarioSede {
  id: string;
  sede_id: string;
  dia_semana: number; // 0 domingo ... 6 sabado
  hora_inicio: string; // "HH:MM:SS"
  hora_fin: string;
  pausa_inicio: string | null;
  pausa_fin: string | null;
}

export interface Servicio {
  id: string;
  nombre: string;
  duracion_minutos: number;
  precio: number | null;
  disponible_online: boolean;
  activo: boolean;
}

export interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string | null;
  fecha_nacimiento: string | null;
  obra_social: string | null;
  deporte: string | null;
  nivel: string | null;
  analisis_sangre: string | null;
  objetivos: string | null;
  observaciones: string | null;
}

export interface Turno {
  id: string;
  paciente_id: string | null; // null = turno publicado como disponible, todavía sin tomar
  servicio_id: string | null; // null junto con paciente_id = disponible, el servicio lo elige quien lo tome
  sede_id: string;
  fecha: string; // "YYYY-MM-DD"
  hora_inicio: string;
  hora_fin: string;
  estado: EstadoTurno;
  observaciones: string | null;
  created_at: string;
}

export interface TurnoConDetalle extends Turno {
  paciente: Pick<Paciente, "id" | "nombre" | "apellido" | "telefono" | "email"> | null;
  servicio: Pick<Servicio, "id" | "nombre" | "duracion_minutos"> | null;
  sede: Pick<Sede, "id" | "nombre">;
}

export type TipoExcepcion = "cerrado" | "horario_especial";

export interface ExcepcionAgenda {
  id: string;
  sede_id: string | null;
  fecha: string;
  tipo: TipoExcepcion;
  hora_inicio: string | null;
  hora_fin: string | null;
  motivo: string | null;
}

export interface Slot {
  fecha: string; // "YYYY-MM-DD"
  hora_inicio: string; // "HH:MM"
  hora_fin: string; // "HH:MM"
  /** Si viene de un turno publicado manualmente como disponible, su id (para tomarlo en vez de crear uno nuevo). */
  turnoId?: string;
}
