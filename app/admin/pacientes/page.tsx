import { listPacientes } from "@/lib/data/pacientes";

export default async function PacientesPage() {
  const pacientes = await listPacientes();

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl font-semibold text-ink">Pacientes</h1>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-2">Apellido y nombre</th>
              <th className="px-4 py-2">DNI</th>
              <th className="px-4 py-2">Teléfono</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Obra social</th>
              <th className="px-4 py-2">Deporte / Nivel</th>
              <th className="px-4 py-2">Objetivos</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((p) => (
              <tr key={p.id} className="border-t border-border align-top">
                <td className="px-4 py-2">
                  {p.apellido}, {p.nombre}
                </td>
                <td className="px-4 py-2">{p.dni}</td>
                <td className="px-4 py-2">{p.telefono}</td>
                <td className="px-4 py-2">{p.email ?? "—"}</td>
                <td className="px-4 py-2">{p.obra_social ?? "—"}</td>
                <td className="px-4 py-2">
                  {p.deporte ?? "—"} {p.nivel ? `· ${p.nivel}` : ""}
                </td>
                <td className="px-4 py-2">{p.objetivos ?? "—"}</td>
              </tr>
            ))}
            {pacientes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  Todavía no hay pacientes cargados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
