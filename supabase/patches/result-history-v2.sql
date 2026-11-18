-- Incremental patch; same signature, owner and grants.
begin;
create or replace function private.save_match_result(p_match_id uuid,p_home integer,p_away integer,p_players jsonb)
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
notify pgrst,'reload schema';
commit;
