import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EstadoBadge } from "@/components/ui/estado-badge";
import { listTurnos } from "@/lib/data/turnos";
import { listSedes } from "@/lib/data/sedes";
import { ESTADOS_TURNO } from "@/types/domain";
import type { EstadoTurno } from "@/types/domain";

export default async function AdminTurnosPage({
  searchParams,
}: {
  searchParams: Promise<{ sede?: string; estado?: string }>;
}) {
  const params = await searchParams;
  const sedes = await listSedes();

  const turnos = await listTurnos({
    sedeId: params.sede || undefined,
    estado: (params.estado as EstadoTurno) || undefined,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold text-ink">Turnos</h1>
        <Link href="/admin/turnos/nuevo">
          <Button>+ Nuevo turno</Button>
        </Link>
      </div>

      <form className="mb-6 flex flex-wrap gap-3 text-sm">
        <select name="sede" defaultValue={params.sede ?? ""} className="rounded-md border border-border px-3 py-2">
          <option value="">Todas las sedes</option>
          {sedes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
        <select name="estado" defaultValue={params.estado ?? ""} className="rounded-md border border-border px-3 py-2">
          <option value="">Todos los estados</option>
          {ESTADOS_TURNO.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Hora</th>
              <th className="px-4 py-2">Paciente</th>
              <th className="px-4 py-2">Servicio</th>
              <th className="px-4 py-2">Sede</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {turnos.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-4 py-2">{t.fecha}</td>
                <td className="px-4 py-2">{t.hora_inicio}</td>
                <td className="px-4 py-2">
                  {t.paciente ? (
                    `${t.paciente.nombre} ${t.paciente.apellido}`
                  ) : (
                    <span className="rounded-full bg-accent/40 px-2 py-0.5 text-xs font-medium text-ink">
                      Disponible — sin tomar
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">{t.servicio?.nombre ?? "A elección del paciente"}</td>
                <td className="px-4 py-2">{t.sede.nombre}</td>
                <td className="px-4 py-2">
                  <EstadoBadge estado={t.estado} />
                </td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/admin/turnos/${t.id}`} className="text-primary hover:underline">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {turnos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  No hay turnos para este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
