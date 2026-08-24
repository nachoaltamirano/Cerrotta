"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { crearTurnoManualAction } from "@/lib/actions/admin";
import type { Paciente, Sede, Servicio } from "@/types/domain";

interface Props {
  sedes: Sede[];
  servicios: Servicio[];
  pacientes: Paciente[];
}

type Modo = "existente" | "nuevo" | "disponible";

const inputClass =
  "w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";
const labelClass = "block text-sm font-medium text-ink mb-1";

export function NuevoTurnoForm({ sedes, servicios, pacientes }: Props) {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>(pacientes.length > 0 ? "existente" : "nuevo");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    const fd = new FormData(e.currentTarget);

    try {
      await crearTurnoManualAction({
        modo,
        servicioId: modo === "disponible" ? undefined : String(fd.get("servicioId")),
        sedeId: String(fd.get("sedeId")),
        fecha: String(fd.get("fecha")),
        horaInicio: String(fd.get("horaInicio")),
        horaFin: modo === "disponible" ? String(fd.get("horaFin")) : undefined,
        observaciones: String(fd.get("observaciones") || ""),
        pacienteId: modo === "existente" ? String(fd.get("pacienteId")) : undefined,
        nombre: modo === "nuevo" ? String(fd.get("nombre") || "") : undefined,
        apellido: modo === "nuevo" ? String(fd.get("apellido") || "") : undefined,
        dni: modo === "nuevo" ? String(fd.get("dni") || "") : undefined,
        telefono: modo === "nuevo" ? String(fd.get("telefono") || "") : undefined,
      });
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el turno");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Paciente</label>
        <div className="flex flex-wrap gap-4 text-sm">
          {pacientes.length > 0 && (
            <label className="flex items-center gap-2">
              <input type="radio" checked={modo === "existente"} onChange={() => setModo("existente")} />
              Paciente existente
            </label>
          )}
          <label className="flex items-center gap-2">
            <input type="radio" checked={modo === "nuevo"} onChange={() => setModo("nuevo")} />
            Paciente nuevo
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={modo === "disponible"} onChange={() => setModo("disponible")} />
            Sin asignar (turno disponible)
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {modo !== "disponible" && (
          <div>
            <label className={labelClass}>Servicio</label>
            <select name="servicioId" required className={inputClass}>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className={labelClass}>Sede</label>
          <select name="sedeId" required className={inputClass}>
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
          <label className={labelClass}>Hora de inicio</label>
          <input type="time" name="horaInicio" required className={inputClass} />
        </div>
        {modo === "disponible" && (
          <div>
            <label className={labelClass}>Hora de fin</label>
            <input type="time" name="horaFin" required className={inputClass} />
          </div>
        )}
      </div>

      {modo === "existente" && (
        <div>
          <label className={labelClass}>Paciente</label>
          <select name="pacienteId" required className={inputClass}>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.apellido}, {p.nombre} — DNI {p.dni}
              </option>
            ))}
          </select>
        </div>
      )}

      {modo === "nuevo" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nombre</label>
            <input name="nombre" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Apellido</label>
            <input name="apellido" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>DNI</label>
            <input name="dni" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Teléfono</label>
            <input name="telefono" required className={inputClass} />
          </div>
        </div>
      )}

      {modo === "disponible" && (
        <p className="rounded-md bg-surface p-3 text-sm text-muted">
          Este turno va a quedar publicado como <span className="font-medium text-ink">disponible</span> en
          la ventana horaria elegida, sin paciente ni servicio asignado — eso lo elige quien lo reserve
          desde <span className="font-medium text-ink">/reservar</span>. Se ofrece para cualquier servicio
          cuya duración entre en esa ventana, aunque el día u horario no forme parte de la agenda semanal
          habitual.
        </p>
      )}

      <div>
        <label className={labelClass}>Observaciones</label>
        <textarea name="observaciones" rows={2} className={inputClass} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={enviando}>
        {enviando ? "Guardando…" : modo === "disponible" ? "Publicar turno disponible" : "Crear turno"}
      </Button>
    </form>
  );
}
