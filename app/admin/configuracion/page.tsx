import { ExcepcionesManager } from "@/components/admin/excepciones-manager";
import { listSedes } from "@/lib/data/sedes";
import { listServicios } from "@/lib/data/servicios";
import { listExcepciones } from "@/lib/data/excepciones";

export default async function ConfiguracionPage() {
  const [sedes, servicios, excepciones] = await Promise.all([
    listSedes(),
    listServicios(),
    listExcepciones(),
  ]);

  return (
    <div className="space-y-10">
      <h1 className="font-heading text-3xl font-semibold text-ink">Configuración</h1>

      <section>
        <h2 className="mb-3 font-heading text-xl font-semibold text-ink">Sedes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {sedes.map((s) => (
            <div key={s.id} className="rounded-lg border border-border p-4">
              <p className="font-semibold text-ink">{s.nombre}</p>
              <p className="text-sm text-muted">{s.direccion}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl font-semibold text-ink">Servicios</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Duración</th>
                <th className="px-4 py-2">Precio</th>
                <th className="px-4 py-2">Online</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-2">{s.nombre}</td>
                  <td className="px-4 py-2">{s.duracion_minutos} min</td>
                  <td className="px-4 py-2">{s.precio ? `$${s.precio.toLocaleString("es-AR")}` : "—"}</td>
                  <td className="px-4 py-2">{s.disponible_online ? "Sí" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl font-semibold text-ink">
          Excepciones de agenda (feriados, vacaciones, días especiales, bloqueos)
        </h2>
        <ExcepcionesManager sedes={sedes} excepciones={excepciones} />
      </section>
    </div>
  );
}
