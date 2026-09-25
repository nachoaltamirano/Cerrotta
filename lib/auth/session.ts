import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_DURACION_SEGUNDOS,
  crearTokenSesion,
  verificarTokenSesion,
  type Sesion,
} from "@/lib/auth/token";

export async function iniciarSesion(usuario: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, crearTokenSesion(usuario), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURACION_SEGUNDOS,
  });
}

export async function cerrarSesion() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSesion(): Promise<Sesion | null> {
  const cookieStore = await cookies();
  return verificarTokenSesion(cookieStore.get(SESSION_COOKIE)?.value);
}

/**
 * Corta la ejecución si no hay sesión válida. Usar al principio de cada Server Action del panel:
 * las actions se pueden invocar directo por POST, así que el proxy sobre /admin no alcanza.
 */
export async function requerirAdmin(): Promise<Sesion> {
  const sesion = await getSesion();
  if (!sesion) redirect("/login");
  return sesion;
}
