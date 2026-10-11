# Sincronizador APA Bot → Supabase

El sincronizador recibe el JSON generado por el exportador del bot.

## Simulación

```powershell
node scripts/apa-bot-sync.mjs ..\..\outputs\apa-public-export.json --season="Temporada 5"
```

La simulación solo imprime un informe. No necesita credenciales y no modifica
Supabase.

## Aplicación real

Solo cuando el informe haya sido revisado, ejecutar desde un entorno backend con
`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` privados:

```powershell
$env:SUPABASE_URL = "..."
$env:SUPABASE_SERVICE_ROLE_KEY = "..."
node scripts/apa-bot-sync.mjs export.json --season="Temporada 5" --apply
```

La aplicación crea o actualiza clubes y plantillas. Las liberaciones confirmadas
marcan la plantilla como `baja`; los fichajes se registran en el informe hasta
que exista una tabla pública de historial de transferencias en la web.
