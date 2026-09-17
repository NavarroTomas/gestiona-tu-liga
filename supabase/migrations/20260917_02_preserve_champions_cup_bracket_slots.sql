create or replace function public.copa_campeones_semifinal_slot(
  p_match_id bigint,
  p_temporada text,
  p_ronda text
)
returns integer
language plpgsql
stable
as $$
declare
  m text[];
  slot_no integer;
begin
  m := regexp_match(lower(coalesce(p_ronda, '')), 'semifinal[^0-9]*([12])');
  if m is not null and array_length(m, 1) >= 1 then
    return m[1]::integer;
  end if;

  select count(*)::integer
  into slot_no
  from public.partidos p
  where p.temporada = p_temporada
    and p.competicion = 'copa_campeones'
    and lower(coalesce(p.fase, '')) = 'semifinal'
    and coalesce(p.estado, '') <> 'cancelado'
    and p.id <= p_match_id;

  if slot_no < 1 then return 1; end if;
  if slot_no > 2 then return 2; end if;
  return slot_no;
end;
$$;

create or replace function public.sync_copa_campeones_final_slot(
  p_temporada text,
  p_old_winner text,
  p_new_winner text,
  p_slot integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_final public.partidos%rowtype;
  v_slot integer := case when p_slot = 2 then 2 else 1 end;
begin
  if p_temporada is null then return; end if;

  select * into v_final
  from public.partidos
  where temporada = p_temporada
    and competicion = 'copa_campeones'
    and lower(coalesce(fase, '')) = 'final'
    and coalesce(estado, '') <> 'cancelado'
  order by id asc
  limit 1;

  if not found then
    if p_new_winner is null then return; end if;

    insert into public.partidos (
      local, visitante, resultado, fecha, temporada, division,
      competicion, fase, ronda, estado
    ) values (
      case when v_slot = 1 then p_new_winner else null end,
      case when v_slot = 2 then p_new_winner else null end,
      null, '2', p_temporada, 'copa',
      'copa_campeones', 'final', 'Copa de Campeones · Final', 'programado'
    );
    return;
  end if;

  if v_slot = 1 then
    if p_old_winner is not null and v_final.local = p_old_winner and p_old_winner is distinct from p_new_winner then
      update public.partidos set local = p_new_winner where id = v_final.id;
      return;
    end if;

    if p_new_winner is null then return; end if;
    if v_final.local = p_new_winner then return; end if;

    if v_final.visitante = p_new_winner then
      update public.partidos
      set local = p_new_winner,
          visitante = case when v_final.local = p_new_winner then v_final.visitante else v_final.local end
      where id = v_final.id;
      return;
    end if;

    if v_final.local is null or btrim(v_final.local) = '' then
      update public.partidos set local = p_new_winner where id = v_final.id;
    elsif v_final.visitante is null or btrim(v_final.visitante) = '' then
      update public.partidos
      set visitante = v_final.local,
          local = p_new_winner
      where id = v_final.id;
    end if;
  else
    if p_old_winner is not null and v_final.visitante = p_old_winner and p_old_winner is distinct from p_new_winner then
      update public.partidos set visitante = p_new_winner where id = v_final.id;
      return;
    end if;

    if p_new_winner is null then return; end if;
    if v_final.visitante = p_new_winner then return; end if;

    if v_final.local = p_new_winner then
      update public.partidos
      set visitante = p_new_winner,
          local = case when v_final.visitante = p_new_winner then v_final.local else v_final.visitante end
      where id = v_final.id;
      return;
    end if;

    if v_final.visitante is null or btrim(v_final.visitante) = '' then
      update public.partidos set visitante = p_new_winner where id = v_final.id;
    elsif v_final.local is null or btrim(v_final.local) = '' then
      update public.partidos
      set local = v_final.visitante,
          visitante = p_new_winner
      where id = v_final.id;
    end if;
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
  old_slot integer;
  new_slot integer;
begin
  if tg_op = 'UPDATE' then
    old_is_semifinal := old.competicion = 'copa_campeones'
      and lower(coalesce(old.fase, '')) = 'semifinal'
      and coalesce(old.estado, '') <> 'cancelado';

    if old_is_semifinal then
      old_winner := public.copa_campeones_match_winner(old.local, old.visitante, old.resultado);
      old_slot := public.copa_campeones_semifinal_slot(old.id, old.temporada, old.ronda);
    end if;
  end if;

  new_is_semifinal := new.competicion = 'copa_campeones'
    and lower(coalesce(new.fase, '')) = 'semifinal'
    and coalesce(new.estado, '') <> 'cancelado';

  if new_is_semifinal then
    new_winner := public.copa_campeones_match_winner(new.local, new.visitante, new.resultado);
    new_slot := public.copa_campeones_semifinal_slot(new.id, new.temporada, new.ronda);
  end if;

  if tg_op = 'UPDATE' and old_is_semifinal and (not new_is_semifinal or old.temporada is distinct from new.temporada or old_slot is distinct from new_slot) then
    perform public.sync_copa_campeones_final_slot(old.temporada, old_winner, null, old_slot);
    old_winner := null;
  end if;

  if new_is_semifinal then
    perform public.sync_copa_campeones_final_slot(new.temporada, old_winner, new_winner, new_slot);
  end if;

  return new;
end;
$$;

do $$
declare
  r record;
  w text;
  s integer;
begin
  for r in
    select id, temporada, local, visitante, resultado, ronda
    from public.partidos
    where competicion = 'copa_campeones'
      and lower(coalesce(fase, '')) = 'semifinal'
      and coalesce(estado, '') <> 'cancelado'
      and resultado is not null
    order by temporada, id
  loop
    w := public.copa_campeones_match_winner(r.local, r.visitante, r.resultado);
    s := public.copa_campeones_semifinal_slot(r.id, r.temporada, r.ronda);
    if w is not null then
      perform public.sync_copa_campeones_final_slot(r.temporada, null, w, s);
    end if;
  end loop;
end;
$$;