import { createClient } from "@/lib/supabase/server";
import type { ExcepcionAgenda } from "@/types/domain";

export async function listExcepciones(sedeId?: string): Promise<ExcepcionAgenda[]> {
  const supabase = await createClient();
  let query = supabase
    .from("excepciones_agenda")
    .select("id, sede_id, fecha, tipo, hora_inicio, hora_fin, motivo")
    .order("fecha");

  if (sedeId) {
    query = query.or(`sede_id.eq.${sedeId},sede_id.is.null`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export interface NuevaExcepcion {
  sede_id: string | null;
  fecha: string;
  tipo: "cerrado" | "horario_especial";
  hora_inicio?: string | null;
  hora_fin?: string | null;
  motivo?: string | null;
}

export async function crearExcepcion(input: NuevaExcepcion) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("excepciones_agenda")
    .insert({
      sede_id: input.sede_id,
      fecha: input.fecha,
      tipo: input.tipo,
      hora_inicio: input.hora_inicio ?? null,
      hora_fin: input.hora_fin ?? null,
      motivo: input.motivo ?? null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function eliminarExcepcion(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("excepciones_agenda").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
