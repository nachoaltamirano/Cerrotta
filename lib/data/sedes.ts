import { createClient } from "@/lib/supabase/server";
import type { HorarioSede, Sede } from "@/types/domain";

export async function listSedes(): Promise<Sede[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sedes")
    .select("id, nombre, direccion, activo")
    .eq("activo", true)
    .order("nombre");

  if (error) throw new Error(error.message);
  return data;
}

export async function listHorariosPorSede(sedeId: string): Promise<HorarioSede[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("horarios_sede")
    .select("id, sede_id, dia_semana, hora_inicio, hora_fin, pausa_inicio, pausa_fin")
    .eq("sede_id", sedeId);

  if (error) throw new Error(error.message);
  return data;
}
