# Revisión detallada de CRUD y permisos — 18/11/2026

Trabajo solicitado: tareas 1 y 2, sin rediseño visual ni avance de Flutter. Rama `feat/platform-foundation-20261118`. Proyecto verificado: `ilkkqynzvwskpwjgtapi`. Se usaron exclusivamente registros ficticios identificados como QA. No se modificó el repositorio original con trabajo local del usuario.

## Resultados ejecutados

| Verificación | Resultado | Evidencia |
| --- | --- | --- |
| Integración HTTP y reglas de dominio con Supabase real | 87 comprobaciones aprobadas, cero fallos | `docs/testing/platform-deep-report.json` |
| Roles owner, otro organizador, admin delegado y visitante | 84 comprobaciones aprobadas después del parche | `docs/testing/platform-role-report.json` |
| Pruebas de dominio | Nueve grupos aprobados | `npm run test:platform` |
| TypeScript | Aprobado | `npm run typecheck` |
| ESLint sobre archivos modificados | Aprobado, sin errores ni advertencias | API, dominio, cliente, entidades, partidos y noticias |
| Compilación de producción Webpack | Aprobada, salida 0 | `next build --webpack` |

Los números indican aserciones de los scripts, no cantidad de usuarios reales ni una certificación de seguridad.

## Método y límites de las pruebas

`scripts/platform-deep-checks.cjs` carga las funciones TypeScript reales de API/dominio con el compilador de TypeScript y les entrega un cliente Supabase autenticado. No hay backend simulado, service_role ni bypass de RLS. Usa una cuenta QA confirmada y un segundo cliente sin sesión. Cada caso registra su identificador, descripción y estado. Los casos inválidos de resultados comparan el estado completo antes y después de la petición rechazada.

`supabase/tests/platform-role-matrix.sql` cambia a los roles PostgreSQL `authenticated` y `anon` y simula los subjects JWT de tres usuarios temporales: propietario A, propietario B y administrador C. Las operaciones se ejecutan con esos roles, no como postgres. El rol administrador de la base se usa para preparar los usuarios temporales y leer el catálogo. Al finalizar se hace rollback, incluyendo usuarios, membresías, ligas e imágenes ficticias. Es una prueba de RLS/SQL; no reemplaza un segundo login real ni una prueba de sesión expirada en Android.

No se envió correo ni se deshabilitó la confirmación. No se cambió el acceso público de las ligas ni se ampliaron grants. El conector Supabase disponible apunta a otra cuenta y no se utilizó para modificar ese proyecto. Las consultas SQL se ejecutaron en el editor del proyecto correcto abierto por el usuario.

## Fallos encontrados y correcciones

| Caso inicial | Antes | Corrección y prueba posterior |
| --- | --- | --- |
| C12: eliminar un UUID inexistente | La API devolvía éxito aunque borrara cero filas | Delete exige una fila devuelta; ausente o inaccesible produce un error claro. C12 y filtro de liga incorrecto aprobados |
| M04: corregir resultado después de transferir a un jugador | Servidor rechazaba al participante por mirar solo su plantel actual | Se valida la participación ya guardada para ese partido y lado; solo las altas nuevas usan el plantel actual. M04 aprobado |
| M05: formulario del resultado histórico | Validación local rechazaba la misma corrección; el jugador transferido no aparecía en su lado original | Se incluye a los participantes históricos en su lado guardado y se usan esas filas en la validación. M05 y prueba de dominio aprobados |
| Edición de un registro ya borrado por otro administrador | Un upsert lo volvía a crear | Se separaron create e update. Update filtra ID y liga y exige una fila. Verificado para equipos, jugadores y noticias |
| Edición de programación con un filtro que no encuentra el partido | Podía informar éxito sin modificar nada | `updateMatchSchedule` exige readback de una fila; filtro de liga erróneo rechazado |

La prueba inicial completa pasó 71 casos y falló tres; se conserva en `platform-deep-baseline.json`. La recreación involuntaria se reprodujo aparte antes de modificar esa lógica: `platform-stale-edit-baseline.json`. La suite final agrega más casos, por lo que su total no es directamente comparable al de la inicial.

