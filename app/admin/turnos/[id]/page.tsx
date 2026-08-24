import { notFound } from "next/navigation";
import { TurnoDetalle } from "@/components/admin/turno-detalle";
import { getTurno } from "@/lib/data/turnos";
import { listPacientes } from "@/lib/data/pacientes";
import { listServicios } from "@/lib/data/servicios";

export default async function TurnoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [turno, pacientes, servicios] = await Promise.all([
    getTurno(id),
    listPacientes(),
    listServicios(),
  ]);
  if (!turno) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-heading text-3xl font-semibold text-ink">Detalle del turno</h1>
      <TurnoDetalle turno={turno} pacientes={pacientes} servicios={servicios} />
    </div>
  );
}
