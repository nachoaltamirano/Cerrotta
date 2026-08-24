import { addDays, formatISO } from "date-fns";
import type { ExcepcionAgenda, HorarioSede, Slot, Turno } from "@/types/domain";

const ANTICIPACION_MINIMA_DIAS = 7;

function aMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function aHora(minutos: number): string {
  const h = Math.floor(minutos / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutos % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function seSuperponen(aInicio: number, aFin: number, bInicio: number, bFin: number): boolean {
  return aInicio < bFin && bInicio < aFin;
}

interface Ventana {
  inicio: number;
  fin: number;
  pausaInicio?: number;
  pausaFin?: number;
}

/** Ventanas de atención de una sede para una fecha puntual, ya aplicadas las excepciones del día. */
function ventanasDelDia(
  fecha: Date,
  horarios: HorarioSede[],
  excepciones: ExcepcionAgenda[],
): Ventana[] {
  const fechaStr = formatISO(fecha, { representation: "date" });
  const diaSemana = fecha.getDay();

  const excepcionesDelDia = excepciones.filter((e) => e.fecha === fechaStr);
  if (excepcionesDelDia.some((e) => e.tipo === "cerrado")) return [];

  const especial = excepcionesDelDia.find((e) => e.tipo === "horario_especial");
  if (especial) {
    return [{ inicio: aMinutos(especial.hora_inicio!), fin: aMinutos(especial.hora_fin!) }];
  }

  return horarios
    .filter((h) => h.dia_semana === diaSemana)
    .map((h) => ({
      inicio: aMinutos(h.hora_inicio),
      fin: aMinutos(h.hora_fin),
      pausaInicio: h.pausa_inicio ? aMinutos(h.pausa_inicio) : undefined,
      pausaFin: h.pausa_fin ? aMinutos(h.pausa_fin) : undefined,
    }));
}

export interface CalcularSlotsInput {
  desde: Date;
  hasta: Date;
  duracionMinutos: number;
  horarios: HorarioSede[];
  excepciones: ExcepcionAgenda[];
  turnosOcupados: Pick<Turno, "fecha" | "hora_inicio" | "hora_fin">[];
  /**
   * Turnos publicados manualmente desde el panel como "disponibles" (sin paciente asignado).
   * Se ofrecen igual aunque caigan fuera del horario semanal o de la anticipación mínima,
   * ya que fueron habilitados a propósito por el profesional.
   */
  turnosAbiertos?: Pick<Turno, "id" | "fecha" | "hora_inicio" | "hora_fin">[];
  ahora?: Date;
}

export function calcularSlotsDisponibles(input: CalcularSlotsInput): Slot[] {
  const ahora = input.ahora ?? new Date();
  const primeraFechaHabilitada = addDays(ahora, ANTICIPACION_MINIMA_DIAS);
  const slots: Slot[] = [];

  for (let fecha = new Date(input.desde); fecha <= input.hasta; fecha = addDays(fecha, 1)) {
    if (fecha < primeraFechaHabilitada) continue;

    const fechaStr = formatISO(fecha, { representation: "date" });
    const ventanas = ventanasDelDia(fecha, input.horarios, input.excepciones);
    if (ventanas.length === 0) continue;

    const ocupadosDelDia = input.turnosOcupados
      .filter((t) => t.fecha === fechaStr)
      .map((t) => ({ inicio: aMinutos(t.hora_inicio), fin: aMinutos(t.hora_fin) }));

    for (const ventana of ventanas) {
      for (
        let inicio = ventana.inicio;
        inicio + input.duracionMinutos <= ventana.fin;
        inicio += input.duracionMinutos
      ) {
        const fin = inicio + input.duracionMinutos;

        if (
          ventana.pausaInicio !== undefined &&
          ventana.pausaFin !== undefined &&
          seSuperponen(inicio, fin, ventana.pausaInicio, ventana.pausaFin)
        ) {
          continue;
        }

        if (ocupadosDelDia.some((o) => seSuperponen(inicio, fin, o.inicio, o.fin))) {
          continue;
        }

        slots.push({ fecha: fechaStr, hora_inicio: aHora(inicio), hora_fin: aHora(fin) });
      }
    }
  }

  for (const abierto of input.turnosAbiertos ?? []) {
    if (abierto.fecha < formatISO(input.desde, { representation: "date" })) continue;
    if (abierto.fecha > formatISO(input.hasta, { representation: "date" })) continue;

    // El turno se publicó sin servicio: solo se ofrece si la duración del servicio elegido
    // por quien reserva entra en la ventana publicada.
    const duracionBloque = aMinutos(abierto.hora_fin) - aMinutos(abierto.hora_inicio);
    if (duracionBloque < input.duracionMinutos) continue;

    const yaListado = slots.find(
      (s) => s.fecha === abierto.fecha && s.hora_inicio === abierto.hora_inicio,
    );
    if (yaListado) {
      yaListado.turnoId = abierto.id;
    } else {
      slots.push({
        fecha: abierto.fecha,
        hora_inicio: abierto.hora_inicio,
        hora_fin: abierto.hora_fin,
        turnoId: abierto.id,
      });
    }
  }

  return slots.sort((a, b) => (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio));
}
