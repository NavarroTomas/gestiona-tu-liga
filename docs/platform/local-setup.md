# Ejecutar la plataforma inicial

Requisitos: Node 22 o superior, dependencias del lockfile y un proyecto Supabase dedicado. Stack web: Next.js App Router + TypeScript + React + Tailwind/CSS Modules. Backend compartido: Supabase Postgres/Auth/Storage. Android: Flutter/Dart con supabase_flutter, todavía pendiente de implementación.

1. Ejecutar `npm ci`.
2. Copiar `.env.example` a `.env.local` y completar URL y clave publicable. No subir ese archivo a Git.
3. Para un proyecto vacío, revisar y aplicar `supabase/schema/platform-v1.sql`. En el proyecto de esta tesis ya está aplicado.
4. Configurar en Supabase Auth el Site URL y los redirect URLs del despliegue y del desarrollo. Mantener confirmación de correo habilitada; probar entrega con un correo que controles.
5. Ejecutar `npm run dev -- --webpack --port 3001`. Visitar `http://localhost:3001`.

## Verificaciones

`npm run test:platform`: fixtures, posiciones, reparto, validaciones, borradores y límites SQL estáticos. `npm run typecheck`: TypeScript. La prueba transaccional `supabase/tests/platform-security.sql` se ejecuta con un rol administrador en SQL Editor y revierte sus datos.

`scripts/platform-smoke.cjs` realiza integración con una cuenta QA ya confirmada. Requiere `GTL_QA_EMAIL` y `GTL_QA_PASSWORD` como variables de entorno y la configuración pública en `.env.local`. Ejecutar `node scripts/platform-smoke.cjs`; crea ligas ficticias separadas y las conserva para revisión. No usar sobre un proyecto ajeno ni un usuario real. Informe de la ejecución comprobada: `docs/testing/platform-smoke-report.json`.

Producción verificada con `next build --webpack`. En este equipo se utilizó `NEXT_DIST_DIR=.next-build` para separar la salida del servidor de desarrollo. El primer intento desde la terminal restringida falló con EPERM; el proceso local de Node completó el build con código 0. El build predeterminado con Turbopack todavía no se considera validado.

## Rutas nuevas

| Ruta | Uso |
| --- | --- |
| `/` | Landing comercial inicial |
| `/demo` | Liga ficticia de ejemplo, solo lectura |
| `/registro`, `/crear-liga` | Preguntas y creación de cuenta/liga |
| `/login`, `/recuperar` | Acceso y recuperación |
| `/mis-ligas` | Ligas del organizador |
| `/panel/[leagueId]` | Gestión de liga |
| `/l/[slug]` | Página deportiva pública |

Las rutas históricas APA siguen presentes; no forman parte del nuevo recorrido y necesitan una limpieza/migración posterior. No se publicó un despliegue comercial. Antes de comercializar, resolver branding, términos reales, soporte/correo, backups, hosting comercial y validación completa en dispositivos.
