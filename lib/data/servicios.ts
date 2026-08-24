import { createClient } from "@/lib/supabase/server";
import type { Servicio } from "@/types/domain";

export async function listServiciosOnline(): Promise<Servicio[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servicios")
    .select("id, nombre, duracion_minutos, precio, disponible_online, activo")
    .eq("activo", true)
    .eq("disponible_online", true)
    .order("nombre");

  if (error) throw new Error(error.message);
  return data;
}

export async function listServicios(): Promise<Servicio[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servicios")
    .select("id, nombre, duracion_minutos, precio, disponible_online, activo")
    .order("nombre");

  if (error) throw new Error(error.message);
  return data;
}

export async function getServicio(id: string): Promise<Servicio | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servicios")
    .select("id, nombre, duracion_minutos, precio, disponible_online, activo")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function listSedeIdsDeServicio(servicioId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servicio_sedes")
    .select("sede_id")
    .eq("servicio_id", servicioId);

  if (error) throw new Error(error.message);
  return data.map((row) => row.sede_id);
}

/** Mapa servicio_id -> sede_id[] para todos los servicios, usado por el flujo de reserva. */
export async function listMapaServicioSedes(): Promise<Record<string, string[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("servicio_sedes").select("servicio_id, sede_id");

  if (error) throw new Error(error.message);

  const mapa: Record<string, string[]> = {};
  for (const row of data) {
    (mapa[row.servicio_id] ??= []).push(row.sede_id);
  }
  return mapa;
}
