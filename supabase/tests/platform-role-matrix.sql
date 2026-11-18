-- Execute in SQL Editor as project administrator. Simulates JWT subjects A/B/C.
-- Every test mutation, including temporary auth users, is rolled back.
-- These are database RLS tests, not a second end-to-end Auth login.
begin;
set local statement_timeout='30s';
create temp table qa_checks(id text primary key, description text not null, status text not null default 'passed');
grant select,insert on qa_checks to anon,authenticated;
create function pg_temp.assert_true(id text,description text,condition boolean) returns void language plpgsql as $$
begin
 if condition is distinct from true then raise exception 'FAIL %: %',id,description; end if;
 insert into qa_checks values(id,description,'passed');
end $$;
create function pg_temp.denied(id text,description text,query text,expected_state text default '42501') returns void language plpgsql as $$
declare rejected boolean:=false; actual text;
begin
 begin execute query; exception when others then
  get stacked diagnostics actual=returned_sqlstate;
  if actual<>expected_state then raise exception 'FAIL %: expected SQLSTATE %, got %',id,expected_state,actual; end if;
  rejected:=true;
 end;
 perform pg_temp.assert_true(id,description,rejected);
end $$;
create function pg_temp.no_rows(id text,description text,query text) returns void language plpgsql as $$
declare affected integer;
begin
 execute query; get diagnostics affected=row_count;
 perform pg_temp.assert_true(id,description,affected=0);
end $$;

select set_config('qa.user_a',gen_random_uuid()::text,true),set_config('qa.user_b',gen_random_uuid()::text,true),set_config('qa.user_c',gen_random_uuid()::text,true);
insert into auth.users(id,email,aud,role,email_confirmed_at) values
 (current_setting('qa.user_a')::uuid,'qa-deep-owner-a@invalid.test','authenticated','authenticated',now()),
 (current_setting('qa.user_b')::uuid,'qa-deep-owner-b@invalid.test','authenticated','authenticated',now()),
 (current_setting('qa.user_c')::uuid,'qa-deep-admin@invalid.test','authenticated','authenticated',now());

-- Catalog checks run as database administrator; tested actions below run as app roles.
do $$ declare t text; begin
 foreach t in array array['leagues','league_members','seasons','divisions','competitions','teams','players','matches','match_players','news'] loop
  perform pg_temp.assert_true('RLS-'||t,'RLS enabled on '||t,(select relrowsecurity from pg_class where oid=('public.'||t)::regclass));
 end loop;
 perform pg_temp.assert_true('PRIVATE-RLS','Private request table has RLS',(select relrowsecurity from pg_class where oid='private.league_creation_requests'::regclass));
 perform pg_temp.assert_true('PRIVATE-ACL','App role cannot read private request table',not has_table_privilege('authenticated','private.league_creation_requests','SELECT'));
 perform pg_temp.assert_true('FUNCTION-SEARCH-PATH','All private security-definer functions pin search_path',not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='private' and p.prosecdef and not coalesce(p.proconfig @> array['search_path=""'],false)));
end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('qa.user_a'),true),set_config('request.jwt.claims',json_build_object('sub',current_setting('qa.user_a'),'role','authenticated')::text,true);
do $$ declare l jsonb; t1 uuid; t2 uuid; p uuid; m uuid; c uuid; n uuid; begin
 l:=public.create_league(gen_random_uuid(),'QA roles A','qa-roles-a','teams','amateur','Prueba con rollback',2,'round_robin','#216348','#dbe99d');
 perform set_config('qa.league_a',l->>'id',true);
 insert into public.teams(league_id,name) values((l->>'id')::uuid,'Equipo A1') returning id into t1;
 insert into public.teams(league_id,name) values((l->>'id')::uuid,'Equipo A2') returning id into t2;
 insert into public.players(league_id,team_id,name) values((l->>'id')::uuid,t1,'Jugador A') returning id into p;
 select id into c from public.competitions where league_id=(l->>'id')::uuid;
 insert into public.matches(league_id,competition_id,home_team_id,away_team_id) values((l->>'id')::uuid,c,t1,t2) returning id into m;
 insert into public.news(league_id,title,body,published) values((l->>'id')::uuid,'Borrador A','Contenido privado de organizadores',false) returning id into n;
 perform set_config('qa.team_a',t1::text,true); perform set_config('qa.player_a',p::text,true); perform set_config('qa.match_a',m::text,true); perform set_config('qa.news_a',n::text,true); perform set_config('qa.competition_a',c::text,true);
 perform public.save_match_result(m,1,0,jsonb_build_array(jsonb_build_object('player_id',p,'side','home','goals',1,'assists',0,'yellow_cards',0,'red_cards',0,'rating',8)));
 perform public.add_league_admin((l->>'id')::uuid,'qa-deep-admin@invalid.test');
 perform public.add_league_admin((l->>'id')::uuid,'qa-deep-admin@invalid.test');
 perform pg_temp.assert_true('OWNER-SELF','Owner reads only their membership',(select count(*)=1 from public.league_members where league_id=(l->>'id')::uuid));
 perform pg_temp.assert_true('OWNER-NEWS','Owner reads own unpublished draft',exists(select 1 from public.news where id=n));
 perform pg_temp.denied('OWNER-NO-ROLE-WRITE','Owner cannot bypass membership RPC',format('insert into public.league_members(league_id,user_id,role) values(%L,%L,''owner'')',l->>'id',current_setting('qa.user_b')));
 perform pg_temp.denied('OWNER-NO-PRIVATE','Owner cannot read private creation requests','select * from private.league_creation_requests');