## Cobertura de gestión

| Grupo | Comprobaciones | Casos |
| --- | --- | --- |
| Entidades | 17 | Crear/listar, renombrar equipo y abreviatura, nombre duplicado ignorando mayúsculas/espacios, límites de campos, editar jugador/posición, desasignar, transferir, FK de otra liga, eliminar filas descartables, impedir eliminar plantel relacionado, registro inexistente, edición obsoleta y filtro de liga incorrecto |
| Partidos y resultados | 28 | Fecha/sede/ronda, goles/asistencias/tarjetas/nota, puntos, transferencia, corrección histórica, no cambiar el lado histórico al pasar al rival, inválidos con rollback, borrar jugador con historia bloqueado, reemplazar totales, puntaje configurable, anular, borrar partido con cascada, generar fixture y rechazar repetición |
| Noticias | 2 | Crear/editar borrador y eliminar con lectura posterior |
| Visitante HTTP | 24 | Lectura deportiva pública, ocultación de borradores por UUID, altas/cambios/bajas rechazados con SQLSTATE de permisos, membresías privadas, schemas private/auth no expuestos, RPC protegidas, publicar/despublicar |
| Escrituras protegidas y Storage | 11 | Campos sensibles de partido, insert/update/delete de estadísticas, membresía directa y subida de imagen sin sesión rechazados |
| Grupo de amigos | 5 | Reparto impar 3/2 sin repetidos, puntos por lado, corrección de participantes, rechazo de duplicados y de jugador de otra liga |

Inválidos de resultado M06–M20: marcador negativo, fraccionario o mayor a 999; un marcador null; jugador repetido; goles o asistencias mayores al marcador; nota 0/11; tres amarillas; dos rojas; jugador externo; lado incorrecto; participantes null u objeto en lugar de lista. Cada rechazo debe preservar marcador y participaciones anteriores.

La prueba anónima de alta de liga usa campos válidos y exige error de permisos, evitando confundir un rechazo por campos incorrectos con protección real. Los tests SQL complementan las lecturas/escrituras de temporadas, divisiones y competencias aunque su gestión visual completa siga pendiente.

## Matriz de permisos verificada

| Acción | Propietario | Admin de la liga | Otro organizador | Visitante |
| --- | --- | --- | --- | --- |
| Ver información deportiva pública | Sí | Sí | Sí | Sí |
| Leer borrador de noticia | Sí | Sí | No | No |
| Gestionar equipo de esa liga | Sí | Sí | No | No |
| Corregir/anular resultado | Sí | Sí | No | No |
| Otorgar rol admin mediante RPC | Sí | No | No | No |
| Insertar/actualizar directamente membresías | No | No | No | No |
| Leer membresías de otras personas | No | No | No | No |
| Leer solicitudes privadas de creación | No | No | No | No |
| Escribir directamente marcador/estadísticas | No | No | No | No |
| Subir imagen a carpeta de liga ajena | No | No | No | No |

En Storage, la última fila representa la carpeta de una liga para la cual no hay membresía; el upload propio ya fue probado en el smoke anterior. La API HTTP anónima también rechaza uploads. Las imágenes deportivas son públicas por diseño mediante URL conocida; no deben contener documentos privados.

Los intentos de otro organizador cubrieron insert/update/delete de equipos, jugadores, partidos, noticias, temporadas, divisiones y competencias; renombrar liga ajena; guardar/anular resultados; generar fixture; crear amistoso; agregar administradores; mover registros entre ligas; alterar estadísticas y subir imágenes. Un claim `user_metadata.role=owner` no otorgó acceso.

## Archivos modificados

