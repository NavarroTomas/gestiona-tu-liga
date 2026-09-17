create table if not exists public.site_editor_owners (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.site_editor_drafts (
  page_key text primary key,
  document jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_editor_versions (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  version_number bigint not null,
  document jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(page_key, version_number)
);

create table if not exists public.site_public_pages (
  page_key text primary key,
  document jsonb not null default '{}'::jsonb,
  version_number bigint not null default 0,
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz not null default now()
);

alter table public.site_editor_owners enable row level security;
alter table public.site_editor_drafts enable row level security;
alter table public.site_editor_versions enable row level security;
alter table public.site_public_pages enable row level security;

revoke all on public.site_editor_owners from anon, authenticated;
revoke all on public.site_editor_drafts from anon, authenticated;
revoke all on public.site_editor_versions from anon, authenticated;
revoke all on public.site_public_pages from anon, authenticated;

grant select on public.site_editor_owners to authenticated;
grant select, insert, update, delete on public.site_editor_drafts to authenticated;
grant select, insert on public.site_editor_versions to authenticated;
grant select on public.site_public_pages to anon;
grant select, insert, update on public.site_public_pages to authenticated;

create policy "editor owners can read own membership"
on public.site_editor_owners for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "editor owner reads drafts"
on public.site_editor_drafts for select
to authenticated
using (exists (select 1 from public.site_editor_owners o where o.user_id = (select auth.uid())));

create policy "editor owner inserts drafts"
on public.site_editor_drafts for insert
to authenticated
with check (exists (select 1 from public.site_editor_owners o where o.user_id = (select auth.uid())) and updated_by = (select auth.uid()));

create policy "editor owner updates drafts"
on public.site_editor_drafts for update
to authenticated
using (exists (select 1 from public.site_editor_owners o where o.user_id = (select auth.uid())))
with check (exists (select 1 from public.site_editor_owners o where o.user_id = (select auth.uid())) and updated_by = (select auth.uid()));

create policy "editor owner deletes drafts"
on public.site_editor_drafts for delete
to authenticated
using (exists (select 1 from public.site_editor_owners o where o.user_id = (select auth.uid())));

create policy "editor owner reads versions"
on public.site_editor_versions for select
to authenticated
using (exists (select 1 from public.site_editor_owners o where o.user_id = (select auth.uid())));

create policy "editor owner inserts versions"
on public.site_editor_versions for insert
to authenticated
with check (exists (select 1 from public.site_editor_owners o where o.user_id = (select auth.uid())) and created_by = (select auth.uid()));

create policy "public can read published site pages"
on public.site_public_pages for select
to anon, authenticated
using (true);

create policy "editor owner inserts published pages"
on public.site_public_pages for insert
to authenticated
with check (exists (select 1 from public.site_editor_owners o where o.user_id = (select auth.uid())) and published_by = (select auth.uid()));

create policy "editor owner updates published pages"
on public.site_public_pages for update
to authenticated
using (exists (select 1 from public.site_editor_owners o where o.user_id = (select auth.uid())))
with check (exists (select 1 from public.site_editor_owners o where o.user_id = (select auth.uid())) and published_by = (select auth.uid()));

create or replace function public.publish_site_page(p_page_key text)
returns bigint
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_document jsonb;
  v_next bigint;
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null or not exists (select 1 from public.site_editor_owners where user_id = v_uid) then
    raise exception 'not authorized';
  end if;

  select document into v_document
  from public.site_editor_drafts
  where page_key = p_page_key;

  if v_document is null then
    raise exception 'draft not found';
  end if;

  select coalesce(max(version_number), 0) + 1
  into v_next
  from public.site_editor_versions
  where page_key = p_page_key;

  insert into public.site_editor_versions(page_key, version_number, document, created_by)
  values (p_page_key, v_next, v_document, v_uid);

  insert into public.site_public_pages(page_key, document, version_number, published_by, published_at)
  values (p_page_key, v_document, v_next, v_uid, now())
  on conflict (page_key) do update
  set document = excluded.document,
      version_number = excluded.version_number,
      published_by = excluded.published_by,
      published_at = excluded.published_at;

  return v_next;
end;
$$;

revoke execute on function public.publish_site_page(text) from public, anon;
grant execute on function public.publish_site_page(text) to authenticated;

create index if not exists site_editor_versions_page_key_created_at_idx
on public.site_editor_versions(page_key, created_at desc);

-- Propietario inicial del editor. Se resuelve por username para no fijar un UUID generado.
insert into public.site_editor_owners(user_id)
select id from public.profiles where username = 'monchon'
on conflict (user_id) do nothing;
