alter table public.temporadas
  add column if not exists numero integer,
  add column if not exists estado text,
  add column if not exists fecha_inicio date,
  add column if not exists fecha_fin date,
  add column if not exists configuracion jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.temporadas
set numero = coalesce(numero, nullif(regexp_replace(nombre, '\D', '', 'g'), '')::integer),
    estado = coalesce(estado, case when coalesce(activa,false) then 'activa' else 'archivada' end)
where numero is null or estado is null;

alter table public.temporadas alter column estado set default 'borrador';

create table if not exists public.competicion_config (
  id uuid primary key default gen_random_uuid(),
  temporada text not null,
  slug text not null,
  nombre text not null,
  tipo text not null default 'liga',
  activa boolean not null default true,
  orden integer not null default 0,
  reglas jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (temporada, slug)
);

alter table public.temporadas enable row level security;
alter table public.competicion_config enable row level security;

drop policy if exists "admins manage temporadas" on public.temporadas;
create policy "admins manage temporadas" on public.temporadas
for all to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "admins manage competicion config" on public.competicion_config;
create policy "admins manage competicion config" on public.competicion_config
for all to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

grant select, insert, update, delete on public.temporadas to authenticated;
grant select, insert, update, delete on public.competicion_config to authenticated;

insert into public.competicion_config (temporada, slug, nombre, tipo, orden, reglas)
select s.nombre, x.slug, x.nombre, x.tipo, x.orden, x.reglas
from public.temporadas s
cross join (values
  ('liga_primera','Primera División','liga',10,'{"puntos_victoria":3,"puntos_empate":1,"ida_vuelta":false,"desempates":["pts","dg","gf"]}'::jsonb),
  ('liga_segunda','Segunda División','liga',20,'{"puntos_victoria":3,"puntos_empate":1,"ida_vuelta":false,"desempates":["pts","dg","gf"]}'::jsonb),
  ('copa_clasificatoria','Clasificatoria','grupos',30,'{"cantidad_grupos":4,"equipos_por_grupo":4,"clasifican_copa_argentina":2,"clasifican_copa_apa":2}'::jsonb),
  ('copa_argentina','Copa Argentina','eliminacion',40,'{"tercer_puesto":false}'::jsonb),
  ('copa_apa','Copa APA','eliminacion',50,'{"tercer_puesto":false}'::jsonb),
  ('copa_campeones','Copa de Campeones','eliminacion',60,'{}'::jsonb),
  ('playoffs','Playoffs de Ascenso','playoffs',70,'{"segunda_posiciones":[2,3,4,5],"primera_promocion_desde_abajo":2}'::jsonb)
) as x(slug,nombre,tipo,orden,reglas)
on conflict (temporada, slug) do nothing;