- `src/lib/platform/api.ts`: operaciones create/update separadas, confirmación de filas eliminadas/actualizadas y helper de programación.
- `src/lib/platform/client.ts`: mensaje para registro ausente o inaccesible (`PGRST116`).
- `src/lib/platform/domain.ts`: validación de participaciones históricas por liga, partido, jugador y lado.
- `Entities.tsx`, `NewsManager.tsx`: selección explícita de create/update.
- `MatchesManager.tsx`: edición con historial y programación con confirmación.
- `supabase/schema/platform-v1.sql`: bootstrap actualizado para bases nuevas.
- `supabase/patches/result-history-v2.sql`: parche incremental aplicado al proyecto existente; misma firma, propietario y grants. No volver a ejecutar el bootstrap sobre esa base.
- Scripts, SQL y JSON de evidencia descritos arriba; regresión de historial agregada en `tests/platform-domain.cjs`.

## Datos de prueba y decisiones pendientes

Las ligas QA de la ejecución HTTP se conservan para inspección. Solo se eliminaron filas descartables creadas dentro de la propia prueba. Los IDs y slugs están en el reporte; no contiene contraseñas ni tokens. Hubo una preparación inicial adicional en la sesión interactiva que quedó sin completar; se conserva como QA y no se cuenta como ejecución aprobada.

Una participación histórica existente conserva su lado al transferirse. El modelo todavía no guarda inscripciones/planteles por fecha: agregar retroactivamente a una persona que nunca tuvo participación guardada se valida con el plantel actual. Anular un resultado borra sus participaciones; no se promete reconstrucción automática del historial anulado. Un eventual registro de transferencias/inscripciones requiere diseño de producto posterior.

Los equipos y jugadores relacionados con partidos no se borran en cascada: se bloquea la eliminación para conservar historia. Borrar un partido sí elimina sus estadísticas y recalcula los rankings. Nombres de jugadores repetidos son posibles para personas homónimas; nombres de equipos repetidos dentro de la misma liga se rechazan.

No se hizo una auditoría externa de seguridad, pruebas de carga, expiración/revocación de tokens, cambio de rol en vivo, pruebas Android ni recuperación desde backup. No se publicó ni fusionó la plataforma en main como parte de este bloque.

## Repetir las pruebas

Con las variables públicas del proyecto y credenciales QA disponibles solo como variables de entorno, ejecutar `npm run test:platform:integration`. El script termina con salida 1 si falla alguna comprobación y escribe el informe en docs/testing. No usar una cuenta real ni un proyecto ajeno. La limpieza de sesión de los dos scripts usa scope local para no invalidar otras sesiones de la misma cuenta; se comprobó que la sesión de prueba queda vacía.

El parche SQL es incremental y no registra una migración CLI. La CLI no estaba instalada en esta estación; no se inventó un archivo de historial. Conservar el SQL aplicado y generar una migración formal al normalizar el entorno.

Referencias consultadas: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [signOut y alcance de sesión](https://supabase.com/docs/reference/javascript/auth-signout).

## Comprobación desde el navegador

Se inició sesión con la cuenta QA en la compilación nueva servida en http://localhost:3002. Una instancia anterior ocupaba el puerto 3001; la inspección de esa instancia no se contó como validación de los cambios.

En la liga QA del informe final se abrió un partido ya jugado después de mover al goleador desde Pinos editado a Norte. El jugador siguió apareciendo en su lado histórico dentro del formulario. Se cambió el marcador de 1–0 a 1–1, la nota de 8 a 9 y las amarillas de 1 a 0. La interfaz confirmó el guardado. La tabla de posiciones mostró 4 puntos por empate (puntaje personalizado de esta prueba), y las estadísticas mostraron un partido jugado, un gol, cero amarillas y nota 9.0. Se leyó la base después del guardado y las siete verificaciones de ese caso resultaron verdaderas.

Evidencia: `docs/testing/platform-ui-report.json`, fixture en `platform-ui-fixture.json` y captura `historical-result-verified.jpg`. Las estadísticas siguen siendo del partido original aunque el plantel actual sea Norte. No se ejecutaron los 87 casos mediante clicks; esos pertenecen a la suite HTTP, y esta comprobación visual verifica el camino corregido del formulario.

El runner detallado rechaza proyectos distintos al autorizado y su CLI requiere una cuenta ficticia QA. No escribir las credenciales en archivos de código ni en informes.
