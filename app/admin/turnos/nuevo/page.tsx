import { NuevoTurnoForm } from "@/components/admin/nuevo-turno-form";
import { listSedes } from "@/lib/data/sedes";
import { listServicios } from "@/lib/data/servicios";
import { listPacientes } from "@/lib/data/pacientes";

export default async function NuevoTurnoPage() {
  const [sedes, servicios, pacientes] = await Promise.all([
    listSedes(),
    listServicios(),
    listPacientes(),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-heading text-3xl font-semibold text-ink">Nuevo turno</h1>
      <NuevoTurnoForm sedes={sedes} servicios={servicios} pacientes={pacientes} />
    </div>
  );
}
