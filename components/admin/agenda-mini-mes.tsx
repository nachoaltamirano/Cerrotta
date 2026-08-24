import Link from "next/link";
import { formatISO, isSameMonth, isToday } from "date-fns";

const DIAS_SEMANA_CORTO = ["L", "M", "M", "J", "V", "S", "D"];

interface Props {
  dias: Date[];
  mesReferencia: Date;
  titulo: string;
  fechasConTurnos: Set<string>;
  hrefMes: string;
  hrefDia: (fecha: Date) => string;
}

export function AgendaMiniMes({ dias, mesReferencia, titulo, fechasConTurnos, hrefMes, hrefDia }: Props) {
  return (
    <div className="rounded-lg border border-border p-3">
      <Link
        href={hrefMes}
        className="mb-2 block text-center font-heading text-sm font-semibold capitalize text-ink hover:text-primary"
      >
        {titulo}
      </Link>
      <div className="grid grid-cols-7 gap-y-0.5 text-center text-[11px]">
        {DIAS_SEMANA_CORTO.map((d, i) => (
          <span key={i} className="text-muted">
            {d}
          </span>
        ))}
        {dias.map((dia) => {
          const fechaStr = formatISO(dia, { representation: "date" });
          const tieneTurnos = fechasConTurnos.has(fechaStr);
          const fueraDeMes = !isSameMonth(dia, mesReferencia);
          const hoy = isToday(dia);

          return (
            <Link
              key={fechaStr}
              href={hrefDia(dia)}
              className={`relative mx-auto flex h-6 w-6 items-center justify-center rounded-full ${
                hoy ? "bg-primary text-white" : fueraDeMes ? "text-muted/40 hover:bg-surface" : "text-ink hover:bg-surface"
              }`}
            >
              {dia.getDate()}
              {tieneTurnos && !hoy && (
                <span className="absolute bottom-0 h-1 w-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
