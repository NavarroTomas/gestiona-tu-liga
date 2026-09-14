create table if not exists public.match_revisions (
  id uuid primary key default gen_random_uuid(),
  partido_row_id bigint not null references public.partidos(id) on delete cascade,
  partido_id text,
  revision_number integer not null,
  source text not null check (source in ('txt','manual','correction','annulment')),
  reason text,
  snapshot_before jsonb not null default '{}'::jsonb,
  snapshot_after jsonb not null default '{}'::jsonb,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  unique (partido_row_id, revision_number)
);

create index if not exists match_revisions_partido_row_id_idx
  on public.match_revisions(partido_row_id, revision_number desc);

alter table public.match_revisions enable row level security;

drop policy if exists "staff can read match revisions" on public.match_revisions;
create policy "staff can read match revisions"
on public.match_revisions for select
to authenticated
using (
  (select public.has_permission('matches.upload_txt'))
  or (select public.has_permission('matches.upload_manual'))
  or (select public.has_permission('matches.edit'))
);

drop policy if exists "staff can insert match revisions" on public.match_revisions;
create policy "staff can insert match revisions"
on public.match_revisions for insert
to authenticated
with check (
  (select public.has_permission('matches.upload_txt'))
  or (select public.has_permission('matches.upload_manual'))
  or (select public.has_permission('matches.edit'))
);

grant select, insert on public.match_revisions to authenticated;

drop policy if exists matches_manage_update_partidos on public.partidos;
create policy matches_manage_update_partidos
on public.partidos for update
to authenticated
using (
  public.has_permission('matches.edit')
  or public.has_permission('matches.upload_manual')
  or public.has_permission('matches.upload_txt')
  or public.has_permission('fixtures.manage')
)
with check (
  public.has_permission('matches.edit')
  or public.has_permission('matches.upload_manual')
  or public.has_permission('matches.upload_txt')
  or public.has_permission('fixtures.manage')
);

drop policy if exists transfers_manage_delete_jugadores on public.jugadores;
create policy transfers_manage_delete_jugadores
on public.jugadores for delete
to authenticated
using (
  public.has_permission('transfers.manage')
  or public.has_permission('matches.upload_txt')
  or public.has_permission('matches.upload_manual')
  or public.has_permission('matches.edit')
);

drop policy if exists transfers_manage_insert_jugadores on public.jugadores;
create policy transfers_manage_insert_jugadores
on public.jugadores for insert
to authenticated
with check (
  public.has_permission('transfers.manage')
  or public.has_permission('matches.upload_txt')
  or public.has_permission('matches.upload_manual')
  or public.has_permission('matches.edit')
);

drop policy if exists transfers_manage_update_jugadores on public.jugadores;
create policy transfers_manage_update_jugadores
on public.jugadores for update
to authenticated
using (
  public.has_permission('transfers.manage')
  or public.has_permission('matches.upload_txt')
  or public.has_permission('matches.upload_manual')
  or public.has_permission('matches.edit')
)
with check (
  public.has_permission('transfers.manage')
  or public.has_permission('matches.upload_txt')
  or public.has_permission('matches.upload_manual')
  or public.has_permission('matches.edit')
);

drop policy if exists "staff can delete match txt segments" on public.partido_txt_segmentos;
create policy "staff can delete match txt segments"
on public.partido_txt_segmentos for delete
to authenticated
using (
  (select public.has_permission('matches.upload_txt'))
  or (select public.has_permission('matches.edit'))
  or (select public.has_permission('delete.content'))
);

