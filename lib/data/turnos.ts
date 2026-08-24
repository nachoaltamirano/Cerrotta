import { createClient } from "@/lib/supabase/server";
import type { EstadoTurno, Turno, TurnoConDetalle } from "@/types/domain";

export interface FiltrosTurnos {
  sedeId?: string;
  estado?: EstadoTurno;
  desde?: string; // "YYYY-MM-DD"
  hasta?: string;
}

export async function listTurnos(filtros: FiltrosTurnos = {}): Promise<TurnoConDetalle[]> {
  const supabase = await createClient();
  let query = supabase
    .from("turnos")
    .select(
      `id, paciente_id, servicio_id, sede_id, fecha, hora_inicio, hora_fin, estado, observaciones, created_at,
       paciente:pacientes ( id, nombre, apellido, telefono, email ),
       servicio:servicios ( id, nombre, duracion_minutos ),
       sede:sedes ( id, nombre )`,
    )
    .order("fecha")
    .order("hora_inicio");

  if (filtros.sedeId) query = query.eq("sede_id", filtros.sedeId);
  if (filtros.estado) query = query.eq("estado", filtros.estado);
  if (filtros.desde) query = query.gte("fecha", filtros.desde);
  if (filtros.hasta) query = query.lte("fecha", filtros.hasta);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as unknown as TurnoConDetalle[];
}

export async function getTurno(id: string): Promise<TurnoConDetalle | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("turnos")
    .select(
      `id, paciente_id, servicio_id, sede_id, fecha, hora_inicio, hora_fin, estado, observaciones, created_at,
       paciente:pacientes ( id, nombre, apellido, telefono, email ),
       servicio:servicios ( id, nombre, duracion_minutos ),
       sede:sedes ( id, nombre )`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as TurnoConDetalle | null;
}

/** Turnos activos (no cancelados) de una sede en un rango de fechas, usados para calcular disponibilidad. */
export async function listTurnosOcupados(
  sedeId: string,
  desde: string,
  hasta: string,
): Promise<Pick<Turno, "fecha" | "hora_inicio" | "hora_fin">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("turnos")
    .select("fecha, hora_inicio, hora_fin")
    .eq("sede_id", sedeId)
    .gte("fecha", desde)
    .lte("fecha", hasta)
    .not("estado", "in", "(cancelado,no_asistio)");

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Turnos publicados desde el panel como "disponibles" (sin paciente ni servicio asignado
 * todavía) en una sede. El servicio lo elige quien reserva, no quien publica el turno, así
 * que acá no se filtra por servicio: eso se resuelve comparando duraciones en availability.ts.
 */
export async function listTurnosAbiertos(
  sedeId: string,
  desde: string,
  hasta: string,
): Promise<Pick<Turno, "id" | "fecha" | "hora_inicio" | "hora_fin">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("turnos")
    .select("id, fecha, hora_inicio, hora_fin")
    .eq("sede_id", sedeId)
    .is("paciente_id", null)
    .gte("fecha", desde)
    .lte("fecha", hasta)
    .not("estado", "in", "(cancelado,no_asistio)");

  if (error) throw new Error(error.message);
  return data;
}

export interface NuevoTurno {
  paciente_id?: string | null;
  servicio_id?: string | null;
  sede_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado?: EstadoTurno;
  observaciones?: string | null;
}

export async function crearTurno(input: NuevoTurno): Promise<string> {
  const supabase = await createClient();
  const pacienteId = input.paciente_id ?? null;
  const { data, error } = await supabase
    .from("turnos")
    .insert({
      ...input,
      paciente_id: pacienteId,
      servicio_id: input.servicio_id ?? null,
      estado: input.estado ?? (pacienteId ? "confirmado" : "pendiente"),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

/**
 * Asigna paciente y servicio a un turno publicado como disponible y lo confirma.
 * Usa una actualización condicional (paciente_id todavía null) para evitar que dos
 * personas tomen el mismo turno abierto al mismo tiempo.
 */
export async function reclamarTurno(
  turnoId: string,
  pacienteId: string,
  servicioId: string,
  observaciones?: string | null,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("turnos")
    .update({
      paciente_id: pacienteId,
      servicio_id: servicioId,
      estado: "confirmado",
      observaciones: observaciones ?? null,
    })
    .eq("id", turnoId)
    .is("paciente_id", null)
    .select("id");

  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function actualizarEstadoTurno(id: string, estado: EstadoTurno) {
  const supabase = await createClient();
  const { error } = await supabase.from("turnos").update({ estado }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function actualizarObservacionesTurno(id: string, observaciones: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("turnos").update({ observaciones }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reprogramarTurno(
  id: string,
  fecha: string,
  hora_inicio: string,
  hora_fin: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("turnos")
    .update({ fecha, hora_inicio, hora_fin, estado: "reprogramado" })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
