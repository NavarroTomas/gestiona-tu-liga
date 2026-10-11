# Temporada 5: integración APA Bot → web

## Objetivo

Usar el bot de Discord como fuente oficial de clubes, plantillas y fichajes,
sin dar acceso directo del navegador al archivo SQLite ni publicar datos
internos de moderación.

## Flujo propuesto

```text
apa_bot.sqlite3
        │
        │ sincronizador backend seguro
        ▼
Supabase de APA
        │
        ▼
web pública y panel administrativo
```

El bot seguirá funcionando con SQLite. La web leerá Supabase, como ya lo hace
actualmente. La sincronización podrá ejecutarse por intervalo o después de cada
cambio confirmado, pero debe ser idempotente para no duplicar registros.

## Datos públicos iniciales

### Clubes

Origen: `teams` y, cuando corresponda, `archived_clubs`.

Publicar únicamente:

- nombre;
- tag;
- división;
- logo público;
- estado activo;
- temporada.

No publicar IDs de Discord, IDs de roles, hilos internos ni datos de
responsables salvo autorización expresa.

### Jugadores y plantillas

Origen: `players` y `season_player_archive`.

Publicar únicamente jugadores confirmados y activos:

- PSO ID;
- nombre público;
- club y división;
- temporada;
- media y posiciones, si APA autoriza su publicación;
- enlace Steam, solamente si se autoriza expresamente.

Excluir registros pendientes, rechazados, pruebas de verificación, listas
negras, IDs de Discord y datos internos de moderación.

### Fichajes

Origen: `transfer_history` y ofertas con estado confirmado.

Publicar únicamente:

- jugador;
- club de origen y destino;
- temporada;
- fecha;
- tipo o motivo público, si corresponde.

Excluir textos libres de contratos, motivos internos de liberación y ofertas
pendientes o rechazadas.

## Identidad y sincronización

- Club: `guild_id + team_tag` en el bot; debe mapearse a un club estable de la
  web, preferentemente por tag normalizado.
- Jugador: `guild_id + player_id` en el bot; el `player_id` es el PSO ID.
- Temporada: el `season_id` del bot debe mapearse explícitamente al nombre de
  temporada de la web, por ejemplo `T5` o `Temporada 5`.
- Cada ejecución debe registrar fecha, cantidad de filas procesadas y errores.
- Las eliminaciones no deben hacerse automáticamente en la primera versión;
  se deben marcar como inactivas para conservar historial.

## Primera entrega técnica

1. Crear el modelo de sincronización y su tabla de auditoría.
2. Implementar un exportador de solo lectura desde SQLite.
3. Implementar un importador idempotente hacia Supabase.
4. Ejecutar una prueba con la base demo vacía y fixtures sintéticos.
5. Validar el resultado en las vistas públicas existentes.
6. Recién después conectar la base real y programar la ejecución periódica.

## Pendientes antes de producción

- autorización del responsable de APA;
- lista final de campos públicos;
- identificación del servidor/guild correcto;
- acceso seguro a Supabase de la web;
- decisión de alojamiento del sincronizador;
- prueba de reconciliación con datos reales antes de publicar.

