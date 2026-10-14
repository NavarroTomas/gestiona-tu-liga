# Adaptación local sobre APA

La landing Plantilla 1, el acceso de prueba y Mis ligas son la entrada a la plataforma. Abrir una liga selecciona su contexto y dirige a /liga, que renderiza HomeLeaguePortal, la portada original.

Se reutilizan las rutas /fixture, /divisiones, /clubes, /jugadores y /admin, con los gestores originales de clubes, plantillas, noticias y partidos. La ruta previa /mis-ligas/[leagueId] solo redirige a /liga y conserva compatibilidad con enlaces anteriores.

localLeagueClient adapta las consultas de la capa Supabase al almacenamiento del navegador para la liga seleccionada. Cada liga tiene una clave gtl:apa:league:<id>:v1. Al entrar por primera vez migra los equipos, jugadores, partidos y noticias cargados en la demo anterior, sin borrar sus copias.

La sesión de demostración y los permisos simulados solo tienen efectos sobre los datos locales. No autentican contra la base real. En modo local, operaciones RPC no adaptadas fallan expresamente; nunca se reenvían al servidor real. La conexión real permanece sin configurar y no se cambió ninguna tabla remota.

Pendiente: verificar y adaptar todos los módulos avanzados de editor visual, permisos reales, integraciones y formatos especiales.

Verificaciones: npm run typecheck; npm run test:original-league.
