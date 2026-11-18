# Contrato compartido con Flutter — versión inicial

Estado: implementado en SQL y consumido por la web. La app Flutter todavía debe construirse. No necesita un backend propio: usa Supabase Auth, PostgREST/RPC y Storage con las mismas políticas que la web.

## Configuración y sesión

Usar `supabase_flutter`. Recibir `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` con `--dart-define`. Son configuración pública; nunca incluir `service_role`, contraseña de base de datos ni credenciales QA en el código.

Registro: `auth.signUp(email: ..., password: ...)`. Si no devuelve sesión, mostrar confirmación de correo pendiente. Ingreso: `auth.signInWithPassword`. Recuperación: `auth.resetPasswordForEmail`, con el enlace de retorno Android configurado antes de probarlo. La configuración de deep links de Android está pendiente. Cerrar sesión con `auth.signOut`.

Los jugadores son registros deportivos; no son usuarios de Auth. Las únicas cuentas son de organizadores y administradores.

## Modelos y consultas

Los nombres y tipos vigentes están en `src/lib/platform/types.ts` y `supabase/schema/platform-v1.sql`. UUID se representa como `String`; `timestamptz` se intercambia como ISO 8601 y se convierte a hora local para mostrarlo. Rating es numérico nullable. No convertir un resultado 0–0 en un partido pendiente: manda `status` y la presencia de ambos marcadores.

| Operación | Consulta |
| --- | --- |
| Mis ligas | `league_members.select('role, league:leagues(*)').eq('user_id', auth.currentUser!.id)` |
| Liga pública | `leagues.select().eq('slug', slug).maybeSingle()` |
| Contenido de liga | Consultar `teams`, `players`, `matches`, `match_players`, `news`, `seasons`, `divisions`, `competitions` filtrando `league_id` |
| Comprobar administración | Membresía propia con `league_id` y `user_id`; owner/admin permiten gestionar |
| Equipos, jugadores, noticias | Insert/update/delete con `league_id`; conservar `id` al editar |
| Programación de partido | Insertar partido con competencia, ronda, fecha, sede y equipos; editar solo esos campos |

RLS aplica aunque se omita un filtro, pero el cliente siempre debe filtrar por liga. Un visitante solo recibe noticias publicadas. Cada error de PostgREST debe mostrarse y conservar el formulario para reintentar.

## RPC obligatorias

### `create_league`

Parámetros: `p_request_id` UUID v4 estable durante los reintentos, `p_name`, `p_slug`, `p_mode` (`teams`/`players`), `p_purpose` (`amateur`/`friends`/`school`/`other`), `p_description`, `p_expected` entero 2–128, `p_format` (`round_robin`/`double_round_robin`/`friendly`), `p_primary` y `p_secondary` hex `#RRGGBB`.

Devuelve JSON `{id, slug}`. Repetir el mismo request ID con el mismo usuario recupera la misma liga. Crea liga, membresía owner, temporada, división y competencia inicial en una transacción. El slug definitivo contiene un sufijo; usar el devuelto, no reconstruirlo. El modo jugadores requiere formato friendly. No insertar directamente en `leagues` o `league_members`.

```dart
final result = await Supabase.instance.client.rpc('create_league', params: {
  'p_request_id': requestId,
  'p_name': 'Liga del domingo', 'p_slug': 'liga-del-domingo',
  'p_mode': 'teams', 'p_purpose': 'amateur', 'p_description': '',
  'p_expected': 4, 'p_format': 'round_robin',
  'p_primary': '#216348', 'p_secondary': '#dbe99d',
});
// Guardar result['id'] y result['slug']; quitar el borrador solo al confirmar éxito.
```

### `save_match_result`

Parámetros `p_match_id`, `p_home`, `p_away`, `p_players`. Cada participante tiene `player_id`, `side` (`home`/`away`), `goals`, `assists`, `yellow_cards`, `red_cards`, `rating`. Mandar ceros explícitos; rating sin nota debe ser null. La presencia de la fila significa que jugó ese partido.

Rating manual 1–10; amarillas 0–2; rojas 0–1. Marcadores enteros 0–999. No repetir jugadores. Goles y asistencias de un lado no pueden superar el marcador de ese lado. En equipos fijos, cada participante debe pertenecer al equipo correspondiente. El servidor valida todo y reemplaza el resultado y las participaciones de forma atómica. No hacer upsert directo en `match_players` ni actualizar las columnas de resultado. Para anular, enviar ambos marcadores null y lista vacía; elimina las estadísticas y vuelve a scheduled.

### Fixture y partidos entre amigos

`generate_league_fixture` recibe `p_league_id`. Rechaza un segundo fixture cuando ya hay partidos. Usa todos los equipos cargados; cantidad impar produce descansos. El formato de la liga decide ida o ida/vuelta.

`create_friendly_match` recibe `p_league_id`, `p_home_label`, `p_away_label`, `p_home_players` lista UUID, `p_away_players` lista UUID, `p_starts_at` ISO/null, `p_venue`, `p_round`. Devuelve UUID del partido y registra sus participaciones. El reparto aleatorio/equilibrado se prepara en cliente; deben mostrarse los equipos antes de confirmar. La referencia del algoritmo está en `splitPlayers` de `domain.ts`.

`add_league_admin` recibe `p_league_id`, `p_email`. Solo owner; destino debe tener cuenta confirmada. No es un sistema de invitaciones por correo.

## Imágenes

Bucket `league-images`, ruta `leagueId/uuid.ext`, upload sin sobrescribir. JPG/PNG/WebP hasta 2 MB. Obtener URL pública y guardar en `logo_url`, `photo_url` o `image_url`. El bucket contiene imágenes públicas deportivas; no subir documentos personales. La limpieza de archivos reemplazados queda pendiente.

## Orden de implementación Android

1. Configurar Supabase, sesión y estados de carga/error.
2. Ingreso y lista de ligas con la misma cuenta que la web.
3. Detalle de liga y CRUD de equipos/jugadores.
4. Lista de partidos, carga y edición de resultados mediante RPC.
5. Tabla y estadísticas usando las mismas reglas de `domain.ts`.
6. Creación de liga y carga de imágenes.
7. Deep links de confirmación/recuperación, prueba en dispositivo y APK firmado para entrega.

No marcar la app terminada hasta instalar el APK y comprobar que un cambio hecho en Android aparece en la web y viceversa.

## Ajuste de contrato tras revisión CRUD (18/11/2026)

Al editar entidades, usar update con filtros de id y league_id y exigir una fila devuelta; no usar upsert para editar. Así no se recrea un registro borrado por otro administrador. Delete también debe comprobar la fila afectada. Un resultado vacío significa registro ausente o sin permiso; no mostrar éxito.

Para corregir partidos con un jugador transferido, mostrar también las participaciones ya guardadas en el lado histórico. El servidor permite conservar ese lado, incluso si cambió el plantel actual. No puede mover esa participación al lado contrario solo por un cambio de equipo. Los participantes nuevos se validan con el plantel actual. Ver el informe crud-permissions-review-2026-11-18.md y el parche result-history-v2.sql.
