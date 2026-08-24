import Link from "next/link";
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  formatISO,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { AgendaTurnoChip } from "@/components/admin/agenda-turno-chip";
import { AgendaMiniMes } from "@/components/admin/agenda-mini-mes";
import { listTurnos } from "@/lib/data/turnos";
import { listSedes } from "@/lib/data/sedes";
import { parseFecha } from "@/lib/date";
import type { TurnoConDetalle } from "@/types/domain";

type Vista = "mes" | "semana";

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string; fecha?: string; sede?: string }>;
}) {
  const params = await searchParams;
  const vista: Vista = params.vista === "semana" ? "semana" : "mes";
  const fechaRef = params.fecha ? parseFecha(params.fecha) : new Date();
  const sedeId = params.sede || undefined;

  const sedes = await listSedes();

  const desde =
    vista === "mes"
      ? startOfWeek(startOfMonth(fechaRef), { weekStartsOn: 1 })
      : startOfWeek(fechaRef, { weekStartsOn: 1 });
  const hasta =
    vista === "mes"
      ? endOfWeek(endOfMonth(fechaRef), { weekStartsOn: 1 })
      : endOfWeek(fechaRef, { weekStartsOn: 1 });

  const mesAnteriorRef = addMonths(fechaRef, -1);
  const mesSiguienteRef = addMonths(fechaRef, 1);
  const diasMesAnterior = eachDayOfInterval({
    start: startOfWeek(startOfMonth(mesAnteriorRef), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(mesAnteriorRef), { weekStartsOn: 1 }),
  });
  const diasMesSiguiente = eachDayOfInterval({
    start: startOfWeek(startOfMonth(mesSiguienteRef), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(mesSiguienteRef), { weekStartsOn: 1 }),
  });

  // El rango de la consulta cubre el mes anterior y el siguiente además del actual, para que
  // los mini-calendarios siempre puedan mostrar qué días tienen turnos sin pedir de nuevo.
  const desdeConsulta = diasMesAnterior[0];
  const hastaConsulta = diasMesSiguiente[diasMesSiguiente.length - 1];

  const turnos = await listTurnos({
    sedeId,
    desde: formatISO(desdeConsulta, { representation: "date" }),
    hasta: formatISO(hastaConsulta, { representation: "date" }),
  });

  const turnosPorFecha = new Map<string, TurnoConDetalle[]>();
  for (const t of turnos) {
    const lista = turnosPorFecha.get(t.fecha);
    if (lista) lista.push(t);
    else turnosPorFecha.set(t.fecha, [t]);
  }
  for (const lista of turnosPorFecha.values()) {
    lista.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  }
  const fechasConTurnos = new Set(turnosPorFecha.keys());

  const dias = eachDayOfInterval({ start: desde, end: hasta });

  function href(overrides: { vista?: Vista; fecha?: Date }) {
    const p = new URLSearchParams();
    p.set("vista", overrides.vista ?? vista);
    p.set("fecha", formatISO(overrides.fecha ?? fechaRef, { representation: "date" }));
    if (sedeId) p.set("sede", sedeId);
    return `/admin/agenda?${p.toString()}`;
  }

  const fechaAnterior = vista === "mes" ? addMonths(fechaRef, -1) : addWeeks(fechaRef, -1);
  const fechaSiguiente = vista === "mes" ? addMonths(fechaRef, 1) : addWeeks(fechaRef, 1);

  const titulo =
    vista === "mes"
      ? format(fechaRef, "MMMM yyyy", { locale: es })
      : `Semana del ${format(startOfWeek(fechaRef, { weekStartsOn: 1 }), "d MMM", { locale: es })} al ${format(endOfWeek(fechaRef, { weekStartsOn: 1 }), "d MMM", { locale: es })}`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-semibold capitalize text-ink">{titulo}</h1>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex overflow-hidden rounded-md border border-border">
            <Link
              href={href({ vista: "mes" })}
              className={`px-3 py-1.5 ${vista === "mes" ? "bg-primary text-white" : "bg-background text-ink hover:bg-surface"}`}
            >
              Mes
            </Link>
            <Link
              href={href({ vista: "semana" })}
              className={`px-3 py-1.5 ${vista === "semana" ? "bg-primary text-white" : "bg-background text-ink hover:bg-surface"}`}
            >
              Semana
            </Link>
          </div>

          <form className="flex items-center gap-2">
            <input type="hidden" name="vista" value={vista} />
            <input type="hidden" name="fecha" value={formatISO(fechaRef, { representation: "date" })} />
            <select
              name="sede"
              defaultValue={sedeId ?? ""}
              className="rounded-md border border-border px-3 py-1.5"
            >
              <option value="">Todas las sedes</option>
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-md border border-border px-3 py-1.5 hover:bg-surface">
              Filtrar
            </button>
          </form>

          <div className="flex items-center gap-1">
            <Link href={href({ fecha: fechaAnterior })} className="rounded-md border border-border px-3 py-1.5 hover:bg-surface">
              ← Anterior
            </Link>
            <Link href={href({ fecha: new Date() })} className="rounded-md border border-border px-3 py-1.5 hover:bg-surface">
              Hoy
            </Link>
            <Link href={href({ fecha: fechaSiguiente })} className="rounded-md border border-border px-3 py-1.5 hover:bg-surface">
              Siguiente →
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <AgendaMiniMes
          dias={diasMesAnterior}
          mesReferencia={mesAnteriorRef}
          titulo={format(mesAnteriorRef, "MMMM yyyy", { locale: es })}
          fechasConTurnos={fechasConTurnos}
          hrefMes={href({ vista: "mes", fecha: mesAnteriorRef })}
          hrefDia={(dia) => href({ vista: "semana", fecha: dia })}
        />
        <AgendaMiniMes
          dias={diasMesSiguiente}
          mesReferencia={mesSiguienteRef}
          titulo={format(mesSiguienteRef, "MMMM yyyy", { locale: es })}
          fechasConTurnos={fechasConTurnos}
          hrefMes={href({ vista: "mes", fecha: mesSiguienteRef })}
          hrefDia={(dia) => href({ vista: "semana", fecha: dia })}
        />
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border text-sm">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="bg-surface px-2 py-1.5 text-center text-xs font-semibold uppercase text-muted">
            {d}
          </div>
        ))}

        {dias.map((dia) => {
          const fechaStr = formatISO(dia, { representation: "date" });
          const turnosDelDia = turnosPorFecha.get(fechaStr) ?? [];
          const fueraDeMes = vista === "mes" && !isSameMonth(dia, fechaRef);
          const maxVisible = vista === "mes" ? 3 : 20;

          return (
            <div
              key={fechaStr}
              className={`flex flex-col gap-1 bg-background p-1.5 ${vista === "mes" ? "min-h-28" : "min-h-64"} ${fueraDeMes ? "opacity-40" : ""}`}
            >
              <span
                className={`self-start rounded-full px-1.5 text-xs font-medium ${
                  isToday(dia) ? "bg-primary text-white" : "text-muted"
                }`}
              >
                {dia.getDate()}
              </span>
              <div className="flex flex-col gap-0.5">
                {turnosDelDia.slice(0, maxVisible).map((t) => (
                  <AgendaTurnoChip key={t.id} turno={t} />
                ))}
                {turnosDelDia.length > maxVisible && (
                  <span className="px-1.5 text-xs text-muted">
                    +{turnosDelDia.length - maxVisible} más
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
