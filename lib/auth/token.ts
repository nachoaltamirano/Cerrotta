import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "cerrotta_session";
export const SESSION_DURACION_SEGUNDOS = 60 * 60 * 24 * 7; // 7 días

export interface Sesion {
  usuario: string;
  expira: number; // epoch en segundos
}

function secreto(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET no está configurado (mínimo 32 caracteres)");
  }
  return secret;
}

function firmar(payload: string): string {
  return createHmac("sha256", secreto()).update(payload).digest("base64url");
}

/** Token con formato `<payload base64url>.<firma HMAC-SHA256>`. */
export function crearTokenSesion(usuario: string): string {
  const sesion: Sesion = {
    usuario,
    expira: Math.floor(Date.now() / 1000) + SESSION_DURACION_SEGUNDOS,
  };
  const payload = Buffer.from(JSON.stringify(sesion)).toString("base64url");
  return `${payload}.${firmar(payload)}`;
}

/** Devuelve la sesión si el token tiene firma válida y no expiró; si no, null. */
export function verificarTokenSesion(token: string | undefined): Sesion | null {
  if (!token) return null;
  const [payload, firma] = token.split(".");
  if (!payload || !firma) return null;

  const esperada = Buffer.from(firmar(payload));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null;

  try {
    const sesion = JSON.parse(Buffer.from(payload, "base64url").toString()) as Sesion;
    if (typeof sesion.expira !== "number" || sesion.expira < Date.now() / 1000) return null;
    return sesion;
  } catch {
    return null;
  }
}
