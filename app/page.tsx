import Link from "next/link";
import { Button } from "@/components/ui/button";
import { listSedes } from "@/lib/data/sedes";
import { listServiciosOnline } from "@/lib/data/servicios";

export default async function HomePage() {
  const [servicios, sedes] = await Promise.all([listServiciosOnline(), listSedes()]);

  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-heading text-xl font-semibold text-primary">Lic. Cerrotta</span>
          <nav className="flex items-center gap-6 text-sm text-muted">
            <a href="#servicios" className="hover:text-primary">
              Servicios
            </a>
            <a href="#sedes" className="hover:text-primary">
              Sedes
            </a>
            <Link href="/admin">
              <Button variant="secondary">Panel</Button>
            </Link>
            <Link href="/reservar">
              <Button>Reservar turno</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-surface">
          <div className="mx-auto max-w-5xl px-6 py-20 text-center">
            <span className="mb-3 inline-block rounded-full bg-accent/40 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-ink">
              Nutricionista Deportivo · UBA
            </span>
            <h1 className="font-heading text-5xl font-bold text-ink">ALCANZÁ TU MÁXIMO NIVEL</h1>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Consultas nutricionales y evaluaciones antropométricas personalizadas para mejorar
              tu rendimiento y tu salud.
            </p>
            <Link href="/reservar" className="mt-8 inline-block">
              <Button className="px-8 py-3 text-base">Reservar turno</Button>
            </Link>
          </div>
        </section>

        <section id="servicios" className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="font-heading text-3xl font-semibold text-ink">Servicios</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {servicios.map((servicio) => (
              <div key={servicio.id} className="rounded-lg border border-border p-6">
                <h3 className="font-heading text-xl font-semibold text-ink">{servicio.nombre}</h3>
                <p className="mt-2 text-sm text-muted">{servicio.duracion_minutos} minutos</p>
                {servicio.precio && (
                  <p className="mt-4 text-2xl font-semibold text-primary">
                    ${servicio.precio.toLocaleString("es-AR")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section id="sedes" className="bg-surface">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="font-heading text-3xl font-semibold text-ink">Sedes</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {sedes.map((sede) => (
                <div key={sede.id} className="rounded-lg bg-background border border-border p-6">
                  <h3 className="font-heading text-xl font-semibold text-ink">{sede.nombre}</h3>
                  <p className="mt-2 text-sm text-muted">{sede.direccion}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center text-sm text-muted">
          Lic. Cerrotta · Nutricionista Deportivo
        </div>
      </footer>
    </>
  );
}
