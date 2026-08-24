import type { EstadoTurno } from "@/types/domain";
import { ESTADOS_TURNO } from "@/types/domain";

const colorPorEstado: Record<EstadoTurno, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  confirmado: "bg-emerald-100 text-emerald-800",
  realizado: "bg-blue-100 text-blue-800",
  cancelado: "bg-red-100 text-red-800",
  reprogramado: "bg-purple-100 text-purple-800",
  no_asistio: "bg-gray-200 text-gray-700",
};

export function EstadoBadge({ estado }: { estado: EstadoTurno }) {
  const label = ESTADOS_TURNO.find((e) => e.value === estado)?.label ?? estado;
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colorPorEstado[estado]}`}
    >
      {label}
    </span>
  );
}
