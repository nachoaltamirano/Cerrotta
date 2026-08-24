import Link from "next/link";
import type { TurnoConDetalle } from "@/types/domain";

const colorPorEstado: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  confirmado: "bg-emerald-100 text-emerald-800",
  realizado: "bg-blue-100 text-blue-800",
  cancelado: "bg-red-100 text-red-800 line-through",
  reprogramado: "bg-purple-100 text-purple-800",
  no_asistio: "bg-gray-200 text-gray-700",
};

export function AgendaTurnoChip({ turno }: { turno: TurnoConDetalle }) {
  const color = turno.paciente ? colorPorEstado[turno.estado] : "bg-accent/40 text-ink";
  const etiqueta = turno.paciente
    ? `${turno.paciente.nombre} ${turno.paciente.apellido}`
    : "Disponible";
  const hora = turno.hora_inicio.slice(0, 5);

  return (
    <Link
      href={`/admin/turnos/${turno.id}`}
      title={`${hora} · ${etiqueta} · ${turno.servicio?.nombre ?? "Servicio a elección"} · ${turno.sede.nombre}`}
      className={`block truncate rounded px-1.5 py-0.5 text-xs font-medium hover:opacity-80 ${color}`}
    >
      {hora} {etiqueta}
    </Link>
  );
}
