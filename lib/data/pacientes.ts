import { createClient } from "@/lib/supabase/server";
import type { Paciente } from "@/types/domain";

export type DatosPaciente = Omit<Paciente, "id">;

/** Crea el paciente o actualiza sus datos si ya existe uno con el mismo DNI. */
export async function upsertPacientePorDni(datos: DatosPaciente): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pacientes")
    .upsert(datos, { onConflict: "dni" })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function listPacientes(): Promise<Paciente[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pacientes")
    .select(
      "id, nombre, apellido, dni, telefono, email, fecha_nacimiento, obra_social, deporte, nivel, analisis_sangre, objetivos, observaciones",
    )
    .order("apellido");

  if (error) throw new Error(error.message);
  return data;
}

export async function getPaciente(id: string): Promise<Paciente | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pacientes")
    .select(
      "id, nombre, apellido, dni, telefono, email, fecha_nacimiento, obra_social, deporte, nivel, analisis_sangre, objetivos, observaciones",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
