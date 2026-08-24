"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EstadoBadge } from "@/components/ui/estado-badge";
import {
  actualizarEstadoTurnoAction,
  actualizarObservacionesTurnoAction,
  asignarPacienteTurnoAction,
  reprogramarTurnoAction,
} from "@/lib/actions/admin";
import { diferenciaMinutos } from "@/lib/time";
import { ESTADOS_TURNO } from "@/types/domain";
import type { Paciente, Servicio, TurnoConDetalle } from "@/types/domain";

const inputClass =
  "w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";
const labelClass = "block text-sm font-medium text-ink mb-1";

interface Props {
  turno: TurnoConDetalle;
  pacientes: Paciente[];
  servicios: Servicio[];
}

export function TurnoDetalle({ turno, pacientes, servicios }: Props) {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [observaciones, setObservaciones] = useState(turno.observaciones ?? "");
  const [error, setError] = useState<string | null>(null);
  const [modoPaciente, setModoPaciente] = useState<"existente" | "nuevo">(
    pacientes.length > 0 ? "existente" : "nuevo",
  );

  const duracionDisponible = diferenciaMinutos(turno.hora_inicio, turno.hora_fin);
  const serviciosQueEntran = servicios.filter((s) => s.duracion_minutos <= duracionDisponible);

  async function cambiarEstado(estado: (typeof ESTADOS_TURNO)[number]["value"]) {
    setGuardando(true);
    await actualizarEstadoTurnoAction(turno.id, estado);
    setGuardando(false);
    router.refresh();
  }

  async function guardarObservaciones() {
    setGuardando(true);
    await actualizarObservacionesTurnoAction(turno.id, observaciones);
    setGuardando(false);
    router.refresh();
  }

  async function reprogramar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setGuardando(true);
    await reprogramarTurnoAction(turno.id, String(fd.get("fecha")), String(fd.get("horaInicio")));
    setGuardando(false);
    router.refresh();
  }

  async function asignarPaciente(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setGuardando(true);
    setError(null);
    try {
      await asignarPacienteTurnoAction(turno.id, String(fd.get("servicioId")), {
        pacienteId: modoPaciente === "existente" ? String(fd.get("pacienteId")) : undefined,
        nombre: modoPaciente === "nuevo" ? String(fd.get("nombre") || "") : undefined,
        apellido: modoPaciente === "nuevo" ? String(fd.get("apellido") || "") : undefined,
        dni: modoPaciente === "nuevo" ? String(fd.get("dni") || "") : undefined,
        telefono: modoPaciente === "nuevo" ? String(fd.get("telefono") || "") : undefined,
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo asignar el paciente");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border p-5">
        <div className="flex items-center justify-between">
          <p className="font-heading text-xl font-semibold text-ink">
            {turno.paciente ? (
              `${turno.paciente.nombre} ${turno.paciente.apellido}`
            ) : (
              <span className="rounded-full bg-accent/40 px-3 py-0.5 text-base font-medium">
                Disponible — sin paciente asignado
              </span>
            )}
          </p>
          <EstadoBadge estado={turno.estado} />
        </div>
        <p className="mt-1 text-sm text-muted">
          {turno.servicio?.nombre ?? "Servicio a elección de quien reserve"} · {turno.sede.nombre}
        </p>
        <p className="text-sm text-muted">
          {turno.fecha} · {turno.hora_inicio} - {turno.hora_fin}
        </p>
        {turno.paciente && (
          <p className="mt-2 text-sm text-muted">
            Tel: {turno.paciente.telefono}
            {turno.paciente.email ? ` · ${turno.paciente.email}` : ""}
          </p>
        )}
      </div>

      {!turno.paciente && (
        <div>
          <p className="mb-2 font-heading text-lg font-semibold text-ink">Asignar paciente</p>

          {pacientes.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={modoPaciente === "existente"}
                  onChange={() => setModoPaciente("existente")}
                />
                Paciente existente
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={modoPaciente === "nuevo"}
                  onChange={() => setModoPaciente("nuevo")}
                />
                Paciente nuevo
              </label>
            </div>
          )}

          <form onSubmit={asignarPaciente} className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {modoPaciente === "existente" ? (
                <div className="min-w-64">
                  <label className={labelClass}>Paciente</label>
                  <select name="pacienteId" required className={inputClass}>
                    {pacientes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.apellido}, {p.nombre} — DNI {p.dni}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
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
                </>
              )}
              <div className="min-w-64">
                <label className={labelClass}>Servicio</label>
                <select name="servicioId" required className={inputClass}>
                  {serviciosQueEntran.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} ({s.duracion_minutos} min)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit" disabled={guardando}>
              Asignar y confirmar
            </Button>
          </form>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}

      <div>
        <label className={labelClass}>Estado</label>
        <div className="flex flex-wrap gap-2">
          {ESTADOS_TURNO.map((e) => (
            <Button
              key={e.value}
              variant={turno.estado === e.value ? "primary" : "secondary"}
              disabled={guardando}
              onClick={() => cambiarEstado(e.value)}
            >
              {e.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Observaciones</label>
        <textarea
          className={inputClass}
          rows={3}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
        <Button className="mt-2" variant="secondary" disabled={guardando} onClick={guardarObservaciones}>
          Guardar observaciones
        </Button>
      </div>

      <div>
        <p className="mb-2 font-heading text-lg font-semibold text-ink">Reprogramar</p>
        <form onSubmit={reprogramar} className="flex flex-wrap items-end gap-3">
          <div>
            <label className={labelClass}>Nueva fecha</label>
            <input type="date" name="fecha" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Nueva hora</label>
            <input type="time" name="horaInicio" required className={inputClass} />
          </div>
          <Button type="submit" variant="secondary" disabled={guardando}>
            Reprogramar
          </Button>
        </form>
      </div>
    </div>
  );
}
