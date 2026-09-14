-- This migration intentionally extends the existing transactional match pipeline.
-- It must run after 20260914_01_unify_admin_match_pipeline.sql and
-- 20260914_02_add_match_revision_restore.sql.

create or replace function public.commit_match_data_v2(
  p_match_row_id bigint,
  p_source text,
  p_reason text,
  p_match_patch jsonb,
  p_team_stats jsonb default '[]'::jsonb,
  p_player_stats jsonb default '[]'::jsonb,
  p_segments jsonb default null,
  p_clear_segments boolean default false,
  p_aliases jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  v_result := public.commit_match_data(
    p_match_row_id,
    p_source,
    p_reason,
    p_match_patch,
    p_team_stats,
    p_player_stats,
    p_segments,
    p_clear_segments
  );

  if p_aliases is not null
     and jsonb_typeof(p_aliases) = 'array'
     and jsonb_array_length(p_aliases) > 0 then
    insert into public.player_account_aliases (
      alias_player_id,
      canonical_player_id,
      canonical_name,
      source_player_name,
      equipo,
      created_by,
      updated_at
    )
    select
      x.alias_player_id,
      x.canonical_player_id,
      x.canonical_name,
      x.source_player_name,
      x.equipo,
      auth.uid(),
      now()
    from jsonb_to_recordset(p_aliases) as x(
      alias_player_id text,
      canonical_player_id text,
      canonical_name text,
      source_player_name text,
      equipo text
    )
    where nullif(trim(x.alias_player_id), '') is not null
      and nullif(trim(x.canonical_player_id), '') is not null
      and x.alias_player_id <> x.canonical_player_id
    on conflict (alias_player_id) do update
      set canonical_player_id = excluded.canonical_player_id,
          canonical_name = excluded.canonical_name,
          source_player_name = excluded.source_player_name,
          equipo = excluded.equipo,
          updated_at = now();
  end if;

  return v_result;
end;
$$;

revoke execute on function public.commit_match_data_v2(bigint,text,text,jsonb,jsonb,jsonb,jsonb,boolean,jsonb) from public;
revoke execute on function public.commit_match_data_v2(bigint,text,text,jsonb,jsonb,jsonb,jsonb,boolean,jsonb) from anon;
grant execute on function public.commit_match_data_v2(bigint,text,text,jsonb,jsonb,jsonb,jsonb,boolean,jsonb) to authenticated;

create or replace function public.void_match_data(
  p_match_row_id bigint,
  p_reason text default 'Carga anulada desde el panel administrativo'
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return public.commit_match_data(
    p_match_row_id,
    'annulment',
    p_reason,
    jsonb_build_object(
      'resultado', null,
      'partido_id', null,
      'estado', 'programado'
    ),
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    true
  );
end;
$$;

revoke execute on function public.void_match_data(bigint,text) from public;
revoke execute on function public.void_match_data(bigint,text) from anon;
grant execute on function public.void_match_data(bigint,text) to authenticated;

create or replace function public.update_match_schedule(
  p_match_row_id bigint,
  p_fecha text,
  p_dia text default null,
  p_hora text default null,
  p_reason text default 'Programación actualizada desde el panel administrativo'
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_match public.partidos%rowtype;
  v_team_stats jsonb;
  v_player_stats jsonb;
begin
  if not public.has_permission('matches.edit') and not public.has_permission('fixtures.manage') then
    raise exception 'No tenés permiso para cambiar la programación';
  end if;

  select * into v_match
  from public.partidos
  where id = p_match_row_id;

  if not found then
    raise exception 'Partido no encontrado';
  end if;

  select coalesce(jsonb_agg(to_jsonb(e) order by e.id), '[]'::jsonb)
  into v_team_stats
  from public.estadisticas_equipos e
  where e.partido_id = v_match.partido_id;

  select coalesce(jsonb_agg(to_jsonb(j) order by j.id), '[]'::jsonb)
  into v_player_stats
  from public.estadisticas_jugadores j
  where j.partido_id = v_match.partido_id;

  return public.commit_match_data(
    p_match_row_id,
    'correction',
    p_reason,
    jsonb_build_object(
      'fecha', p_fecha,
      'dia', nullif(trim(coalesce(p_dia,'')), ''),
      'hora', nullif(trim(coalesce(p_hora,'')), '')
    ),
    v_team_stats,
    v_player_stats,
    null,
    false
  );
end;
$$;

revoke execute on function public.update_match_schedule(bigint,text,text,text,text) from public;
revoke execute on function public.update_match_schedule(bigint,text,text,text,text) from anon;
grant execute on function public.update_match_schedule(bigint,text,text,text,text) to authenticated;

drop policy if exists "staff can read match txt segments" on public.partido_txt_segmentos;
create policy "staff can read match txt segments"
on public.partido_txt_segmentos for select
to authenticated
using (
  (select public.has_permission('matches.upload_txt'))
  or (select public.has_permission('matches.upload_manual'))
  or (select public.has_permission('matches.edit'))
);
