Plan de entrega y seguimiento
Plataforma de ligas de fútbol · Responsable: Tomás Navarro · Corte de avance: 18/11/2026
# Objetivo y forma de trabajo
El 1 de diciembre se enviarán al profesor la web, la app Android y la documentación para validación. La fecha de defensa será confirmada posteriormente. El 30 de noviembre queda como margen de correcciones. Los días son un orden de ejecución: se puede avanzar al siguiente bloque cuando su dependencia esté lista, sin esperar al calendario.
Cada tarea se marca por evidencia. ☑ COMPROBADO: se ejecutó y se confirmó su resultado. ◐ IMPLEMENTADO: el archivo o la función existe, pero falta comprobar el recorrido real. ☐ PENDIENTE: todavía no se terminó. ⚠ BLOQUEADO: hay un impedimento identificado. Una pantalla escrita no equivale a una función validada.
Distribución principal: el asistente desarrolla web, base compartida y pruebas; Navarro trabaja en Flutter, redacción académica, reglas del producto y pruebas de uso. Antes de dividir tareas se acuerdan tablas, tipos, operaciones y errores. Cada bloque entrega resumen, archivos, evidencia y pendientes.
# Estado del bloque técnico del 18 de noviembre
- ☑ Se comprobó el commit base de GitHub: 4c426d8ee237cdd11ac7c366d097ebcdf84f46df.
- ☑ Se creó una rama local separada: feat/platform-foundation-20261118. Se conservaron los cambios sin subir de la copia original.
- ☑ Se identificó en el navegador el proyecto nuevo de la cuenta unpicaditogg@gmail.com: ilkkqynzvwskpwjgtapi. El editor de tablas mostraba una base pública vacía.
- ☑ El bootstrap SQL aplicado a ese proyecto devolvió “Success. No rows returned”. Incluye tablas, permisos, funciones y almacenamiento de imágenes.
- ☑ TypeScript finalizó sin errores después de incorporar los módulos nuevos.
- ☑ Pasaron siete grupos de pruebas de lógica: fixture, posiciones, ranking individual, validación de resultados, reparto de equipos, formulario inicial y verificaciones estáticas del SQL.
- ◐ Se escribieron la landing, el formulario animado, acceso real, Mis ligas, página pública y administración básica.
- ◐ Se lanzó la prueba SQL de permisos y aislamiento con datos transaccionales. No se obtuvo una lectura final de su resultado.
- ⚠ El build de producción se inició, pero su resultado no se pudo recuperar. No está registrado como aprobado.
- ⚠ Falta configurar la URL y la clave publicable en el entorno local, comprobar confirmación de correo y realizar la prueba completa de cuenta y liga.
- ⚠ Una actualización de la configuración del entorno agregó rutas Linux a la sesión Windows. Desde entonces fallan terminal, edición local y navegador. Se continuó la documentación por Google Docs.
# Día 1 — Miércoles 18/11: base y alcance
- ☑ Identificar repositorio y commit de trabajo.
- ☑ Proteger la copia original y aislar los cambios de esta implementación.
- ☑ Leer las instrucciones del repositorio y la documentación de componentes de la versión instalada de Next.js.
- ☑ Confirmar que la demo local no representa autenticación ni persistencia remota.
- ☑ Leer la guía institucional y revisar la estructura del ejemplo académico.
- ☐ Completar la auditoría funcional de todos los módulos heredados y registrar dependencias concretas de APA.
- ☐ Guardar capturas iniciales de los recorridos principales para documentar la evolución.
- ☐ Definir el catálogo completo de formatos con estado, prioridad y criterio de aceptación.
Salida del día: proyecto ejecutable, alcance verificable y pendientes ordenados. El día no se considera cerrado solo por haber escrito código.
# Día 2 — Jueves 19/11: datos, seguridad y contrato
- ☑ Diseñar un modelo inicial con ligas, administradores, temporadas, divisiones, competencias, equipos, jugadores, partidos, participaciones y noticias.
- ☑ Crear relaciones compuestas para impedir asociaciones entre registros de ligas diferentes.
- ☑ Aplicar el bootstrap SQL al proyecto nuevo.
- ◐ Implementar políticas de lectura pública y escritura restringida a administradores.
- ◐ Implementar creación de liga idempotente: reintentar no debe duplicar una liga.
- ◐ Implementar guardado conjunto de resultado y estadísticas mediante RPC.
- ☐ Confirmar el resultado de la prueba SQL con dos organizadores y un visitante.
- ☐ Revisar asesores de seguridad y corregir los hallazgos relevantes.
- ☐ Generar el historial de migraciones con CLI cuando esté disponible. El archivo actual es un bootstrap versionado, no una migración registrada por CLI.
- ☐ Validar el contrato de datos con Navarro antes de conectar Flutter.
Salida del día: dos cuentas con ligas separadas; lectura pública permitida; escrituras cruzadas denegadas. El correo y las membresías deben permanecer privados.
# Día 3 — Viernes 20/11: cuenta y creación de liga
- ◐ Rediseñar landing con llamadas a crear cuenta y ejemplo ficticio identificable.
- ◐ Implementar formulario negro con siete pasos, transiciones, anterior, validación y estado de carga.
- ◐ Guardar solo respuestas de configuración como borrador; nunca guardar contraseña en el borrador.
- ◐ Conectar registro e inicio de sesión con Supabase Auth.
- ◐ Preparar el caso de correo pendiente y la recuperación de contraseña.
- ◐ Crear temporada, división y competencia iniciales junto con la liga, en una operación.
- ☐ Configurar las variables públicas del proyecto correcto.
- ☐ Verificar envío y confirmación de correo con la configuración real; resolver SMTP si es necesario.
- ☐ Probar recarga, retroceso, cierre de sesión, segundo navegador y reintento de creación.
- ☐ Crear el proyecto Flutter, confirmar que corre en Android y conectar su inicio de sesión.
Control obligatorio: registrar una cuenta, confirmar acceso y abrir la misma liga desde otro navegador. Ante un bloqueo, priorizar este recorrido antes de ampliar formatos.
# Día 4 — Sábado 21/11: equipos y jugadores
- ◐ Formularios de alta y edición de equipos, con nombre y abreviatura.
- ◐ Formularios de jugadores, posición y asignación a un equipo.
- ◐ Carga de escudos y fotos con validación de formato y límite de 2 MB.
- ◐ Búsqueda y listados en el panel; vista de equipos y jugadores en la página pública.
- ◐ Confirmación de eliminación y rechazo de relaciones que impidan borrar un registro.
- ☐ Probar CRUD real con cuatro equipos y sus jugadores ficticios.
- ☐ Probar nombres largos, vacíos, duplicados, archivos inválidos y errores de conexión.
- ☐ Revisar historial de planteles para que futuros cambios de equipo no alteren partidos ya registrados.
- ☐ Conectar listas y formularios iniciales de Flutter al mismo contrato.
Salida del día: participantes guardados en Supabase y visibles desde la web pública y la app.
# Día 5 — Domingo 22/11: partidos y calendario
- ◐ Alta manual de partidos con fecha, hora, cancha y número de jornada.
- ◐ Generación de todos contra todos de una rueda e ida y vuelta.
- ☑ Pruebas de lógica con cantidades pares e impares, parejas únicas y ausencia de cruces simultáneos por fecha.
- ◐ Prevención de generación repetida de fixture cuando ya existen partidos.
- ◐ Edición de programación sin alterar el resultado registrado.
- ☐ Validar fixture real con los permisos de un organizador autenticado.
- ☐ Confirmar el uso de hora argentina en creación y consulta.
- ☐ Completar vista de calendario por fecha y filtros útiles.
- ☐ Agregar consulta de partidos y detalle inicial en Flutter.
Salida del día: una jornada completa programada, consultable y editable desde su panel.
# Día 6 — Lunes 23/11: resultados y estadísticas
- ◐ Carga de marcador, participantes, goles, asistencias, tarjetas y nota manual de 1 a 10.
- ◐ Guardado atómico mediante save_match_result; escrituras directas de marcador y participaciones restringidas.
- ☑ Pruebas de reemplazo de resultado, empate 0-0, reglas de puntos personalizadas y exclusión de partidos pendientes.
- ☑ Pruebas contra participantes repetidos, datos de otra liga y goles o asistencias superiores al marcador.
- ◐ Anulación de resultado con retiro de estadísticas; eliminación de partido con sus participaciones.
- ☐ Comprobar estas operaciones contra Supabase y verificar que los fallos reviertan todos los cambios.
- ☐ Implementar carga y edición de resultados desde Flutter.
- ☐ Probar resultado cargado en app y consultado en web, y el recorrido inverso.
Salida del día: edición sin duplicación de estadísticas y coincidencia de resultados entre ambos clientes.
# Día 7 — Martes 24/11: identidad, noticias y grupo de amigos
- ◐ Edición de nombre, descripción, colores y logo de liga.
- ◐ Ajuste de contraste del texto frente al color principal configurado.
- ◐ Noticias con borrador/publicación, imagen, edición y eliminación.
- ◐ Página pública con próximos partidos, resultados, posiciones, jugadores y noticias.
- ◐ Sorteo aleatorio y reparto equilibrado por nota media; valor inicial 5 para jugadores sin historial.
- ☑ Pruebas del reparto: participantes únicos, tamaños parejos y diferencia máxima de una persona con cantidades impares.
- ◐ Preparar participaciones por partido para equipos variables y ranking individual por puntos.
- ☐ Validar liga entre amigos completa con dos partidos y compañeros distintos.
- ☐ Probar creación de un administrador adicional y rechazo de esa operación por un administrador que no sea creador.
Salida del día: dos modalidades comprobadas y una liga con identidad y contenido propios.
# Día 8 — Miércoles 25/11: app Android
- ☐ Confirmar estructura de proyecto, navegación, modelos y servicios.
- ☐ Mis ligas, selección de contexto y cierre de sesión.
- ☐ Gestión de equipos y jugadores con validaciones.
- ☐ Gestión de partidos y carga de resultados con sus participantes.
- ☐ Gestión de noticias e imágenes.
- ☐ Estados de carga, vacío, error, reintento y guardado.
- ☐ Control de acceso usando las mismas políticas de base.
- ☐ Generar APK inicial e instalarla en un teléfono Android.
- ☐ Ejecutar flutter analyze y las pruebas relevantes del proyecto.
Salida del día: APK instalable con el recorrido básico completo. La configuración avanzada de torneos tiene prioridad posterior dentro del desarrollo móvil.
# Día 9 — Jueves 26/11: formatos y presentación comercial
- ☐ Elegir el nombre comercial y elaborar identidad visual coherente entre web y app.
- ☐ Revisar en conjunto la primera propuesta visual y sus textos.
- ☐ Sustituir el ejemplo ilustrativo por capturas reales cuando el recorrido esté comprobado.
- ☐ Verificar que toda llamada a la acción lleve a una acción disponible.
- ☐ Revisar el catálogo: liga, grupos con eliminatorias, eliminación directa, playoffs, doble eliminación y suizo.
- ☐ Reutilizar módulos heredados que resulten compatibles y probar cada formato agregado.
- ☐ Completar gestión de temporadas y divisiones; el bootstrap actual crea solo la estructura inicial.
- ☐ Ajustar el alcance restante con evidencia de avance, sin publicar formatos aún no comprobados.
Salida del día: presentación comercial coherente con la versión disponible y catálogo de formatos con estados reales.
# Día 10 — Viernes 27/11: integración y borrador académico
- ☐ Probar dos organizadores y varias ligas desde ambos clientes.
- ☐ Probar acceso de visitante, datos públicos y privacidad de cuentas.
- ☐ Probar manipulación de IDs, relaciones cruzadas y accesos de administración.
- ☐ Comprobar imágenes, enlaces públicos y comportamiento tras recargar.
- ☐ Completar borrador académico siguiendo la estructura institucional.
- ☐ Incorporar viabilidad, público objetivo, competidores y FODA con fuentes reales.
- ☐ Incorporar arquitectura, mapa de datos, capturas y evidencia de pruebas.
- ☐ Preparar cinco propuestas de mejora con sus campos solicitados.
- ☐ Cerrar incorporación de funciones nuevas; concentrar el trabajo restante en corrección y entrega.
Salida del día: documento completo para revisar y lista única de defectos pendientes, con prioridad y responsable.
# Día 11 — Sábado 28/11: corrección y revisión
- ☐ Resolver defectos que impidan registro, acceso, administración o consulta.
- ☐ Revisar celular, escritorio, navegación por teclado y movimiento reducido.
- ☐ Revisar consistencia de colores y legibilidad de tablas y formularios.
- ☐ Repetir las pruebas afectadas por correcciones.
- ☐ Ejecutar build de producción y controles de tipos y calidad pertinentes.
- ☐ Revisar autenticación, recuperación y respaldo conforme a los requisitos del docente.
- ☐ Corregir documentación, nombres de capturas y referencias.
- ☐ Preparar la demostración y anotar limitaciones conocidas.
Salida del día: versión candidata a entrega sin defectos críticos conocidos.
# Día 12 — Domingo 29/11: entrega preparada
- ☐ Confirmar despliegue accesible para la validación académica.
- ☐ Configurar URLs de autenticación del despliegue definitivo y probarlas.
- ☐ Generar APK final, instalarla y repetir el recorrido de demostración.
- ☐ Preparar una liga de ejemplo identificada y separada de las ligas de usuarios.
- ☐ Guardar respaldo de datos y comprobar el procedimiento de restauración.
- ☐ Registrar commits, versión de entrega y estado de los repositorios.
- ☐ Exportar y revisar el documento académico y sus anexos.
- ☐ Ensayar la presentación con el mismo dispositivo y datos de la entrega.
Salida del día: web, APK y documentación listas para enviar. El 30/11 se utiliza para imprevistos; el 01/12 se envía al profesor.
# Después de la validación académica
Durante los quince días posteriores se priorizan pruebas con organizadores, correcciones de uso, rendimiento y preparación comercial. Antes de comercializar se revisará el alojamiento o plan: Vercel Hobby no debe darse por aprobado para uso comercial. Los límites gratuitos, el plan premium y los formatos adicionales se decidirán con el producto validado.
# Bloqueos y próxima reanudación
Primero recuperar la ejecución Windows. Luego: recuperar el resultado del build y de SQL, revisar que no hayan quedado datos de prueba, obtener la configuración publicable del proyecto correcto, crear .env.local sin secretos de servidor, iniciar la vista local y probar una cuenta y liga completas. No reejecutar el bootstrap ya aplicado: revisar primero el esquema existente.
La web todavía no se considera conectada ni validada de punta a punta. No se creó un commit ni se subió la rama. Los archivos escritos están en E:\CODEX\2026-11-18\new-chat\work\gtl-build. La copia original de E:\Codigos\GESTOR-LIGAS\crea-tu-liga permanece intacta.

