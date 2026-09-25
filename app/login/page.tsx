import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getSesion } from "@/lib/auth/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getSesion()) redirect("/admin");
  const { next } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center bg-surface px-6 py-16">
      <div className="w-full max-w-sm rounded-lg border border-border bg-white p-8 shadow-sm">
        <h1 className="mb-1 font-heading text-2xl font-semibold text-ink">Panel · Lic. Cerrotta</h1>
        <p className="mb-6 text-sm text-muted">Ingresá con tu usuario y contraseña.</p>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
