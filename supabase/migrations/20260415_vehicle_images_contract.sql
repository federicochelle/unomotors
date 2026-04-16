alter table public.vehicles
  add column if not exists imagen_principal_path text,
  add column if not exists imagen_principal_url text,
  add column if not exists imagen_principal_alt text,
  add column if not exists galeria jsonb default '[]'::jsonb;

comment on column public.vehicles.imagen_principal_path is
  'Path interno en Supabase Storage para la portada. Ej: vehicles/{vehicle_id}/cover.webp';

comment on column public.vehicles.imagen_principal_url is
  'URL publica resuelta para la portada del vehiculo.';

comment on column public.vehicles.imagen_principal_alt is
  'Texto alternativo de la imagen principal.';

comment on column public.vehicles.galeria is
  'Array jsonb de objetos { path, url, alt, orden } para la galeria del vehiculo.';

update public.vehicles
set galeria = '[]'::jsonb
where galeria is null;

alter table public.vehicles
  alter column galeria set default '[]'::jsonb;