create or replace function public.commit_match_data(
  p_match_row_id bigint,
  p_source text,
  p_reason text,
  p_match_patch jsonb,
  p_team_stats jsonb default '[]'::jsonb,
  p_player_stats jsonb default '[]'::jsonb,
  p_segments jsonb default null,
  p_clear_segments boolean default false
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_match public.partidos%rowtype;
  v_before jsonb;
  v_after jsonb;
  v_old_partido_id text;
  v_new_partido_id text;
  v_revision integer;
  v_temporada text;
  v_division text;
  v_allowed boolean := false;
begin
  if p_source not in ('txt','manual','correction','annulment') then
    raise exception 'Fuente de carga inválida';
  end if;

  if p_source = 'txt' then
    v_allowed := public.has_permission('matches.upload_txt') or public.has_permission('matches.edit');
  elsif p_source = 'manual' then
    v_allowed := public.has_permission('matches.upload_manual') or public.has_permission('matches.edit');
  elsif p_source = 'correction' then
    v_allowed := public.has_permission('matches.edit');
  else
    v_allowed := public.has_permission('matches.edit')
      or public.has_permission('matches.upload_txt')
      or public.has_permission('matches.upload_manual');
  end if;

  if not coalesce(v_allowed, false) then
    raise exception 'No tenés permiso para esta operación';
  end if;

  select * into v_match
  from public.partidos
  where id = p_match_row_id
  for update;

  if not found then
    raise exception 'Partido no encontrado';
  end if;

  v_old_partido_id := v_match.partido_id;
  v_new_partido_id := case
    when p_match_patch ? 'partido_id' then nullif(p_match_patch->>'partido_id', '')
    else v_match.partido_id
  end;

  v_before := jsonb_build_object(
    'partido', to_jsonb(v_match),
    'team_stats', coalesce((
      select jsonb_agg(to_jsonb(e) order by e.id)
      from public.estadisticas_equipos e
      where e.partido_id in (v_old_partido_id, v_new_partido_id)
    ), '[]'::jsonb),
    'player_stats', coalesce((
      select jsonb_agg(to_jsonb(j) order by j.id)
      from public.estadisticas_jugadores j
      where j.partido_id in (v_old_partido_id, v_new_partido_id)
    ), '[]'::jsonb),
    'segments', coalesce((
      select jsonb_agg(to_jsonb(s) order by s.created_at)
      from public.partido_txt_segmentos s
      where s.partido_id in (v_old_partido_id, v_new_partido_id)
    ), '[]'::jsonb)
  );

  update public.partidos p set
    local = case when p_match_patch ? 'local' then p_match_patch->>'local' else p.local end,
    visitante = case when p_match_patch ? 'visitante' then nullif(p_match_patch->>'visitante','') else p.visitante end,
    resultado = case when p_match_patch ? 'resultado' then nullif(p_match_patch->>'resultado','') else p.resultado end,
    fecha = case when p_match_patch ? 'fecha' then nullif(p_match_patch->>'fecha','') else p.fecha end,
    temporada = case when p_match_patch ? 'temporada' then nullif(p_match_patch->>'temporada','') else p.temporada end,
    division = case when p_match_patch ? 'division' then nullif(p_match_patch->>'division','') else p.division end,
    dia = case when p_match_patch ? 'dia' then nullif(p_match_patch->>'dia','') else p.dia end,
    hora = case when p_match_patch ? 'hora' then nullif(p_match_patch->>'hora','') else p.hora end,
    partido_id = case when p_match_patch ? 'partido_id' then nullif(p_match_patch->>'partido_id','') else p.partido_id end,
    competicion = case when p_match_patch ? 'competicion' then coalesce(nullif(p_match_patch->>'competicion',''), p.competicion) else p.competicion end,
    grupo = case when p_match_patch ? 'grupo' then nullif(p_match_patch->>'grupo','') else p.grupo end,
    fase = case when p_match_patch ? 'fase' then nullif(p_match_patch->>'fase','') else p.fase end,
    ronda = case when p_match_patch ? 'ronda' then nullif(p_match_patch->>'ronda','') else p.ronda end,
    estado = case when p_match_patch ? 'estado' then nullif(p_match_patch->>'estado','') else p.estado end
  where p.id = p_match_row_id
  returning * into v_match;

  v_new_partido_id := v_match.partido_id;
  v_temporada := v_match.temporada;
  v_division := v_match.division;

  delete from public.estadisticas_equipos
  where partido_id in (v_old_partido_id, v_new_partido_id);

  delete from public.estadisticas_jugadores
  where partido_id in (v_old_partido_id, v_new_partido_id);

  if jsonb_typeof(coalesce(p_team_stats, '[]'::jsonb)) = 'array' and jsonb_array_length(coalesce(p_team_stats, '[]'::jsonb)) > 0 then
    insert into public.estadisticas_equipos (
      partido_id,equipo,temporada,division,fecha,passes,"keyPasses",assists,shots,"shotsOnTarget",goals,tackles,"keyTackles",interceptions,"keyInterceptions",possession,"possessionsLost",fouls,offsides,handballs,"setPieceTimeouts","freeKicks",penalties,"goalKicks","cornerKicks","throwIns","yellowCards","redCards"
    )
    select
      partido_id,equipo,temporada,division,fecha,passes,"keyPasses",assists,shots,"shotsOnTarget",goals,tackles,"keyTackles",interceptions,"keyInterceptions",possession,"possessionsLost",fouls,offsides,handballs,"setPieceTimeouts","freeKicks",penalties,"goalKicks","cornerKicks","throwIns","yellowCards","redCards"
    from jsonb_populate_recordset(null::public.estadisticas_equipos, p_team_stats);
  end if;

  if jsonb_typeof(coalesce(p_player_stats, '[]'::jsonb)) = 'array' and jsonb_array_length(coalesce(p_player_stats, '[]'::jsonb)) > 0 then
    insert into public.estadisticas_jugadores (
      partido_id,nombre,"playerId",posicion,equipo,temporada,division,fecha,passes,"keyPasses",assists,shots,"shotsOnTarget",goals,tackles,"keyTackles",interceptions,"keyInterceptions","possessionsLost","gKSaves","gKCatches","overallRating",score,mvp,rating_apa
    )
    select
      partido_id,nombre,"playerId",posicion,equipo,temporada,division,fecha,passes,"keyPasses",assists,shots,"shotsOnTarget",goals,tackles,"keyTackles",interceptions,"keyInterceptions","possessionsLost","gKSaves","gKCatches","overallRating",score,mvp,rating_apa
    from jsonb_populate_recordset(null::public.estadisticas_jugadores, p_player_stats);
  end if;

  if p_clear_segments or p_segments is not null then
    delete from public.partido_txt_segmentos
    where partido_id in (v_old_partido_id, v_new_partido_id);
  end if;

  if p_segments is not null and jsonb_typeof(p_segments) = 'array' and jsonb_array_length(p_segments) > 0 then
    insert into public.partido_txt_segmentos (
      partido_id,partido_row_id,archivo_nombre,archivo_hash,orden_txt,duracion_minutos,goles_local,goles_visitante,payload,created_by
    )
    select
      partido_id,partido_row_id,archivo_nombre,archivo_hash,orden_txt,duracion_minutos,goles_local,goles_visitante,payload,auth.uid()
    from jsonb_to_recordset(p_segments) as x(
      partido_id text,
      partido_row_id text,
      archivo_nombre text,
      archivo_hash text,
      orden_txt text,
      duracion_minutos numeric,
      goles_local integer,
      goles_visitante integer,
      payload jsonb
    );
  end if;

  delete from public.jugadores
  where temporada is not distinct from v_temporada
    and division is not distinct from v_division;

  insert into public.jugadores (nombre,"playerId",equipo,goles,asistencias,mvps,temporada,division)
  select
    max(coalesce(nullif(trim(ej.nombre),''),'Sin Nombre')) as nombre,
    ej."playerId",
    coalesce(nullif(trim(ej.equipo),''),'Sin Club') as equipo,
    sum(coalesce(ej.goals,0))::bigint,
    sum(coalesce(ej.assists,0))::bigint,
    sum(coalesce(ej.mvp,0))::bigint,
    ej.temporada,
    ej.division
  from public.estadisticas_jugadores ej
  where ej.temporada is not distinct from v_temporada
    and ej.division is not distinct from v_division
    and nullif(trim(ej."playerId"),'') is not null
  group by ej."playerId", ej.equipo, ej.temporada, ej.division;

  v_after := jsonb_build_object(
    'partido', to_jsonb(v_match),
    'team_stats', coalesce((select jsonb_agg(to_jsonb(e) order by e.id) from public.estadisticas_equipos e where e.partido_id = v_new_partido_id), '[]'::jsonb),
    'player_stats', coalesce((select jsonb_agg(to_jsonb(j) order by j.id) from public.estadisticas_jugadores j where j.partido_id = v_new_partido_id), '[]'::jsonb),
    'segments', coalesce((select jsonb_agg(to_jsonb(s) order by s.created_at) from public.partido_txt_segmentos s where s.partido_id = v_new_partido_id), '[]'::jsonb)
  );

  select coalesce(max(revision_number),0) + 1 into v_revision
  from public.match_revisions
  where partido_row_id = p_match_row_id;

  insert into public.match_revisions (
    partido_row_id, partido_id, revision_number, source, reason, snapshot_before, snapshot_after, created_by
  ) values (
    p_match_row_id, v_new_partido_id, v_revision, p_source, nullif(trim(coalesce(p_reason,'')),''), v_before, v_after, auth.uid()
  );

  return jsonb_build_object(
    'ok', true,
    'partido_row_id', p_match_row_id,
    'partido_id', v_new_partido_id,
    'revision', v_revision
  );
end;
$$;

revoke execute on function public.commit_match_data(bigint,text,text,jsonb,jsonb,jsonb,jsonb,boolean) from public;
revoke execute on function public.commit_match_data(bigint,text,text,jsonb,jsonb,jsonb,jsonb,boolean) from anon;
grant execute on function public.commit_match_data(bigint,text,text,jsonb,jsonb,jsonb,jsonb,boolean) to authenticated;
