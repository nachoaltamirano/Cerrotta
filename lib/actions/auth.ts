"use server";

import { timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { verificarPassword } from "@/lib/auth/password";
import { cerrarSesion, iniciarSesion } from "@/lib/auth/session";

export interface LoginState {
  error?: string;
}

function mismoUsuario(a: string, b: string): boolean {
  const bufA = Buffer.from(a.toLowerCase());
  const bufB = Buffer.from(b.toLowerCase());
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/** Solo permite volver a rutas internas del panel (evita open redirects). */
function destinoSeguro(next: FormDataEntryValue | null): string {
  return typeof next === "string" && next.startsWith("/admin") ? next : "/admin";
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const usuario = String(formData.get("usuario") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const usuarioAdmin = process.env.ADMIN_USERNAME;
  const hashAdmin = process.env.ADMIN_PASSWORD_HASH;
  if (!usuarioAdmin || !hashAdmin) {
    return { error: "El login no está configurado en el servidor." };
  }

  // Se verifica la contraseña siempre (aunque el usuario no coincida) para no revelar
  // por tiempo de respuesta si el usuario existe.
  const passwordOk = await verificarPassword(password, hashAdmin);
  if (!mismoUsuario(usuario, usuarioAdmin) || !passwordOk) {
    // Pequeña demora para frenar intentos de fuerza bruta.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { error: "Usuario o contraseña incorrectos." };
  }

  await iniciarSesion(usuarioAdmin);
  redirect(destinoSeguro(formData.get("next")));
}

export async function logoutAction() {
  await cerrarSesion();
  redirect("/login");
}
