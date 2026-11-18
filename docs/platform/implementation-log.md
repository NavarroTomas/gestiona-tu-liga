# Bitácora de implementación — 18/11/2026

## Alcance

Rama `feat/platform-foundation-20261118`, desde `4c426d8`. Se trabajó en una copia separada para conservar el trabajo local sin confirmar que ya existía en el equipo del usuario. No se sobrescribió el repositorio original ni se integró la rama a main.

Se reemplazó el recorrido público inicial por landing, ejemplo de solo lectura, ingreso real, preguntas sobre fondo negro y creación transaccional de liga. Se agregó panel con equipos, jugadores, partidos, estadísticas, noticias y configuración. La vista pública consulta los mismos datos. Identidad provisional: Tu liga; diseño con tipografía de sistema, fondo claro, contraste alto y personalización de colores. Sin imágenes generadas por IA.

## Archivos y responsabilidades

| Ubicación | Cambio |
| --- | --- |
| `src/app/page.tsx` | Landing con propuesta, ejemplo y CTA hacia el registro |
| `src/components/platform-v1/Onboarding.tsx` | Siete preguntas, borrador sin contraseña, confirmación de correo y creación |
| `src/components/platform-v1/Access.tsx`, `ui.tsx` | Sesión, ingreso, recuperación y elementos compartidos |
| `src/components/platform-v1/Manager.tsx` | Panel, permisos, resumen y navegación |
| `Entities.tsx`, `MatchesManager.tsx`, `NewsManager.tsx`, `Settings.tsx` | Formularios y operaciones de gestión |
| `PublicLeague.tsx`, `LeagueViews.tsx` | Liga pública, tablas y resultados |
| `src/lib/platform/client.ts`, `api.ts` | Configuración Supabase y contrato de operaciones |
| `src/lib/platform/domain.ts`, `types.ts` | Modelos, validaciones, fixtures, estadísticas y reparto |
| `src/lib/platform/example.ts` | Datos ficticios exclusivos de `/demo` |
| `src/app/platform-global.css`, `platform.module.css` | Diseño y corrección de estilos heredados |
| `supabase/schema/platform-v1.sql` | Bootstrap, constraints, RLS, RPC y Storage |
| `supabase/tests/platform-security.sql` | Pruebas transaccionales con rollback |
| `scripts/platform-smoke.cjs` | Integración repetible con cuenta QA confirmada |
| `tests/platform-domain.cjs` | Reglas deportivas y validaciones |

Se quitó la descarga de Inter mediante next/font/google para que el build no dependa de acceso a Google Fonts. Se mantuvo una variable de fuente con fallback de sistema para las rutas heredadas. `NEXT_DIST_DIR` permite separar compilación y desarrollo. `.env.example` documenta la configuración; `.env.local` nunca se incluye en Git.

## Evidencia de verificación

| Comprobación | Resultado |
| --- | --- |
| TypeScript | Aprobado |
| Dominio | Ocho grupos aprobados |
| Integración Supabase real | 25 comprobaciones aprobadas; informe JSON en `docs/testing` |
| Seguridad SQL ejecutada | PASS; datos temporales revertidos |
| ESLint focalizado | Sin errores; dos advertencias sobre setState en efectos |
| Build producción Webpack | Código de salida 0; se recuperó el fallo EPERM inicial |
| UI escritorio | Landing → preguntas → login QA → resumen recuperado → liga creada → dos equipos → fixture → 2–1 → tabla pública con 3/0 puntos |
| UI móvil web | Liga pública revisada a 390 × 844; navegación horizontal de secciones y tabla desplazable |

Capturas en `docs/testing/landing-desktop.jpg`, `public-league-desktop.jpg` y `public-league-mobile.jpg`. Son datos ficticios, sin credenciales. El build predeterminado Turbopack no está validado. La prueba desde un correo real llega a confirmación pendiente; no se comprobó la recepción ni el retorno desde el enlace.

## Dudas y trabajo pendiente

- Nombre e identidad definitiva.
- Política de desempates, sanciones y requisitos de publicación de imágenes de jugadores.
- Formatos eliminatorios y combinados; reglas de clasificación.
- Gestión completa de temporadas y divisiones, ascensos y descensos.
- Correo de autenticación, URLs de retorno en producción y deep links Android.
- Limpieza de imágenes reemplazadas y estrategia de backups/restauración.
- Limpieza de rutas APA antiguas y revisión completa antes del despliegue público.
- App Flutter, instalación de APK y prueba de sincronización entre plataformas.
- Documentación académica completa y validación con el modelo del profesor.

La documentación usa estados verificables; ninguna tarea móvil o entrega académica se da por terminada por haber preparado el contrato o el esquema.
