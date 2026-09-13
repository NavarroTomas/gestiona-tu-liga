# Módulo Predicciones

Este módulo está separado para que los cambios de UI, reglas y acceso a datos no vuelvan a concentrarse en `page.tsx`.

## Estructura

- `src/app/entretenimiento/predicciones/page.tsx`
  - Solo ensambla la pantalla.
  - No contiene consultas a Supabase ni reglas de negocio.
- `src/config/predicciones.ts`
  - Temporadas, competiciones, divisiones, grupos, fases y valores por defecto.
- `src/hooks/usePredicciones.ts`
  - Estado de la pantalla y acciones del usuario.
  - Coordina filtros, carga de datos, envío y ranking.
- `src/lib/predicciones/api.ts`
  - Único punto de acceso a Supabase dentro del módulo.
- `src/lib/predicciones/types.ts`
  - Tipos compartidos.
- `src/lib/predicciones/utils.ts`
  - Funciones puras: contexto, puntajes, horario de inicio, ranking y validaciones.
- `src/components/predicciones/PredictionDropdown.tsx`
  - Dropdown custom reutilizable, igual al enfoque de Dream Team.
- `src/components/predicciones/PredictionsHero.tsx`
  - Hero y estadísticas generales.
- `src/components/predicciones/PredictionsFilters.tsx`
  - Temporada, competición, contexto y fecha.
- `src/components/predicciones/PredictionMatchCard.tsx`
  - Tarjeta de partido, marcador exacto y botones de voto.
- `src/components/predicciones/PredictionsSidebar.tsx`
  - Ranking y predicciones del visitante actual.

## Regla de voto

1. No hace falta registro visible.
2. Si no existe sesión, al enviar se crea una identidad anónima con Supabase Auth.
3. Cada identidad puede votar una sola vez por partido.
4. La predicción queda inmutable después de enviarse.
5. Se puede votar únicamente mientras `now() < partidos.scheduled_at`.
6. En el instante en que llega `scheduled_at`, la UI se bloquea y Supabase también rechaza nuevos inserts.
7. Un partido sin `scheduled_at` confirmado no acepta predicciones.

## Puntuación

- Marcador exacto: 3 puntos.
- Ganador correcto sin marcador exacto: 1 punto.
- Incorrecto: 0 puntos.

## Dónde cambiar cada cosa

- Agregar torneo/fase: `src/config/predicciones.ts`.
- Cambiar colores o composición visual: `src/components/predicciones/*`.
- Cambiar regla de puntos o cálculo: `src/lib/predicciones/utils.ts`.
- Cambiar consultas: `src/lib/predicciones/api.ts`.
- Cambiar flujo de interacción: `src/hooks/usePredicciones.ts`.

No agregar consultas directas a Supabase dentro de componentes visuales ni dentro de `page.tsx`.
