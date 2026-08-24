import Link from "next/link";
import { ReservaWizard } from "@/components/site/reserva-wizard";
import { listSedes } from "@/lib/data/sedes";
import { listServiciosOnline, listMapaServicioSedes } from "@/lib/data/servicios";

export default async function ReservarPage() {
  const [servicios, sedes, mapaServicioSedes] = await Promise.all([
    listServiciosOnline(),
    listSedes(),
    listMapaServicioSedes(),
  ]);

  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-4">
          <Link href="/" className="font-heading text-xl font-semibold text-primary">
            Lic. Cerrotta
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="font-heading text-3xl font-semibold text-ink">Reservar turno</h1>
        <ReservaWizard servicios={servicios} sedes={sedes} mapaServicioSedes={mapaServicioSedes} />
      </main>
    </>
  );
}
