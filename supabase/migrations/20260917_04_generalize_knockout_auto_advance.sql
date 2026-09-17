-- Avance automático genérico para todas las competencias de eliminación directa.
-- Soporta Copa APA, Copa Argentina, Copa de Campeones y Playoffs.
-- Respeta el orden visual de la llave usando el mismo orden estable por id que consume la UI.

create or replace function public.knockout_match_winner(p_local text, p_visitante text, p_resultado text)
returns text
language plpgsql
immutable
as $$
declare
  m text[];
  g_local integer;
  g_visitante integer;
begin
  if p_resultado is null or p_local is null or p_visitante is null then
    return null;
  end if;

  m := regexp_match(p_resultado, '(\d+)\s*[^0-9]+\s*(\d+)');
  if m is null or array_length(m, 1) < 2 then
    return null;
  end if;

  g_local := m[1]::integer;
  g_visitante := m[2]::integer;
  if g_local = g_visitante then return null; end if;

  return case when g_local > g_visitante then p_local else p_visitante end;
end;
$$;

create or replace function public.knockout_phase_key(p_competicion text, p_fase text, p_ronda text)
returns text
language sql
immutable
as $$
  select case
    when p_competicion = 'playoffs' and lower(coalesce(p_fase,'')) in ('final_ascenso','final ascenso') then 'final_ascenso'
    when p_competicion = 'playoffs' and lower(coalesce(p_fase,'')) in ('promocion','promoción') then 'promocion'
    when lower(coalesce(p_fase,'')) like '%octav%' or lower(coalesce(p_ronda,'')) like '%octav%' then 'octavos'
    when lower(coalesce(p_fase,'')) like '%cuart%' or lower(coalesce(p_ronda,'')) like '%cuart%' then 'cuartos'
    when lower(coalesce(p_fase,'')) like '%semi%' or lower(coalesce(p_ronda,'')) like '%semi%' then 'semifinal'
    when lower(coalesce(p_fase,'')) in ('final','gran_final','gran final') or lower(coalesce(p_ronda,'')) like '%gran final%' then 'final'
    else null
  end;
$$;

create or replace function public.knockout_next_phase(p_competicion text, p_phase text)
returns text
language sql
immutable
as $$
  select case
    when p_competicion in ('copa_apa','copa_argentina','copa_campeones') and p_phase = 'octavos' then 'cuartos'
    when p_competicion in ('copa_apa','copa_argentina','copa_campeones') and p_phase = 'cuartos' then 'semifinal'
    when p_competicion in ('copa_apa','copa_argentina','copa_campeones') and p_phase = 'semifinal' then 'final'
    when p_competicion = 'playoffs' and p_phase = 'semifinal' then 'final_ascenso'
    when p_competicion = 'playoffs' and p_phase = 'final_ascenso' then 'promocion'
    else null
  end;
$$;

create or replace function public.knockout_target_phase_values(p_competicion text, p_next_phase text)
returns table(fase text, ronda text, fecha text, division text)
language sql
immutable
as $$
  select
    case
      when p_competicion = 'playoffs' and p_next_phase = 'final_ascenso' then 'final_ascenso'
      when p_competicion = 'playoffs' and p_next_phase = 'promocion' then 'promocion'
      when p_next_phase = 'cuartos' then 'cuartos'
      when p_next_phase = 'semifinal' then 'semifinal'
      else 'final'
    end,
    case
      when p_competicion = 'playoffs' and p_next_phase = 'final_ascenso' then 'Playoffs · Final de Ascenso'
      when p_competicion = 'playoffs' and p_next_phase = 'promocion' then 'Playoffs · Promoción'
      when p_next_phase = 'cuartos' then 'Cuartos de Final'
      when p_next_phase = 'semifinal' then 'Semifinal'
      when p_competicion = 'copa_campeones' then 'Copa de Campeones · Final'
      else 'Gran Final'
    end,
    case
      when p_next_phase = 'cuartos' then '2'
      when p_next_phase = 'semifinal' then '3'
      when p_next_phase in ('final','final_ascenso') then '4'
      when p_next_phase = 'promocion' then '5'
      else null
    end,
    case
      when p_competicion = 'playoffs' and p_next_phase = 'promocion' then 'promocion'
      when p_competicion = 'playoffs' then 'segunda'
      else 'copa'
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
      case when v_slot = 'local' then p_winner else null end,
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
    update public.partidos set local = p_winner where id = v_target.id;
  else
    update public.partidos set visitante = p_winner where id = v_target.id;
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

  if tg_op = 'UPDATE' and v_old_phase is not null and (
    old.competicion is distinct from new.competicion or
    old.temporada is distinct from new.temporada or
    v_old_phase is distinct from v_new_phase or
    (coalesce(old.estado,'') <> 'cancelado' and coalesce(new.estado,'') = 'cancelado') or
    v_old_winner is distinct from v_new_winner
  ) then
    perform public.sync_knockout_progression(old.id, old.competicion, old.temporada, v_old_phase, null);
  end if;

  if v_new_phase is not null then
    perform public.sync_knockout_progression(new.id, new.competicion, new.temporada, v_new_phase, v_new_winner);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_auto_advance_copa_campeones_winner on public.partidos;
drop trigger if exists trg_auto_advance_knockout_winner on public.partidos;

create trigger trg_auto_advance_knockout_winner
after insert or update of resultado, local, visitante, estado, fase, ronda, competicion, temporada
on public.partidos
for each row
execute function public.auto_advance_knockout_winner();