end $$;

-- B owns another league and has no membership in A.
select set_config('request.jwt.claim.sub',current_setting('qa.user_b'),true),set_config('request.jwt.claims',json_build_object('sub',current_setting('qa.user_b'),'role','authenticated','user_metadata',json_build_object('role','owner','league_id',current_setting('qa.league_a')))::text,true);
do $$ declare l jsonb; t uuid; p uuid; c uuid; m uuid; target uuid:=current_setting('qa.league_a')::uuid; begin
 l:=public.create_league(gen_random_uuid(),'QA roles B','qa-roles-b','teams','amateur','Prueba con rollback',2,'round_robin','#234f8c','#dce8f8');
 perform set_config('qa.league_b',l->>'id',true);
 insert into public.teams(league_id,name) values((l->>'id')::uuid,'Equipo B1') returning id into t;
 insert into public.players(league_id,team_id,name) values((l->>'id')::uuid,t,'Jugador B') returning id into p;
 select id into c from public.competitions where league_id=(l->>'id')::uuid;
 perform set_config('qa.team_b',t::text,true); perform set_config('qa.player_b',p::text,true); perform set_config('qa.competition_b',c::text,true);
 perform pg_temp.assert_true('OTHER-PUBLIC','Other organizer can read public sporting data',exists(select 1 from public.teams where id=current_setting('qa.team_a')::uuid));
 perform pg_temp.assert_true('OTHER-NO-MEMBER','Other organizer cannot read A memberships',not exists(select 1 from public.league_members where league_id=target));
 perform pg_temp.assert_true('OTHER-NO-DRAFT','Other organizer cannot read A draft by UUID',not exists(select 1 from public.news where id=current_setting('qa.news_a')::uuid));
 perform pg_temp.assert_true('OTHER-METADATA','Forged user_metadata never grants administration',not private.is_league_admin(target));
end $$;

