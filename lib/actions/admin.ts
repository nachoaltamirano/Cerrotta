"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  crearTurno,
  getTurno,
  reclamarTurno,
  actualizarEstadoTurno,
  actualizarObservacionesTurno,
  reprogramarTurno,
} from "@/lib/data/turnos";
import { upsertPacientePorDni } from "@/lib/data/pacientes";
import { crearExcepcion, eliminarExcepcion, type NuevaExcepcion } from "@/lib/data/excepciones";
import { getServicio } from "@/lib/data/servicios";
import { diferenciaMinutos, sumarMinutos } from "@/lib/time";
import type { EstadoTurno } from "@/types/domain";

const turnoManualSchema = z.object({
  modo: z.enum(["existente", "nuevo", "disponible"]),
  servicioId: z.string().uuid().optional(),
  sedeId: z.string().uuid(),
  fecha: z.string().min(1),
  horaInicio: z.string().min(1),
  horaFin: z.string().optional(),
  pacienteId: z.string().uuid().optional(),
  nombre: z.string().optional(),
  apellido: z.string().optional(),
  dni: z.string().optional(),
  telefono: z.string().optional(),
  observaciones: z.string().optional(),
});

interface DatosPaciente {
  pacienteId?: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
}

/** Usa el paciente existente si vino un id, o carga uno nuevo con los datos escritos a mano. */
async function resolverPacienteId(datos: DatosPaciente): Promise<string> {
  if (datos.pacienteId) return datos.pacienteId;
  if (!datos.nombre || !datos.apellido || !datos.dni || !datos.telefono) {
    throw new Error("Faltan datos del paciente");
  }
  return upsertPacientePorDni({
    nombre: datos.nombre,
    apellido: datos.apellido,
    dni: datos.dni,
    telefono: datos.telefono,
    email: null,
    fecha_nacimiento: null,
    obra_social: null,
    deporte: null,
    nivel: null,
    analisis_sangre: null,
    objetivos: null,
    observaciones: null,
  });
}

export async function crearTurnoManualAction(input: z.infer<typeof turnoManualSchema>) {
  const datos = turnoManualSchema.parse(input);

  // Un turno "disponible" no fija servicio: lo elige quien lo reserva, no quien lo publica.
  // Acá solo definimos la ventana horaria (hora fin la carga el profesional a mano).
  if (datos.modo === "disponible") {
    if (!datos.horaFin) throw new Error("Falta la hora de fin del turno disponible");
    const turnoId = await crearTurno({
      paciente_id: null,
      servicio_id: null,
      sede_id: datos.sedeId,
      fecha: datos.fecha,
      hora_inicio: datos.horaInicio,
      hora_fin: datos.horaFin,
      observaciones: datos.observaciones || null,
    });
    revalidatePath("/admin");
    return turnoId;
  }

  if (!datos.servicioId) throw new Error("Elegí un servicio");
  const servicio = await getServicio(datos.servicioId);
  if (!servicio) throw new Error("Servicio no encontrado");

  const pacienteId = await resolverPacienteId(datos);
  const horaFin = sumarMinutos(datos.horaInicio, servicio.duracion_minutos);

  const turnoId = await crearTurno({
    paciente_id: pacienteId,
    servicio_id: datos.servicioId,
    sede_id: datos.sedeId,
    fecha: datos.fecha,
    hora_inicio: datos.horaInicio,
    hora_fin: horaFin,
    observaciones: datos.observaciones || null,
  });

  revalidatePath("/admin");
  return turnoId;
}

/** Asigna paciente y servicio a un turno publicado como disponible (lo toma "por teléfono", por ejemplo). */
export async function asignarPacienteTurnoAction(
  turnoId: string,
  servicioId: string,
  datosPaciente: DatosPaciente,
) {
  const pacienteId = await resolverPacienteId(datosPaciente);
  const tomado = await reclamarTurno(turnoId, pacienteId, servicioId);
  if (!tomado) throw new Error("Ese turno ya fue tomado por otra persona");
  revalidatePath("/admin");
  revalidatePath(`/admin/turnos/${turnoId}`);
}

export async function actualizarEstadoTurnoAction(id: string, estado: EstadoTurno) {
  await actualizarEstadoTurno(id, estado);
  revalidatePath("/admin");
  revalidatePath(`/admin/turnos/${id}`);
}

export async function actualizarObservacionesTurnoAction(id: string, observaciones: string) {
  await actualizarObservacionesTurno(id, observaciones);
  revalidatePath(`/admin/turnos/${id}`);
}

export async function reprogramarTurnoAction(id: string, fecha: string, horaInicio: string) {
  const turno = await getTurno(id);
  if (!turno) throw new Error("Turno no encontrado");
  const duracion = diferenciaMinutos(turno.hora_inicio, turno.hora_fin);
  const horaFin = sumarMinutos(horaInicio, duracion);
  await reprogramarTurno(id, fecha, horaInicio, horaFin);
  revalidatePath("/admin");
  revalidatePath(`/admin/turnos/${id}`);
}

export async function crearExcepcionAction(input: NuevaExcepcion) {
  await crearExcepcion(input);
  revalidatePath("/admin/configuracion");
}

export async function eliminarExcepcionAction(id: string) {
  await eliminarExcepcion(id);
  revalidatePath("/admin/configuracion");
}
