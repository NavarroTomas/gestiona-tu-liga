-- Execute in SQL Editor after platform-v1.sql. All fixture data is rolled back.
begin;
insert into auth.users(id,email,aud,role,email_confirmed_at)
values('11111111-1111-4111-8111-111111111111','gtl-fixture-a@invalid.test','authenticated','authenticated',now()),
('22222222-2222-4222-8222-222222222222','gtl-fixture-b@invalid.test','authenticated','authenticated',now());
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',true);
do $$ declare a jsonb; b jsonb; ta uuid; tb uuid; tc uuid; pa uuid; mid uuid; cid uuid; amount integer; denied boolean;
begin
 a:=public.create_league('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Fixture A','fixture-a','teams','amateur','Prueba transaccional',4,'round_robin','#216348','#dbe99d');
 b:=public.create_league('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Fixture A','fixture-a','teams','amateur','Prueba transaccional',4,'round_robin','#216348','#dbe99d');
 if a->>'id'<>b->>'id' then raise exception 'FAIL idempotency'; end if;
 perform set_config('gtl.test_league',a->>'id',true);
 insert into public.teams(league_id,name) values((a->>'id')::uuid,'Equipo A') returning id into ta;
 insert into public.teams(league_id,name) values((a->>'id')::uuid,'Equipo B') returning id into tb;
 insert into public.teams(league_id,name) values((a->>'id')::uuid,'Equipo C') returning id into tc;
 insert into public.players(league_id,name,team_id) values((a->>'id')::uuid,'Jugador A',ta) returning id into pa;
 amount:=public.generate_league_fixture((a->>'id')::uuid);
 if amount<>3 then raise exception 'FAIL odd-team fixture'; end if;
 select id into mid from public.matches where league_id=(a->>'id')::uuid and home_team_id=ta;
 if mid is null then select id into mid from public.matches where league_id=(a->>'id')::uuid and away_team_id=ta; end if;
 -- Set the participant side from the generated fixture, not an assumed home slot.
 perform public.save_match_result(mid,2,1,jsonb_build_array(jsonb_build_object('player_id',pa,'side',(select case when home_team_id=ta then 'home' else 'away' end from public.matches where id=mid),'goals',1,'assists',0,'yellow_cards',1,'red_cards',0,'rating',8)));
 perform public.save_match_result(mid,0,0,'[]'::jsonb);
 if exists(select 1 from public.match_players where match_id=mid) then raise exception 'FAIL result replacement'; end if;
 denied:=false; begin update public.matches set home_score=100 where id=mid; exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'FAIL direct score writes'; end if;
 denied:=false; begin insert into public.league_members values((a->>'id')::uuid,'22222222-2222-4222-8222-222222222222','owner',now()); exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'FAIL self membership'; end if;
end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select set_config('request.jwt.claims','{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}',true);
do $$ declare other jsonb; denied boolean; changed integer; foreign_team uuid;
begin
 other:=public.create_league('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Fixture B','fixture-b','teams','amateur','Prueba transaccional',2,'round_robin','#234f8c','#dce8f8');
 denied:=false; begin insert into public.teams(league_id,name) values(current_setting('gtl.test_league')::uuid,'Intruso'); exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'FAIL cross-league insert'; end if;
 update public.leagues set name='Intrusión' where id=current_setting('gtl.test_league')::uuid; get diagnostics changed=row_count;
 if changed<>0 then raise exception 'FAIL cross-league update'; end if;
 if exists(select 1 from public.league_members where league_id=current_setting('gtl.test_league')::uuid) then raise exception 'FAIL membership privacy'; end if;
 select id into foreign_team from public.teams where league_id=current_setting('gtl.test_league')::uuid limit 1;
 denied:=false; begin insert into public.players(league_id,name,team_id) values((other->>'id')::uuid,'Relación cruzada',foreign_team); exception when foreign_key_violation then denied:=true; end;
 if not denied then raise exception 'FAIL cross-league relation'; end if;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$ declare denied boolean;
begin
 if not exists(select 1 from public.leagues where id=current_setting('gtl.test_league')::uuid) then raise exception 'FAIL public read'; end if;
 denied:=false; begin perform public.create_league(gen_random_uuid(),'Intruso','intruso','teams','amateur','',2,'round_robin','#216348','#dbe99d'); exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'FAIL anonymous creation'; end if;
 denied:=false; begin perform 1 from public.league_members; exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'FAIL anonymous membership read'; end if;
end $$;
rollback;
select 'PASS: idempotency, fixture, result replacement, score permissions, membership privacy, tenant isolation, composite references, public read and anonymous denial. Fixture data rolled back.' as result;
