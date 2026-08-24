"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addMonths, format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { crearReservaAction, obtenerSlotsAction } from "@/lib/actions/reservas";
import type { Sede, Servicio, Slot } from "@/types/domain";

const pacienteSchema = z.object({
  nombre: z.string().min(1, "Ingresá tu nombre"),
  apellido: z.string().min(1, "Ingresá tu apellido"),
  dni: z.string().min(6, "DNI inválido"),
  telefono: z.string().min(6, "Teléfono inválido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  fechaNacimiento: z.string().optional().or(z.literal("")),
  obraSocial: z.string().optional().or(z.literal("")),
  deporte: z.string().optional().or(z.literal("")),
  nivel: z.string().optional().or(z.literal("")),
  objetivos: z.string().optional().or(z.literal("")),
  observaciones: z.string().optional().or(z.literal("")),
});

type PacienteForm = z.infer<typeof pacienteSchema>;

interface Props {
  servicios: Servicio[];
  sedes: Sede[];
  mapaServicioSedes: Record<string, string[]>;
}

const inputClass =
  "w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";
const labelClass = "block text-sm font-medium text-ink mb-1";

export function ReservaWizard({ servicios, sedes, mapaServicioSedes }: Props) {
  const [paso, setPaso] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [servicioId, setServicioId] = useState<string | null>(null);
  const [sedeId, setSedeId] = useState<string | null>(null);
  const [mes, setMes] = useState(() => startOfMonth(new Date()));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [slotElegido, setSlotElegido] = useState<Slot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const servicio = servicios.find((s) => s.id === servicioId) ?? null;
  const sede = sedes.find((s) => s.id === sedeId) ?? null;
  const sedesDisponibles = useMemo(
    () => sedes.filter((s) => (servicioId ? mapaServicioSedes[servicioId]?.includes(s.id) : false)),
    [sedes, servicioId, mapaServicioSedes],
  );

  useEffect(() => {
    if (paso !== 3 || !sedeId || !servicioId) return;

    let cancelado = false;
    async function cargarSlots() {
      setCargandoSlots(true);
      setError(null);
      try {
        const resultado = await obtenerSlotsAction(sedeId!, servicioId!, format(mes, "yyyy-MM-01"));
        if (!cancelado) setSlots(resultado);
      } catch {
        if (!cancelado) setError("No se pudieron cargar los horarios. Probá de nuevo.");
      } finally {
        if (!cancelado) setCargandoSlots(false);
      }
    }

    cargarSlots();
    return () => {
      cancelado = true;
    };
  }, [paso, sedeId, servicioId, mes]);

  const slotsPorFecha = useMemo(() => {
    const mapa = new Map<string, Slot[]>();
    for (const slot of slots) {
      (mapa.get(slot.fecha) ?? mapa.set(slot.fecha, []).get(slot.fecha)!).push(slot);
    }
    return mapa;
  }, [slots]);

  const form = useForm<PacienteForm>({ resolver: zodResolver(pacienteSchema) });
  const [turnoId, setTurnoId] = useState<string | null>(null);

  async function onSubmit(datos: PacienteForm) {
    if (!servicioId || !sedeId || !slotElegido) return;
    setEnviando(true);
    setError(null);
    const resultado = await crearReservaAction({
      servicioId,
      sedeId,
      fecha: slotElegido.fecha,
      horaInicio: slotElegido.hora_inicio,
      horaFin: slotElegido.hora_fin,
      ...datos,
    });
    setEnviando(false);
    if (!resultado.ok) {
      setError(resultado.error ?? "No se pudo reservar el turno.");
      return;
    }
    setTurnoId(resultado.turnoId ?? null);
    setPaso(5);
  }

  return (
    <div className="mt-8">
      <ol className="mb-8 flex gap-4 text-sm text-muted">
        {["Servicio", "Sede", "Horario", "Tus datos"].map((label, i) => (
          <li
            key={label}
            className={`flex items-center gap-2 ${paso === i + 1 ? "font-semibold text-primary" : ""}`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                paso > i + 1 ? "bg-primary text-white" : paso === i + 1 ? "border border-primary text-primary" : "border border-border"
              }`}
            >
              {i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      {paso === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {servicios.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setServicioId(s.id);
                setSedeId(null);
                setPaso(2);
              }}
              className="rounded-lg border border-border p-5 text-left hover:border-primary hover:bg-surface"
            >
              <p className="font-heading text-lg font-semibold text-ink">{s.nombre}</p>
              <p className="mt-1 text-sm text-muted">{s.duracion_minutos} min</p>
              {s.precio && <p className="mt-2 font-semibold text-primary">${s.precio.toLocaleString("es-AR")}</p>}
            </button>
          ))}
        </div>
      )}

      {paso === 2 && (
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            {sedesDisponibles.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSedeId(s.id);
                  setPaso(3);
                }}
                className="rounded-lg border border-border p-5 text-left hover:border-primary hover:bg-surface"
              >
                <p className="font-heading text-lg font-semibold text-ink">{s.nombre}</p>
                <p className="mt-1 text-sm text-muted">{s.direccion}</p>
              </button>
            ))}
          </div>
          <Button variant="ghost" className="mt-6" onClick={() => setPaso(1)}>
            ← Volver
          </Button>
        </div>
      )}

      {paso === 3 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <Button variant="secondary" onClick={() => setMes((m) => addMonths(m, -1))}>
              ← Mes anterior
            </Button>
            <p className="font-heading text-lg font-semibold capitalize">
              {format(mes, "MMMM yyyy", { locale: es })}
            </p>
            <Button variant="secondary" onClick={() => setMes((m) => addMonths(m, 1))}>
              Mes siguiente →
            </Button>
          </div>

          {cargandoSlots && <p className="text-sm text-muted">Buscando horarios disponibles…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!cargandoSlots && slotsPorFecha.size === 0 && (
            <p className="text-sm text-muted">No hay horarios disponibles este mes en {sede?.nombre}.</p>
          )}

          <div className="space-y-4">
            {[...slotsPorFecha.entries()].map(([fecha, slotsDelDia]) => (
              <div key={fecha}>
                <p className="mb-2 text-sm font-semibold capitalize text-ink">
                  {format(new Date(fecha + "T00:00:00"), "EEEE d 'de' MMMM", { locale: es })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {slotsDelDia.map((slot) => (
                    <button
                      key={slot.hora_inicio}
                      onClick={() => {
                        setSlotElegido(slot);
                        setPaso(4);
                      }}
                      className="rounded-md border border-border px-3 py-1.5 text-sm hover:border-primary hover:bg-surface"
                    >
                      {slot.hora_inicio}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button variant="ghost" className="mt-6" onClick={() => setPaso(2)}>
            ← Volver
          </Button>
        </div>
      )}

      {paso === 4 && slotElegido && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-md bg-surface p-4 text-sm text-ink">
            <p className="font-semibold">{servicio?.nombre}</p>
            <p>
              {sede?.nombre} ·{" "}
              {format(new Date(slotElegido.fecha + "T00:00:00"), "EEEE d 'de' MMMM", { locale: es })} ·{" "}
              {slotElegido.hora_inicio} hs
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Nombre</label>
              <input className={inputClass} {...form.register("nombre")} />
              {form.formState.errors.nombre && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.nombre.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Apellido</label>
              <input className={inputClass} {...form.register("apellido")} />
              {form.formState.errors.apellido && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.apellido.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>DNI</label>
              <input className={inputClass} {...form.register("dni")} />
              {form.formState.errors.dni && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.dni.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input className={inputClass} {...form.register("telefono")} />
              {form.formState.errors.telefono && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.telefono.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Email (opcional)</label>
              <input className={inputClass} {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Fecha de nacimiento</label>
              <input type="date" className={inputClass} {...form.register("fechaNacimiento")} />
            </div>
            <div>
              <label className={labelClass}>Obra social</label>
              <input className={inputClass} {...form.register("obraSocial")} />
            </div>
            <div>
              <label className={labelClass}>Deporte</label>
              <input className={inputClass} {...form.register("deporte")} />
            </div>
            <div>
              <label className={labelClass}>Nivel</label>
              <input className={inputClass} {...form.register("nivel")} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Objetivos</label>
            <textarea className={inputClass} rows={2} {...form.register("objetivos")} />
          </div>
          <div>
            <label className={labelClass}>Observaciones</label>
            <textarea className={inputClass} rows={2} {...form.register("observaciones")} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={enviando}>
              {enviando ? "Reservando…" : "Confirmar turno"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setPaso(3)}>
              ← Volver
            </Button>
          </div>
        </form>
      )}

      {paso === 5 && slotElegido && (
        <div className="rounded-lg border border-border p-6 text-center">
          <p className="font-heading text-2xl font-semibold text-primary">¡Turno confirmado!</p>
          <p className="mt-3 text-ink">
            {servicio?.nombre} en {sede?.nombre}
          </p>
          <p className="text-ink">
            {format(new Date(slotElegido.fecha + "T00:00:00"), "EEEE d 'de' MMMM", { locale: es })} a las{" "}
            {slotElegido.hora_inicio} hs
          </p>
          {turnoId && <p className="mt-2 text-xs text-muted">N° de turno: {turnoId}</p>}
          <Link href="/" className="mt-6 inline-block">
            <Button variant="secondary">Volver al inicio</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