do $$ declare t text; payload jsonb; target uuid:=current_setting('qa.league_a')::uuid; begin
 foreach t in array array['seasons','divisions','competitions','teams','players','matches','news'] loop
  payload:=case t
   when 'seasons' then jsonb_build_object('name','Intruso')
   when 'divisions' then jsonb_build_object('name','Intruso','season_id',(select season_id from public.competitions where league_id=target limit 1))
   when 'competitions' then jsonb_build_object('name','Intruso','season_id',(select season_id from public.competitions where league_id=target limit 1),'division_id',(select division_id from public.competitions where league_id=target limit 1),'format','friendly')
   when 'teams' then jsonb_build_object('name','Intruso')
   when 'players' then jsonb_build_object('name','Intruso')
   when 'matches' then jsonb_build_object('competition_id',current_setting('qa.competition_a'),'home_team_id',current_setting('qa.team_a'),'away_team_id',(select away_team_id from public.matches where id=current_setting('qa.match_a')::uuid))
   else jsonb_build_object('title','Intruso','body','Intruso') end;
  -- json_populate_record supplies all required fields, then INSERT uses explicitly selected writable columns.
  if t='matches' then
   perform pg_temp.denied('OTHER-INSERT-'||t,'Other organizer cannot insert '||t,format('insert into public.matches(league_id,competition_id,home_team_id,away_team_id) values(%L,%L,%L,%L)',target,payload->>'competition_id',payload->>'home_team_id',payload->>'away_team_id'));
  elsif t='divisions' then
   perform pg_temp.denied('OTHER-INSERT-'||t,'Other organizer cannot insert '||t,format('insert into public.divisions(league_id,season_id,name) values(%L,%L,''Intruso'')',target,payload->>'season_id'));
  elsif t='competitions' then
   perform pg_temp.denied('OTHER-INSERT-'||t,'Other organizer cannot insert '||t,format('insert into public.competitions(league_id,season_id,division_id,name,format) values(%L,%L,%L,''Intruso'',''friendly'')',target,payload->>'season_id',payload->>'division_id'));
  elsif t='news' then
   perform pg_temp.denied('OTHER-INSERT-'||t,'Other organizer cannot insert '||t,format('insert into public.news(league_id,title,body) values(%L,''Intruso'',''Intruso'')',target));
  else
   perform pg_temp.denied('OTHER-INSERT-'||t,'Other organizer cannot insert '||t,format('insert into public.%I(league_id,name) values(%L,''Intruso'')',t,target));
  end if;
  perform pg_temp.no_rows('OTHER-UPDATE-'||t,'Other organizer cannot update '||t,format('update public.%I set %I=%L where league_id=%L',t,case when t='news' then 'title' when t='matches' then 'venue' else 'name' end,'Intruso',target));
  perform pg_temp.no_rows('OTHER-DELETE-'||t,'Other organizer cannot delete '||t,format('delete from public.%I where league_id=%L',t,target));
 end loop;
 perform pg_temp.no_rows('OTHER-UPDATE-leagues','Other organizer cannot rename A',format('update public.leagues set name=''Intruso'' where id=%L',target));
 perform pg_temp.denied('OTHER-RESULT','Other organizer cannot save A result',format('select public.save_match_result(%L,99,0,''[]''::jsonb)',current_setting('qa.match_a')));
 perform pg_temp.denied('OTHER-ANNUL','Other organizer cannot annul A result',format('select public.save_match_result(%L,null,null,''[]''::jsonb)',current_setting('qa.match_a')));
 perform pg_temp.denied('OTHER-FIXTURE','Other organizer cannot generate A fixture',format('select public.generate_league_fixture(%L)',target));
 perform pg_temp.denied('OTHER-FRIENDLY','Other organizer cannot create a friendly match in A',format('select public.create_friendly_match(%L,''A'',''B'',array[%L]::uuid[],array[%L]::uuid[],null,'''',1)',target,current_setting('qa.player_a'),current_setting('qa.player_b')));
 perform pg_temp.denied('OTHER-ADMIN','Other organizer cannot grant A membership',format('select public.add_league_admin(%L,''qa-deep-owner-b@invalid.test'')',target));
 perform pg_temp.denied('OTHER-PLAYER-FK','B cannot attach own player to A team',format('update public.players set team_id=%L where id=%L',current_setting('qa.team_a'),current_setting('qa.player_b')),'23503');
 perform pg_temp.denied('OTHER-MOVE-OUT','B cannot move own player into A league',format('update public.players set league_id=%L,team_id=null where id=%L',target,current_setting('qa.player_b')));
 perform pg_temp.no_rows('OTHER-MOVE-IN','B cannot move A player into own league',format('update public.players set league_id=%L,team_id=null where id=%L',current_setting('qa.league_b'),current_setting('qa.player_a')));
 perform pg_temp.denied('OTHER-STATS-INSERT','B cannot directly insert A stats',format('insert into public.match_players(match_id,league_id,player_id,side) values(%L,%L,%L,''home'')',current_setting('qa.match_a'),target,current_setting('qa.player_a')));
 perform pg_temp.denied('OTHER-STATS-UPDATE','B cannot directly change A stats',format('update public.match_players set goals=99 where league_id=%L',target));
 perform pg_temp.denied('OTHER-STATS-DELETE','B cannot directly delete A stats',format('delete from public.match_players where league_id=%L',target));
 perform pg_temp.denied('OTHER-STORAGE','B cannot upload into A image folder',format('insert into storage.objects(bucket_id,name) values(''league-images'',%L)',target||'/qa-cross.png'));
end $$;

-- C is delegated administrator in A, but has no access to B.
select set_config('request.jwt.claim.sub',current_setting('qa.user_c'),true),set_config('request.jwt.claims',json_build_object('sub',current_setting('qa.user_c'),'role','authenticated')::text,true);
do $$ declare v_team uuid; target uuid:=current_setting('qa.league_a')::uuid; begin
 perform pg_temp.assert_true('ADMIN-MEMBER','Delegated administrator has exactly one own membership',(select count(*)=1 from public.league_members where league_id=target and role='admin'));
 perform pg_temp.assert_true('ADMIN-DRAFT','Delegated administrator can read own league draft',exists(select 1 from public.news where id=current_setting('qa.news_a')::uuid));
 insert into public.teams(league_id,name) values(target,'Equipo creado por admin') returning id into v_team;
 update public.teams set name='Equipo editado por admin' where teams.id=v_team;
 perform pg_temp.assert_true('ADMIN-CRUD','Delegated administrator can create and edit a team',exists(select 1 from public.teams where teams.id=v_team and name='Equipo editado por admin'));
 delete from public.teams where teams.id=v_team;
 perform pg_temp.assert_true('ADMIN-DELETE','Delegated administrator can delete own disposable team',not exists(select 1 from public.teams where teams.id=v_team));
 perform public.save_match_result(current_setting('qa.match_a')::uuid,0,0,'[]'::jsonb);
 perform pg_temp.assert_true('ADMIN-RESULT','Delegated administrator can correct result',exists(select 1 from public.matches where id=current_setting('qa.match_a')::uuid and home_score=0 and away_score=0));
 perform pg_temp.denied('ADMIN-NO-DELEGATE','Admin cannot add another administrator',format('select public.add_league_admin(%L,''qa-deep-owner-b@invalid.test'')',target));
 perform pg_temp.no_rows('ADMIN-NO-OTHER','Admin of A cannot edit B',format('update public.teams set name=''Intruso'' where league_id=%L',current_setting('qa.league_b')));
 perform pg_temp.denied('ADMIN-NO-PROMOTION','Admin cannot promote self','update public.league_members set role=''owner''');
 perform pg_temp.assert_true('ADMIN-B-NO-MEMBER','Admin cannot read B membership',not exists(select 1 from public.league_members where league_id=current_setting('qa.league_b')::uuid));
end $$;

set local role anon;
select set_config('request.jwt.claim.sub','',true),set_config('request.jwt.claims','{"role":"anon"}',true);
do $$ declare t text; target uuid:=current_setting('qa.league_a')::uuid; begin
 perform pg_temp.assert_true('ANON-PUBLIC','Visitor reads public league',exists(select 1 from public.leagues where id=target));
 perform pg_temp.assert_true('ANON-NO-DRAFT','Visitor cannot read unpublished draft',not exists(select 1 from public.news where id=current_setting('qa.news_a')::uuid));
 perform pg_temp.assert_true('ANON-NO-ADMIN','Visitor is never administrator',not private.is_league_admin(target));
 perform pg_temp.denied('ANON-MEMBERS','Visitor cannot read memberships','select * from public.league_members');
 perform pg_temp.denied('ANON-PRIVATE','Visitor cannot read private request table','select * from private.league_creation_requests');
 perform pg_temp.denied('ANON-CREATE','Visitor cannot bootstrap league','select public.create_league(gen_random_uuid(),''Intruso'',''intruso'',''teams'',''amateur'','''',2,''round_robin'',''#216348'',''#dbe99d'')');
 perform pg_temp.denied('ANON-RESULT','Visitor cannot save result',format('select public.save_match_result(%L,99,0,''[]''::jsonb)',current_setting('qa.match_a')));
 perform pg_temp.denied('ANON-FIXTURE','Visitor cannot generate fixture',format('select public.generate_league_fixture(%L)',target));
 perform pg_temp.denied('ANON-ADMIN-RPC','Visitor cannot grant administrators',format('select public.add_league_admin(%L,''qa-deep-admin@invalid.test'')',target));
 perform pg_temp.denied('ANON-FRIENDLY','Visitor cannot call friendly-match RPC',format('select public.create_friendly_match(%L,''A'',''B'',array[%L]::uuid[],array[%L]::uuid[],null,'''',1)',target,current_setting('qa.player_a'),current_setting('qa.player_b')));
 foreach t in array array['leagues','seasons','divisions','competitions','teams','players','matches','match_players','news'] loop
  perform pg_temp.denied('ANON-DELETE-'||t,'Visitor cannot delete '||t,format('delete from public.%I where %I=%L',t,case when t='leagues' then 'id' else 'league_id' end,target));
 end loop;
 perform pg_temp.denied('ANON-STORAGE','Visitor cannot upload image',format('insert into storage.objects(bucket_id,name) values(''league-images'',%L)',target||'/qa-anon.png'));
end $$;
reset role;
select count(*) as checks_passed,jsonb_agg(jsonb_build_object('id',id,'description',description,'status',status) order by id) as checks,
 'PASS — owner / other organizer / delegated admin / visitor. All fixtures rolled back. JWT subjects simulated inside SQL; Auth login tested separately.' as result from qa_checks;
rollback;
