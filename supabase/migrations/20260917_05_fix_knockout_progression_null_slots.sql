create or replace function public.knockout_slot_placeholder(p_phase text, p_source_index integer)
returns text
language sql
immutable
as $$
  select case
    when p_phase = 'octavos' then 'Ganador Octavos ' || p_source_index::text
    when p_phase = 'cuartos' then 'Ganador Cuartos ' || p_source_index::text
    when p_phase = 'semifinal' then 'Ganador SF' || p_source_index::text
    when p_phase = 'final_ascenso' then 'Ganador Final Ascenso'
    else 'Por definir'
  end;
$$;

create or replace function public.sync_knockout_progression(
  p_match_id bigint,
  p_competicion text,
  p_temporada text,
  p_phase text,
  p_winner text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next_phase text;
  v_source_index integer;
  v_target_index integer;
  v_target public.partidos%rowtype;
  v_values record;
  v_slot text;
  v_placeholder text;
begin
  if p_competicion not in ('copa_apa','copa_argentina','copa_campeones','playoffs') then return; end if;

  v_next_phase := public.knockout_next_phase(p_competicion, p_phase);
  if v_next_phase is null then return; end if;

  select pos into v_source_index
  from (
    select id, row_number() over(order by id asc)::int as pos
    from public.partidos
    where competicion = p_competicion
      and temporada = p_temporada
      and coalesce(estado,'') <> 'cancelado'
      and public.knockout_phase_key(competicion, fase, ronda) = p_phase
  ) s
  where s.id = p_match_id;

  if v_source_index is null then return; end if;

  if p_competicion = 'playoffs' and p_phase = 'final_ascenso' then
    v_target_index := 1;
    v_slot := 'local';
  else
    v_target_index := ((v_source_index - 1) / 2) + 1;
    v_slot := case when mod(v_source_index - 1, 2) = 0 then 'local' else 'visitante' end;
  end if;

  v_placeholder := public.knockout_slot_placeholder(p_phase, v_source_index);

  select * into v_target
  from (
    select p.*, row_number() over(order by id asc)::int as pos
    from public.partidos p
    where p.competicion = p_competicion
      and p.temporada = p_temporada
      and coalesce(p.estado,'') <> 'cancelado'
      and public.knockout_phase_key(p.competicion, p.fase, p.ronda) = v_next_phase
  ) x
  where x.pos = v_target_index
  limit 1;

  if not found and p_winner is not null then
    select * into v_values from public.knockout_target_phase_values(p_competicion, v_next_phase);

    insert into public.partidos(
      local, visitante, resultado, fecha, temporada, division,
      competicion, fase, ronda, estado
    ) values (
      case when v_slot = 'local' then p_winner else v_placeholder end,
      case when v_slot = 'visitante' then p_winner else null end,
      null,
      v_values.fecha,
      p_temporada,
      v_values.division,
      p_competicion,
      v_values.fase,
      case when v_next_phase in ('cuartos','semifinal') then v_values.ronda || ' ' || v_target_index::text else v_values.ronda end,
      'programado'
    );
    return;
  end if;

  if not found then return; end if;

  if v_slot = 'local' then
    update public.partidos set local = coalesce(p_winner, v_placeholder) where id = v_target.id;
  else
    update public.partidos set visitante = coalesce(p_winner, v_placeholder) where id = v_target.id;
  end if;
end;
$$;

create or replace function public.auto_advance_knockout_winner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_phase text;
  v_new_phase text;
  v_old_winner text;
  v_new_winner text;
  v_context_changed boolean := false;
begin
  if tg_op = 'UPDATE' and old.competicion in ('copa_apa','copa_argentina','copa_campeones','playoffs') then
    v_old_phase := public.knockout_phase_key(old.competicion, old.fase, old.ronda);
    if coalesce(old.estado,'') <> 'cancelado' then
      v_old_winner := public.knockout_match_winner(old.local, old.visitante, old.resultado);
    end if;
  end if;

  if new.competicion in ('copa_apa','copa_argentina','copa_campeones','playoffs') then
    v_new_phase := public.knockout_phase_key(new.competicion, new.fase, new.ronda);
    if coalesce(new.estado,'') <> 'cancelado' then
      v_new_winner := public.knockout_match_winner(new.local, new.visitante, new.resultado);
    end if;
  end if;

  if tg_op = 'UPDATE' then
    v_context_changed :=
      old.competicion is distinct from new.competicion or
      old.temporada is distinct from new.temporada or
      v_old_phase is distinct from v_new_phase or
      (coalesce(old.estado,'') <> 'cancelado' and coalesce(new.estado,'') = 'cancelado');

    if v_old_phase is not null and (v_context_changed or (v_old_winner is not null and v_new_winner is null)) then
      perform public.sync_knockout_progression(old.id, old.competicion, old.temporada, v_old_phase, null);
    end if;
  end if;

  if v_new_phase is not null then
    perform public.sync_knockout_progression(new.id, new.competicion, new.temporada, v_new_phase, v_new_winner);
  end if;

  return new;
end;
$$;
