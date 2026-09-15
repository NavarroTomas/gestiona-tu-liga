-- Corrige la temporada inicial del editor de torneos cuando la tabla legacy
-- `temporadas` no coincide con los datos reales de partidos/clubes.
-- APA empezó a operar esta web desde Temporada 4.

DO $$
DECLARE
  actual_season text;
  actual_number integer;
  legacy_id bigint;
BEGIN
  SELECT temporada
  INTO actual_season
  FROM (
    SELECT temporada FROM public.partidos WHERE temporada IS NOT NULL AND btrim(temporada) <> ''
    UNION
    SELECT temporada FROM public.v_clubes_temporada_public WHERE temporada IS NOT NULL AND btrim(temporada) <> ''
  ) s
  ORDER BY COALESCE((regexp_match(temporada, '(\d+)'))[1]::integer, -1) DESC, temporada DESC
  LIMIT 1;

  IF actual_season IS NULL THEN
    actual_season := 'Temporada 4';
  END IF;

  actual_number := COALESCE((regexp_match(actual_season, '(\d+)'))[1]::integer, 4);

  -- Solo corregimos la fila legacy si no representa una temporada que exista realmente
  -- en partidos o clubes.
  SELECT t.id
  INTO legacy_id
  FROM public.temporadas t
  WHERE lower(btrim(t.nombre)) = 'temporada 1'
    AND NOT EXISTS (
      SELECT 1 FROM public.partidos p WHERE lower(btrim(p.temporada)) = lower(btrim(t.nombre))
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.v_clubes_temporada_public c WHERE lower(btrim(c.temporada)) = lower(btrim(t.nombre))
    )
  ORDER BY t.id
  LIMIT 1;

  IF legacy_id IS NOT NULL AND lower(actual_season) <> 'temporada 1' THEN
    UPDATE public.temporadas
    SET nombre = actual_season,
        numero = actual_number,
        estado = 'activa',
        activa = true,
        updated_at = now()
    WHERE id = legacy_id;

    UPDATE public.competicion_config
    SET temporada = actual_season,
        updated_at = now()
    WHERE lower(btrim(temporada)) = 'temporada 1';
  END IF;
END
$$;
