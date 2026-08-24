-- Esquema inicial: sedes, horarios semanales, servicios, pacientes, turnos y excepciones de agenda.
-- Sin Supabase Auth todavia: las policies de RLS son permisivas y deben restringirse
-- cuando se agregue login/roles en la proxima etapa.

create extension if not exists "pgcrypto";

create type estado_turno as enum (
  'pendiente',
  'confirmado',
  'realizado',
  'cancelado',
  'reprogramado',
  'no_asistio'
);

create table sedes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text not null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Ventana de atencion semanal por sede. dia_semana: 0=domingo ... 6=sabado (igual a Date#getDay()).
-- pausa_inicio/pausa_fin son opcionales (ej. Unbex corta de 12 a 14).
create table horarios_sede (
  id uuid primary key default gen_random_uuid(),
  sede_id uuid not null references sedes(id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fin time not null,
  pausa_inicio time,
  pausa_fin time,
  check (hora_fin > hora_inicio),
  check (
    (pausa_inicio is null and pausa_fin is null)
    or (pausa_inicio is not null and pausa_fin is not null and pausa_fin > pausa_inicio)
  )
);

create table servicios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  duracion_minutos int not null check (duracion_minutos > 0),
  precio numeric(10, 2),
  disponible_online boolean not null default true,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table servicio_sedes (
  servicio_id uuid not null references servicios(id) on delete cascade,
  sede_id uuid not null references sedes(id) on delete cascade,
  primary key (servicio_id, sede_id)
);

create table pacientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellido text not null,
  dni text not null unique,
  telefono text not null,
  email text,
  fecha_nacimiento date,
  obra_social text,
  deporte text,
  nivel text,
  analisis_sangre text,
  objetivos text,
  observaciones text,
  created_at timestamptz not null default now()
);

create table turnos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete restrict,
  servicio_id uuid not null references servicios(id) on delete restrict,
  sede_id uuid not null references sedes(id) on delete restrict,
  fecha date not null,
  hora_inicio time not null,
  hora_fin time not null,
  estado estado_turno not null default 'confirmado',
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (hora_fin > hora_inicio)
);

create index turnos_sede_fecha_idx on turnos (sede_id, fecha);
create index turnos_paciente_idx on turnos (paciente_id);

-- Excepciones puntuales a la agenda semanal: feriados, vacaciones, dias especiales o
-- bloqueos de horario creados manualmente desde el panel. sede_id null = aplica a todas las sedes.
create table excepciones_agenda (
  id uuid primary key default gen_random_uuid(),
  sede_id uuid references sedes(id) on delete cascade,
  fecha date not null,
  tipo text not null check (tipo in ('cerrado', 'horario_especial')),
  hora_inicio time,
  hora_fin time,
  motivo text,
  created_at timestamptz not null default now(),
  check (
    (tipo = 'cerrado' and hora_inicio is null and hora_fin is null)
    or (tipo = 'horario_especial' and hora_inicio is not null and hora_fin is not null and hora_fin > hora_inicio)
  )
);

create index excepciones_sede_fecha_idx on excepciones_agenda (sede_id, fecha);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger turnos_set_updated_at
  before update on turnos
  for each row
  execute function set_updated_at();

-- RLS permisiva temporal (sin auth todavia). Restringir al agregar login/roles.
alter table sedes enable row level security;
alter table horarios_sede enable row level security;
alter table servicios enable row level security;
alter table servicio_sedes enable row level security;
alter table pacientes enable row level security;
alter table turnos enable row level security;
alter table excepciones_agenda enable row level security;

create policy "allow all - sedes" on sedes for all using (true) with check (true);
create policy "allow all - horarios_sede" on horarios_sede for all using (true) with check (true);
create policy "allow all - servicios" on servicios for all using (true) with check (true);
create policy "allow all - servicio_sedes" on servicio_sedes for all using (true) with check (true);
create policy "allow all - pacientes" on pacientes for all using (true) with check (true);
create policy "allow all - turnos" on turnos for all using (true) with check (true);
create policy "allow all - excepciones_agenda" on excepciones_agenda for all using (true) with check (true);
