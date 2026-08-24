/**
 * Convierte una fecha "YYYY-MM-DD" a un Date a medianoche en hora LOCAL.
 * `new Date("YYYY-MM-DD")` la interpreta como UTC, lo que corrompe los cálculos de rango
 * de mes cuando el servidor corre en una zona horaria negativa (ej. America/Buenos_Aires).
 */
export function parseFecha(fecha: string): Date {
  const [year, month, day] = fecha.split("-").map(Number);
  return new Date(year, month - 1, day);
}
