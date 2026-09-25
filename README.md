# Turnos — Lic. Cerrotta

Sitio de reserva de turnos y panel de administración para el Lic. Cerrotta (Nutricionista
Deportivo). Next.js (App Router) + Supabase.

Ver `docs/respuestas-cerrotta.pdf` para el relevamiento original (sedes, horarios, servicios y
reglas de reserva) que definió los datos precargados de este proyecto.

## Estado actual

- Sitio público (`/`, `/reservar`) y panel admin (`/admin`, `/admin/pacientes`,
  `/admin/configuracion`) funcionando contra Supabase real.
- **Login del panel**: `/admin` requiere usuario y contraseña (`/login`). Hay un único usuario
  administrador definido por `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` en `.env.local`; la sesión es
  una cookie firmada con `AUTH_SECRET`. Las políticas RLS de Supabase siguen abiertas: restringirlas
  queda para cuando se migre a Supabase Auth.
- **Sin cobro online todavía**: la reserva no pasa por Mercado Pago Checkout Pro en esta etapa.

## Puesta en marcha

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. En el SQL Editor del proyecto, correr en orden:
   - `supabase/migrations/0001_init.sql` (crea las tablas)
   - `supabase/seed.sql` (carga sedes, horarios y servicios reales de Cerrotta)
3. Copiar `.env.local.example` a `.env.local` y completar con la URL y la anon key del proyecto
   (Project Settings → API), y con las variables del login (ver comentarios en el ejemplo).
4. Instalar dependencias y levantar el servidor:

   ```bash
   npm install
   npm run dev
   ```

5. Abrir [http://localhost:3000](http://localhost:3000) para el sitio público y
   [http://localhost:3000/admin](http://localhost:3000/admin) para el panel.

## Estructura

- `app/` — rutas del sitio público y del panel admin (App Router).
- `lib/data/` — acceso a datos de Supabase (sedes, servicios, turnos, pacientes, excepciones).
- `lib/availability.ts` — cálculo de horarios disponibles (horario semanal − pausas −
  excepciones − turnos ya tomados − regla de anticipación mínima).
- `lib/actions/` — Server Actions para reservar turnos y para las operaciones del panel admin.
- `supabase/` — migración SQL y seed con los datos reales del PDF de relevamiento.
