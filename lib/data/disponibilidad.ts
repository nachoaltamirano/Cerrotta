import { formatISO } from "date-fns";
import { calcularSlotsDisponibles } from "@/lib/availability";
import { listHorariosPorSede } from "@/lib/data/sedes";
import { listExcepciones } from "@/lib/data/excepciones";
import { listTurnosOcupados, listTurnosAbiertos } from "@/lib/data/turnos";
import { getServicio } from "@/lib/data/servicios";
import type { Slot } from "@/types/domain";

export async function getSlotsDisponibles(
  sedeId: string,
  servicioId: string,
  desde: Date,
  hasta: Date,
): Promise<Slot[]> {
  // Formatea en hora local (no toISOString, que corre a UTC y puede correr la fecha
  // en zonas horarias negativas como America/Buenos_Aires).
  const desdeStr = formatISO(desde, { representation: "date" });
  const hastaStr = formatISO(hasta, { representation: "date" });

  const [servicio, horarios, excepciones, turnosOcupados, turnosAbiertos] = await Promise.all([
    getServicio(servicioId),
    listHorariosPorSede(sedeId),
    listExcepciones(sedeId),
    listTurnosOcupados(sedeId, desdeStr, hastaStr),
    listTurnosAbiertos(sedeId, desdeStr, hastaStr),
  ]);

  if (!servicio) throw new Error("Servicio no encontrado");

  return calcularSlotsDisponibles({
    desde,
    hasta,
    duracionMinutos: servicio.duracion_minutos,
    horarios,
    excepciones,
    turnosOcupados,
    turnosAbiertos,
  });
}
