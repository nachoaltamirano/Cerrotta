"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { crearExcepcionAction, eliminarExcepcionAction } from "@/lib/actions/admin";
import type { ExcepcionAgenda, Sede, TipoExcepcion } from "@/types/domain";

interface Props {
  sedes: Sede[];
  excepciones: ExcepcionAgenda[];
}

const inputClass =
  "w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";
const labelClass = "block text-sm font-medium text-ink mb-1";

export function ExcepcionesManager({ sedes, excepciones }: Props) {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoExcepcion>("cerrado");
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    const fd = new FormData(e.currentTarget);
    const sedeId = String(fd.get("sedeId") || "");

    await crearExcepcionAction({
      sede_id: sedeId || null,
      fecha: String(fd.get("fecha")),
      tipo,
      hora_inicio: tipo === "horario_especial" ? String(fd.get("horaInicio")) : null,
      hora_fin: tipo === "horario_especial" ? String(fd.get("horaFin")) : null,
      motivo: String(fd.get("motivo") || ""),
    });

    setEnviando(false);
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  async function eliminar(id: string) {
    setEnviando(true);
    await eliminarExcepcionAction(id);
    setEnviando(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Sede</label>
          <select name="sedeId" className={inputClass}>
            <option value="">Todas las sedes</option>
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Fecha</label>
          <input type="date" name="fecha" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Tipo</label>
          <select
            className={inputClass}
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoExcepcion)}
          >
            <option value="cerrado">No atiende</option>
            <option value="horario_especial">Horario especial</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Motivo</label>
          <input name="motivo" placeholder="Feriado, vacaciones…" className={inputClass} />
        </div>
        {tipo === "horario_especial" && (
          <>
            <div>
              <label className={labelClass}>Desde</label>
              <input type="time" name="horaInicio" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hasta</label>
              <input type="time" name="horaFin" required className={inputClass} />
            </div>
          </>
        )}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={enviando}>
            Agregar excepción
          </Button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Sede</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Horario</th>
              <th className="px-4 py-2">Motivo</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {excepciones.map((ex) => (
              <tr key={ex.id} className="border-t border-border">
                <td className="px-4 py-2">{ex.fecha}</td>
                <td className="px-4 py-2">{sedes.find((s) => s.id === ex.sede_id)?.nombre ?? "Todas"}</td>
                <td className="px-4 py-2">{ex.tipo === "cerrado" ? "No atiende" : "Horario especial"}</td>
                <td className="px-4 py-2">
                  {ex.hora_inicio ? `${ex.hora_inicio} - ${ex.hora_fin}` : "—"}
                </td>
                <td className="px-4 py-2">{ex.motivo ?? "—"}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => eliminar(ex.id)}
                    disabled={enviando}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {excepciones.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No hay excepciones cargadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
