import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { requerirAdmin } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requerirAdmin();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/admin" className="font-heading text-lg font-semibold">
            Panel · Lic. Cerrotta
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/admin" className="hover:text-primary">
              Turnos
            </Link>
            <Link href="/admin/agenda" className="hover:text-primary">
              Agenda
            </Link>
            <Link href="/admin/pacientes" className="hover:text-primary">
              Pacientes
            </Link>
            <Link href="/admin/configuracion" className="hover:text-primary">
              Configuración
            </Link>
            <Link href="/" className="text-white/60 hover:text-white">
              Sitio público
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="text-white/60 hover:text-white">
                Salir
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
