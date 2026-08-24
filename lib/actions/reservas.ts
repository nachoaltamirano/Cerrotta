"use server";

import { z } from "zod";
import { getSlotsDisponibles } from "@/lib/data/disponibilidad";
import { upsertPacientePorDni } from "@/lib/data/pacientes";
import { crearTurno, reclamarTurno } from "@/lib/data/turnos";
import { getServicio } from "@/lib/data/servicios";
import { parseFecha } from "@/lib/date";
import type { Slot } from "@/types/domain";

export async function obtenerSlotsAction(
  sedeId: string,
  servicioId: string,
  mesISO: string, // "YYYY-MM-01"
): Promise<Slot[]> {
  const desde = parseFecha(mesISO);
  const hasta = new Date(desde.getFullYear(), desde.getMonth() + 1, 0);
  return getSlotsDisponibles(sedeId, servicioId, desde, hasta);
}

const datosReservaSchema = z.object({
  servicioId: z.string().uuid(),
  sedeId: z.string().uuid(),
  fecha: z.string(),
  horaInicio: z.string(),
  horaFin: z.string(),
  nombre: z.string().min(1, "Ingresá tu nombre"),
  apellido: z.string().min(1, "Ingresá tu apellido"),
  dni: z.string().min(6, "DNI inválido"),
  telefono: z.string().min(6, "Teléfono inválido"),
  email: z.string().email().optional().or(z.literal("")),
  fechaNacimiento: z.string().optional().or(z.literal("")),
  obraSocial: z.string().optional().or(z.literal("")),
  deporte: z.string().optional().or(z.literal("")),
  nivel: z.string().optional().or(z.literal("")),
  objetivos: z.string().optional().or(z.literal("")),
  observaciones: z.string().optional().or(z.literal("")),
});

export type DatosReserva = z.infer<typeof datosReservaSchema>;

export interface ResultadoReserva {
  ok: boolean;
  error?: string;
  turnoId?: string;
}

export async function crearReservaAction(input: DatosReserva): Promise<ResultadoReserva> {
  const parsed = datosReservaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const datos = parsed.data;

  const servicio = await getServicio(datos.servicioId);
  if (!servicio) return { ok: false, error: "El servicio seleccionado ya no existe" };

  // Vuelve a validar que el horario elegido siga disponible antes de reservarlo. Si viene de un
  // turno publicado manualmente como "disponible", el slot trae su turnoId para tomarlo.
  const desde = parseFecha(datos.fecha);
  const slotsDelDia = await getSlotsDisponibles(datos.sedeId, datos.servicioId, desde, desde);
  const slotElegido = slotsDelDia.find(
    (s) => s.fecha === datos.fecha && s.hora_inicio === datos.horaInicio,
  );
  if (!slotElegido) {
    return { ok: false, error: "Ese horario ya no está disponible, elegí otro." };
  }

  const pacienteId = await upsertPacientePorDni({
    nombre: datos.nombre,
    apellido: datos.apellido,
    dni: datos.dni,
    telefono: datos.telefono,
    email: datos.email || null,
    fecha_nacimiento: datos.fechaNacimiento || null,
    obra_social: datos.obraSocial || null,
    deporte: datos.deporte || null,
    nivel: datos.nivel || null,
    analisis_sangre: null,
    objetivos: datos.objetivos || null,
    observaciones: datos.observaciones || null,
  });

  if (slotElegido.turnoId) {
    const tomado = await reclamarTurno(
      slotElegido.turnoId,
      pacienteId,
      datos.servicioId,
      datos.observaciones || null,
    );
    if (!tomado) {
      return { ok: false, error: "Justo alguien más tomó ese turno, elegí otro horario." };
    }
    return { ok: true, turnoId: slotElegido.turnoId };
  }

  const turnoId = await crearTurno({
    paciente_id: pacienteId,
    servicio_id: datos.servicioId,
    sede_id: datos.sedeId,
    fecha: datos.fecha,
    hora_inicio: datos.horaInicio,
    hora_fin: datos.horaFin,
    estado: "confirmado",
    observaciones: datos.observaciones || null,
  });

  return { ok: true, turnoId };
}
