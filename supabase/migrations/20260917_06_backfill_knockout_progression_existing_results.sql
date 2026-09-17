do $$
declare
  r record;
  v_phase text;
  v_winner text;
begin
  for r in
    select id, competicion, temporada, fase, ronda, local, visitante, resultado, estado
    from public.partidos
    where competicion in ('copa_apa','copa_argentina','copa_campeones','playoffs')
      and coalesce(estado,'') <> 'cancelado'
      and resultado is not null
    order by id asc
  loop
    v_phase := public.knockout_phase_key(r.competicion, r.fase, r.ronda);
    v_winner := public.knockout_match_winner(r.local, r.visitante, r.resultado);

    if v_phase is not null and v_winner is not null then
      perform public.sync_knockout_progression(
        r.id,
        r.competicion,
        r.temporada,
        v_phase,
        v_winner
      );
    end if;
  end loop;
end;
$$;
