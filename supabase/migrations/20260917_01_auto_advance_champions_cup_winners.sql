create or replace function public.copa_campeones_match_winner(p_local text, p_visitante text, p_resultado text)
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

  if g_local = g_visitante then
    return null;
  end if;

  return case when g_local > g_visitante then p_local else p_visitante end;
end;
$$;

create or replace function public.sync_copa_campeones_final_slot(
  p_temporada text,
  p_old_winner text,
  p_new_winner text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_final public.partidos%rowtype;
begin
  if p_temporada is null then
    return;
  end if;

  select *
  into v_final
  from public.partidos
  where temporada = p_temporada
    and competicion = 'copa_campeones'
    and lower(coalesce(fase, '')) = 'final'
    and coalesce(estado, '') <> 'cancelado'
  order by id asc
  limit 1;

  if found then
    if p_old_winner is not null and p_old_winner is distinct from p_new_winner then
      if v_final.local = p_old_winner then
        update public.partidos set local = p_new_winner where id = v_final.id;
        return;
      elsif v_final.visitante = p_old_winner then
        update public.partidos set visitante = p_new_winner where id = v_final.id;
        return;
      end if;
    end if;

    if p_new_winner is null or v_final.local = p_new_winner or v_final.visitante = p_new_winner then
      return;
    end if;

    if v_final.local is null or btrim(v_final.local) = '' then
      update public.partidos set local = p_new_winner where id = v_final.id;
    elsif v_final.visitante is null or btrim(v_final.visitante) = '' then
      update public.partidos set visitante = p_new_winner where id = v_final.id;
    end if;

    return;
  end if;

  if p_new_winner is not null then
    insert into public.partidos (
      local, visitante, resultado, fecha, temporada, division,
      competicion, fase, ronda, estado
    ) values (
      p_new_winner, null, null, '2', p_temporada, 'copa',
      'copa_campeones', 'final', 'Copa de Campeones · Final', 'programado'
    );
  end if;
end;
$$;

create or replace function public.auto_advance_copa_campeones_winner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_winner text;
  new_winner text;
  old_is_semifinal boolean := false;
  new_is_semifinal boolean := false;
begin
  if tg_op = 'UPDATE' then
    old_is_semifinal := old.competicion = 'copa_campeones'
      and lower(coalesce(old.fase, '')) = 'semifinal'
      and coalesce(old.estado, '') <> 'cancelado';

    if old_is_semifinal then
      old_winner := public.copa_campeones_match_winner(old.local, old.visitante, old.resultado);
    end if;
  end if;

  new_is_semifinal := new.competicion = 'copa_campeones'
    and lower(coalesce(new.fase, '')) = 'semifinal'
    and coalesce(new.estado, '') <> 'cancelado';

  if new_is_semifinal then
    new_winner := public.copa_campeones_match_winner(new.local, new.visitante, new.resultado);
  end if;

  if tg_op = 'UPDATE' and old_is_semifinal and (not new_is_semifinal or old.temporada is distinct from new.temporada) then
    perform public.sync_copa_campeones_final_slot(old.temporada, old_winner, null);
    old_winner := null;
  end if;

  if new_is_semifinal then
    perform public.sync_copa_campeones_final_slot(new.temporada, old_winner, new_winner);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_auto_advance_copa_campeones_winner on public.partidos;
create trigger trg_auto_advance_copa_campeones_winner
after insert or update of resultado, local, visitante, estado, fase, competicion, temporada
on public.partidos
for each row
execute function public.auto_advance_copa_campeones_winner();

do $$
declare
  r record;
  w text;
begin
  for r in
    select temporada, local, visitante, resultado
    from public.partidos
    where competicion = 'copa_campeones'
      and lower(coalesce(fase, '')) = 'semifinal'
      and coalesce(estado, '') <> 'cancelado'
      and resultado is not null
    order by id asc
  loop
    w := public.copa_campeones_match_winner(r.local, r.visitante, r.resultado);
    if w is not null then
      perform public.sync_copa_campeones_final_slot(r.temporada, null, w);
    end if;
  end loop;
end;
$$;
