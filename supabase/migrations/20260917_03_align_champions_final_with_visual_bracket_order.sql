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
  slot_no integer;
begin
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