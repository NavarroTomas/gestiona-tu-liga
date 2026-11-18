-- Platform bootstrap v1. Target: the NEW, empty, exclusive league project.
-- Do not apply the legacy APA migrations to this database.
-- Atomic: a failure rolls the entire bootstrap back. Apply once.
begin;
create schema if not exists private;
revoke all on schema private from public,anon,authenticated;
grant usage on schema private to anon, authenticated;

create table public.leagues (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{0,69}$'),
 name text not null check (length(trim(name)) between 1 and 80),
 description text not null default '' check (length(description) <= 1000),
 purpose text not null check (purpose in ('amateur','friends','school','other')),
 mode text not null check (mode in ('teams','players')),
 expected_participants integer not null check (expected_participants between 2 and 128),
 format text not null check (format in ('round_robin','double_round_robin','friendly')),
 primary_color text not null default '#216348' check (primary_color ~ '^#[0-9a-fA-F]{6}$'),
 secondary_color text not null default '#dbe99d' check (secondary_color ~ '^#[0-9a-fA-F]{6}$'),
 logo_url text check (logo_url is null or logo_url ~ '^https://'),
 points_win integer not null default 3 check (points_win between -100 and 100),
 points_draw integer not null default 1 check (points_draw between -100 and 100),
 points_loss integer not null default 0 check (points_loss between -100 and 100),
 is_public boolean not null default true,
 created_at timestamptz not null default now(),
 check (mode <> 'players' or format = 'friendly')
);
create table public.league_members (
 league_id uuid not null references public.leagues(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check (role in ('owner','admin')),
 created_at timestamptz not null default now(), primary key (league_id,user_id)
);
create index league_members_user_idx on public.league_members(user_id);
create table private.league_creation_requests (
 user_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null, league_id uuid not null references public.leagues(id) on delete cascade,
 primary key(user_id,request_id)
);
alter table private.league_creation_requests enable row level security;

create table public.seasons (
 id uuid primary key default gen_random_uuid(), league_id uuid not null references public.leagues(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 80), is_active boolean not null default true,
 created_at timestamptz not null default now(), unique(id,league_id), unique(league_id,name)
);
create table public.divisions (
 id uuid primary key default gen_random_uuid(), league_id uuid not null references public.leagues(id) on delete cascade,
 season_id uuid not null, name text not null check(length(trim(name)) between 1 and 80),
 created_at timestamptz not null default now(), unique(id,league_id), unique(season_id,name),
 foreign key(season_id,league_id) references public.seasons(id,league_id)
);
create table public.competitions (
 id uuid primary key default gen_random_uuid(), league_id uuid not null references public.leagues(id) on delete cascade,
 season_id uuid not null, division_id uuid not null,
 name text not null check(length(trim(name)) between 1 and 80),
 format text not null check(format in ('round_robin','double_round_robin','friendly')),
 created_at timestamptz not null default now(), unique(id,league_id),
 foreign key(season_id,league_id) references public.seasons(id,league_id),
 foreign key(division_id,league_id) references public.divisions(id,league_id)
);
create table public.teams (
 id uuid primary key default gen_random_uuid(), league_id uuid not null references public.leagues(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 80), short_name text not null default '' check(length(short_name)<=8),
 logo_url text check(logo_url is null or logo_url ~ '^https://'),
 created_at timestamptz not null default now(), unique(id,league_id)
);
create unique index teams_name_idx on public.teams(league_id,lower(trim(name)));
create table public.players (
 id uuid primary key default gen_random_uuid(), league_id uuid not null references public.leagues(id) on delete cascade,
 team_id uuid, name text not null check(length(trim(name)) between 1 and 80),
 position text not null default 'Sin definir' check(length(position)<=40),
 photo_url text check(photo_url is null or photo_url ~ '^https://'),
 created_at timestamptz not null default now(), unique(id,league_id),
 foreign key(team_id,league_id) references public.teams(id,league_id)
);
create index players_team_idx on public.players(team_id,league_id);
create table public.matches (
 id uuid primary key default gen_random_uuid(), league_id uuid not null references public.leagues(id) on delete cascade,
 competition_id uuid not null, round integer not null default 1 check(round between 1 and 10000),
 home_team_id uuid, away_team_id uuid, home_label text not null default 'Equipo A' check(length(trim(home_label)) between 1 and 80),
 away_label text not null default 'Equipo B' check(length(trim(away_label)) between 1 and 80),
 starts_at timestamptz, venue text not null default '' check(length(venue)<=160),
 status text not null default 'scheduled' check(status in ('scheduled','completed')),
 home_score integer, away_score integer, created_at timestamptz not null default now(), unique(id,league_id),
 foreign key(competition_id,league_id) references public.competitions(id,league_id),
 foreign key(home_team_id,league_id) references public.teams(id,league_id),
 foreign key(away_team_id,league_id) references public.teams(id,league_id),
 check(home_team_id is null or away_team_id is null or home_team_id<>away_team_id),
 check((home_team_id is null)=(away_team_id is null)),
 check((status='scheduled' and home_score is null and away_score is null) or
       (status='completed' and home_score between 0 and 999 and away_score between 0 and 999 and home_score is not null and away_score is not null))
);
create index matches_competition_idx on public.matches(competition_id,league_id);
create index matches_home_idx on public.matches(home_team_id,league_id);
create index matches_away_idx on public.matches(away_team_id,league_id);
create table public.match_players (
 match_id uuid not null, league_id uuid not null references public.leagues(id) on delete cascade, player_id uuid not null,
 side text not null check(side in ('home','away')),
 goals integer not null default 0 check(goals between 0 and 999), assists integer not null default 0 check(assists between 0 and 999),
 yellow_cards integer not null default 0 check(yellow_cards between 0 and 2), red_cards integer not null default 0 check(red_cards between 0 and 1),
 rating numeric(3,1) check(rating between 1 and 10),
 primary key(match_id,player_id),
 foreign key(match_id,league_id) references public.matches(id,league_id) on delete cascade,
 foreign key(player_id,league_id) references public.players(id,league_id)
);
create index match_players_player_idx on public.match_players(player_id,league_id);
create table public.news (
 id uuid primary key default gen_random_uuid(), league_id uuid not null references public.leagues(id) on delete cascade,
 title text not null check(length(trim(title)) between 1 and 160), body text not null check(length(trim(body)) between 1 and 10000),
 image_url text check(image_url is null or image_url ~ '^https://'), published boolean not null default true,
 created_at timestamptz not null default now()
);

-- Definer is necessary ONLY for membership lookup (avoids recursive RLS).
-- It always checks the authenticated uid and cannot choose another user.
create function private.is_league_admin(p_league uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select (select auth.uid()) is not null and exists (
  select 1 from public.league_members where league_id=p_league and user_id=(select auth.uid())
 );
$$;
revoke all on function private.is_league_admin(uuid) from public,anon,authenticated;
grant execute on function private.is_league_admin(uuid) to anon,authenticated;
create function private.can_read_league(p_league uuid) returns boolean
language sql stable security invoker set search_path = '' as $$
 select exists(select 1 from public.leagues where id=p_league and (is_public or private.is_league_admin(id)));
$$;
revoke all on function private.can_read_league(uuid) from public,anon,authenticated;
grant execute on function private.can_read_league(uuid) to anon,authenticated;

alter table public.leagues enable row level security;
alter table public.league_members enable row level security;
revoke all on public.leagues, public.league_members from anon,authenticated;
create policy leagues_read on public.leagues for select to anon,authenticated using(is_public or private.is_league_admin(id));
create policy leagues_edit on public.leagues for update to authenticated using(private.is_league_admin(id)) with check(private.is_league_admin(id));
create policy members_self_read on public.league_members for select to authenticated using(user_id=(select auth.uid()));
grant select on public.leagues to anon,authenticated;
grant update(name,description,primary_color,secondary_color,logo_url,points_win,points_draw,points_loss) on public.leagues to authenticated;
grant select on public.league_members to authenticated;

do $$ declare t text; begin
 foreach t in array array['seasons','divisions','competitions','teams','players','matches','match_players','news'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon,authenticated',t);
  execute format('create policy scoped_read on public.%I for select to anon,authenticated using(private.can_read_league(league_id))',t);
  execute format('create policy scoped_insert on public.%I for insert to authenticated with check(private.is_league_admin(league_id))',t);
  execute format('create policy scoped_update on public.%I for update to authenticated using(private.is_league_admin(league_id)) with check(private.is_league_admin(league_id))',t);
  execute format('create policy scoped_delete on public.%I for delete to authenticated using(private.is_league_admin(league_id))',t);
  execute format('grant select on public.%I to anon,authenticated',t);
  execute format('grant insert,update,delete on public.%I to authenticated',t);
  execute format('create index %I on public.%I(league_id)',t||'_league_idx',t);
 end loop;
end $$;
-- Unpublished news is visible only to admins; replace the generic policy.
drop policy scoped_read on public.news;
create policy news_read on public.news for select to anon,authenticated using(private.can_read_league(league_id) and (published or private.is_league_admin(league_id)));

-- Bootstrap needs privilege to create the first membership. Internal implementation
-- is outside the exposed schema, has explicit uid checks and restricted EXECUTE.
create function private.create_league(p_request_id uuid,p_name text,p_slug text,p_mode text,p_purpose text,p_description text,p_expected integer,p_format text,p_primary text,p_secondary text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid := (select auth.uid()); lid uuid; sid uuid; did uuid; final_slug text;
begin
 if u is null then raise exception 'Iniciá sesión para crear una liga.' using errcode='42501'; end if;
 if p_request_id is null then raise exception 'Falta el identificador de creación.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text||p_request_id::text,0));
 select league_id into lid from private.league_creation_requests where user_id=u and request_id=p_request_id;
 if lid is not null then return (select jsonb_build_object('id',id,'slug',slug) from public.leagues where id=lid); end if;
 lid := gen_random_uuid(); final_slug := p_slug||'-'||substr(replace(lid::text,'-',''),1,8);
 insert into public.leagues(id,name,slug,mode,purpose,description,expected_participants,format,primary_color,secondary_color)
 values(lid,trim(p_name),final_slug,p_mode,p_purpose,trim(p_description),p_expected,p_format,p_primary,p_secondary);
 insert into public.league_members(league_id,user_id,role) values(lid,u,'owner');
 insert into public.seasons(league_id,name) values(lid,'Temporada 1') returning id into sid;
 insert into public.divisions(league_id,season_id,name) values(lid,sid,'Primera') returning id into did;
 insert into public.competitions(league_id,season_id,division_id,name,format) values(lid,sid,did,'Competencia principal',p_format);
 insert into private.league_creation_requests values(u,p_request_id,lid);
 return jsonb_build_object('id',lid,'slug',final_slug);
end $$;
revoke all on function private.create_league(uuid,text,text,text,text,text,integer,text,text,text) from public,anon,authenticated;
grant execute on function private.create_league(uuid,text,text,text,text,text,integer,text,text,text) to authenticated;
create function public.create_league(p_request_id uuid,p_name text,p_slug text,p_mode text,p_purpose text,p_description text,p_expected integer,p_format text,p_primary text,p_secondary text)
returns jsonb language sql security invoker set search_path='' as $$
 select private.create_league(p_request_id,p_name,p_slug,p_mode,p_purpose,p_description,p_expected,p_format,p_primary,p_secondary);
$$;
revoke all on function public.create_league(uuid,text,text,text,text,text,integer,text,text,text) from public,anon,authenticated;
grant execute on function public.create_league(uuid,text,text,text,text,text,integer,text,text,text) to authenticated;

-- The result and all player rows are replaced in one transaction. Direct writes
-- to results/statistics are revoked, so every client uses this validated path.
create function private.save_match_result(p_match_id uuid,p_home integer,p_away integer,p_players jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare m public.matches; l public.leagues; s jsonb; pid uuid; ps text; hs integer; as_ integer;
begin
 select * into m from public.matches where id=p_match_id for update;
 if m.id is null or not private.is_league_admin(m.league_id) then raise exception 'No tenés acceso a este partido.' using errcode='42501'; end if;
 select * into l from public.leagues where id=m.league_id;
 if p_home is null and p_away is null then
  delete from public.match_players where match_id=m.id;
  update public.matches set home_score=null,away_score=null,status='scheduled' where id=m.id; return;
 end if;
 if p_home is null or p_away is null or p_home not between 0 and 999 or p_away not between 0 and 999 then raise exception 'Marcador inválido.'; end if;
 if jsonb_typeof(p_players) is distinct from 'array' or jsonb_array_length(p_players)>128 then raise exception 'Participantes inválidos.'; end if;
 if exists(select 1 from jsonb_array_elements(p_players) x group by x->>'player_id' having count(*)>1) then raise exception 'Un jugador aparece dos veces.'; end if;
 for s in select * from jsonb_array_elements(p_players) loop
  pid := (s->>'player_id')::uuid; ps:=s->>'side';
  if ps is null or ps not in ('home','away') or not exists(select 1 from public.players p where p.id=pid and p.league_id=m.league_id and (l.mode='players' or exists(select 1 from public.match_players old where old.match_id=m.id and old.player_id=pid and old.side=ps) or (not exists(select 1 from public.match_players old where old.match_id=m.id and old.player_id=pid) and p.team_id=case when ps='home' then m.home_team_id else m.away_team_id end))) then raise exception 'El jugador no pertenece al equipo, al lado histórico o a la liga.'; end if;
 end loop;
 select coalesce(sum((x->>'goals')::integer) filter(where x->>'side'='home'),0),coalesce(sum((x->>'goals')::integer) filter(where x->>'side'='away'),0) into hs,as_ from jsonb_array_elements(p_players) x;
 if hs>p_home or as_>p_away then raise exception 'Los goles individuales superan el marcador.'; end if;
 select coalesce(sum((x->>'assists')::integer) filter(where x->>'side'='home'),0),coalesce(sum((x->>'assists')::integer) filter(where x->>'side'='away'),0) into hs,as_ from jsonb_array_elements(p_players) x;
 if hs>p_home or as_>p_away then raise exception 'Las asistencias superan el marcador.'; end if;
 delete from public.match_players where match_id=m.id;
 insert into public.match_players(match_id,league_id,player_id,side,goals,assists,yellow_cards,red_cards,rating)
 select m.id,m.league_id,(x->>'player_id')::uuid,x->>'side',(x->>'goals')::integer,(x->>'assists')::integer,(x->>'yellow_cards')::integer,(x->>'red_cards')::integer,(x->>'rating')::numeric
 from jsonb_array_elements(p_players) x;
 update public.matches set home_score=p_home,away_score=p_away,status='completed' where id=m.id;
end $$;
revoke all on function private.save_match_result(uuid,integer,integer,jsonb) from public,anon,authenticated;
grant execute on function private.save_match_result(uuid,integer,integer,jsonb) to authenticated;
create function public.save_match_result(p_match_id uuid,p_home integer,p_away integer,p_players jsonb) returns void language sql security invoker set search_path='' as $$ select private.save_match_result(p_match_id,p_home,p_away,p_players); $$;
revoke all on function public.save_match_result(uuid,integer,integer,jsonb) from public,anon,authenticated;
grant execute on function public.save_match_result(uuid,integer,integer,jsonb) to authenticated;
revoke insert,update,delete on public.match_players from authenticated;
revoke insert,update on public.matches from authenticated;
grant insert(id,league_id,competition_id,round,home_team_id,away_team_id,home_label,away_label,starts_at,venue) on public.matches to authenticated;
grant update(round,starts_at,venue,home_label,away_label) on public.matches to authenticated;

create function public.generate_league_fixture(p_league_id uuid) returns integer
language plpgsql security invoker set search_path='' as $$
declare ids uuid[]; n integer; r integer; i integer; a uuid; b uuid; last_id uuid; c public.competitions; total integer:=0;
begin
 if not private.is_league_admin(p_league_id) then raise exception 'No tenés permisos.' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_league_id::text,0));
 select * into c from public.competitions where league_id=p_league_id order by created_at limit 1;
 if c.id is null or c.format='friendly' then raise exception 'Esta liga usa partidos libres.'; end if;
 if exists(select 1 from public.matches where league_id=p_league_id) then raise exception 'Ya hay partidos. El fixture no se genera dos veces.'; end if;
 select array_agg(id order by created_at,id) into ids from public.teams where league_id=p_league_id;
 n:=coalesce(array_length(ids,1),0);
 if n<2 or n>128 then raise exception 'Cargá entre 2 y 128 equipos.'; end if;
 if n%2=1 then ids:=array_append(ids,null); n:=n+1; end if;
 for r in 1..n-1 loop
  for i in 1..n/2 loop
   a:=ids[i]; b:=ids[n+1-i];
   if a is not null and b is not null then
    insert into public.matches(league_id,competition_id,round,home_team_id,away_team_id) values(p_league_id,c.id,r,case when r%2=1 then a else b end,case when r%2=1 then b else a end); total:=total+1;
    if c.format='double_round_robin' then insert into public.matches(league_id,competition_id,round,home_team_id,away_team_id) values(p_league_id,c.id,r+n-1,case when r%2=1 then b else a end,case when r%2=1 then a else b end); total:=total+1; end if;
   end if;
  end loop;
  last_id:=ids[n]; ids:=array[ids[1],last_id]||ids[2:n-1];
 end loop;
 return total;
end $$;
revoke all on function public.generate_league_fixture(uuid) from public,anon,authenticated;
grant execute on function public.generate_league_fixture(uuid) to authenticated;

create function private.create_friendly_match(p_league_id uuid,p_home_label text,p_away_label text,p_home_players uuid[],p_away_players uuid[],p_starts_at timestamptz,p_venue text,p_round integer)
returns uuid language plpgsql security definer set search_path='' as $$
declare mid uuid; cid uuid; all_players uuid[];
begin
 if not private.is_league_admin(p_league_id) or not exists(select 1 from public.leagues where id=p_league_id and mode='players') then raise exception 'No tenés acceso a un grupo de jugadores.' using errcode='42501'; end if;
 if coalesce(array_length(p_home_players,1),0)<1 or coalesce(array_length(p_away_players,1),0)<1 then raise exception 'Cada equipo necesita al menos un jugador.'; end if;
 all_players:=p_home_players||p_away_players;
 if array_length(all_players,1)>128 or (select count(distinct x) from unnest(all_players) x)<>array_length(all_players,1) then raise exception 'Los participantes no pueden repetirse.'; end if;
 if (select count(*) from public.players where league_id=p_league_id and id=any(all_players))<>array_length(all_players,1) then raise exception 'Los jugadores deben pertenecer a la liga.'; end if;
 select id into cid from public.competitions where league_id=p_league_id order by created_at limit 1;
 insert into public.matches(league_id,competition_id,round,home_label,away_label,starts_at,venue)
 values(p_league_id,cid,p_round,trim(p_home_label),trim(p_away_label),p_starts_at,trim(p_venue)) returning id into mid;
 insert into public.match_players(match_id,league_id,player_id,side) select mid,p_league_id,x,'home' from unnest(p_home_players) x;
 insert into public.match_players(match_id,league_id,player_id,side) select mid,p_league_id,x,'away' from unnest(p_away_players) x;
 return mid;
end $$;
revoke all on function private.create_friendly_match(uuid,text,text,uuid[],uuid[],timestamptz,text,integer) from public,anon,authenticated;
grant execute on function private.create_friendly_match(uuid,text,text,uuid[],uuid[],timestamptz,text,integer) to authenticated;
create function public.create_friendly_match(p_league_id uuid,p_home_label text,p_away_label text,p_home_players uuid[],p_away_players uuid[],p_starts_at timestamptz,p_venue text,p_round integer)
returns uuid language sql security invoker set search_path='' as $$ select private.create_friendly_match(p_league_id,p_home_label,p_away_label,p_home_players,p_away_players,p_starts_at,p_venue,p_round); $$;
revoke all on function public.create_friendly_match(uuid,text,text,uuid[],uuid[],timestamptz,text,integer) from public,anon,authenticated;
grant execute on function public.create_friendly_match(uuid,text,text,uuid[],uuid[],timestamptz,text,integer) to authenticated;

create function private.add_league_admin(p_league_id uuid,p_email text) returns void
language plpgsql security definer set search_path='' as $$
declare target uuid;
begin
 if (select auth.uid()) is null or not exists(select 1 from public.league_members where league_id=p_league_id and user_id=(select auth.uid()) and role='owner') then raise exception 'Solo el creador puede agregar administradores.' using errcode='42501'; end if;
 select id into target from auth.users where lower(email)=lower(trim(p_email)) and email_confirmed_at is not null;
 if target is null then raise exception 'Esa persona debe crear y confirmar su cuenta primero.'; end if;
 insert into public.league_members(league_id,user_id,role) values(p_league_id,target,'admin') on conflict(league_id,user_id) do nothing;
end $$;
revoke all on function private.add_league_admin(uuid,text) from public,anon,authenticated;
grant execute on function private.add_league_admin(uuid,text) to authenticated;
create function public.add_league_admin(p_league_id uuid,p_email text) returns void language sql security invoker set search_path='' as $$ select private.add_league_admin(p_league_id,p_email); $$;
revoke all on function public.add_league_admin(uuid,text) from public,anon,authenticated;
grant execute on function public.add_league_admin(uuid,text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('league-images','league-images',true,2097152,array['image/jpeg','image/png','image/webp']);
create policy league_image_insert on storage.objects for insert to authenticated with check(bucket_id='league-images' and private.is_league_admin(((storage.foldername(name))[1])::uuid));
create policy league_image_select on storage.objects for select to authenticated using(bucket_id='league-images' and private.is_league_admin(((storage.foldername(name))[1])::uuid));
-- Images use unique names, avoiding overwrite races; deletion/cleanup is a later explicit operation.
notify pgrst,'reload schema';
commit;
