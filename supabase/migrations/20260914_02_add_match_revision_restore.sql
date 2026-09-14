create or replace function public.restore_match_revision(
  p_revision_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_revision public.match_revisions%rowtype;
  v_snapshot jsonb;
  v_match jsonb;
begin
  if not public.has_permission('matches.edit') then
    raise exception 'No tenés permiso para restaurar revisiones';
  end if;

  if nullif(trim(coalesce(p_reason,'')), '') is null then
    raise exception 'El motivo de restauración es obligatorio';
  end if;

  select * into v_revision
  from public.match_revisions
  where id = p_revision_id;

  if not found then
    raise exception 'Revisión no encontrada';
  end if;

  v_snapshot := v_revision.snapshot_after;
  v_match := coalesce(v_snapshot->'partido', '{}'::jsonb);

  return public.commit_match_data(
    v_revision.partido_row_id,
    'correction',
    p_reason,
    jsonb_build_object(
      'local', v_match->>'local',
      'visitante', v_match->>'visitante',
      'resultado', v_match->'resultado',
      'fecha', v_match->>'fecha',
      'temporada', v_match->>'temporada',
      'division', v_match->'division',
      'dia', v_match->'dia',
      'hora', v_match->'hora',
      'partido_id', v_match->'partido_id',
      'competicion', v_match->>'competicion',
      'grupo', v_match->'grupo',
      'fase', v_match->'fase',
      'ronda', v_match->'ronda',
      'estado', v_match->'estado'
    ),
    coalesce(v_snapshot->'team_stats', '[]'::jsonb),
    coalesce(v_snapshot->'player_stats', '[]'::jsonb),
    coalesce(v_snapshot->'segments', '[]'::jsonb),
    true
  );
end;
$$;

revoke execute on function public.restore_match_revision(uuid,text) from public;
revoke execute on function public.restore_match_revision(uuid,text) from anon;
grant execute on function public.restore_match_revision(uuid,text) to authenticated;