Avance comprobado — 18/11/2026
☑ Proyecto Supabase nuevo conectado a la implementación, con variables locales excluidas de Git.
☑ Esquema inicial aplicado y prueba SQL de seguridad aprobada con rollback de datos temporales.
☑ 25 comprobaciones de integración real aprobadas; dos ligas QA con participantes ficticios disponibles para revisión.
☑ Landing y siete pasos del formulario navegados; inicio de sesión de prueba comprobado y respuestas conservadas.
☑ Verificación TypeScript aprobada. Pruebas de dominio aprobadas. ESLint de la implementación: cero errores y dos advertencias.
◐ Creación de cuenta real responde correctamente y requiere confirmar el email. Falta verificar recepción y retorno desde el correo.
◐ Compilación de producción en revisión por permisos de escritura de carpetas de salida. No se marca como terminada.
☐ Compilar APK Android, completar las pantallas Flutter y validar el mismo recorrido con la base compartida.
☐ Completar formatos eliminatorios y combinados, gestión de múltiples temporadas/divisiones y branding definitivo.

☑ Compilación de producción Webpack aprobada con código 0; reemplaza el estado anterior en revisión.
☑ Recorrido desde navegador aprobado hasta crear liga, cargar dos equipos ficticios, generar fixture y guardar resultado 2–1.
☑ Ocho grupos de pruebas de dominio, incluyendo borradores inválidos, aprobados.
☑ Contrato Flutter, modelo de datos y guía de ejecución guardados junto al código.

☑ Código y documentación respaldados en GitHub: rama feat/platform-foundation-20261118, commit de implementación c232779. Main permanece sin integrar.
☑ Resultado 2–1 y tabla pública 3/0 puntos comprobados en navegador; liga revisada en ancho móvil de 390 px. Capturas en docs/testing.
☐ Merge y despliegue: todavía pendientes; no se da por publicada la plataforma.
