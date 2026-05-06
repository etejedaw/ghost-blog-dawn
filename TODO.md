# TODO

## Hecho

1. ✅ `locales/es.json` — commit `83072a0` en `main`. Criterio híbrido: lore (`pergamino`, `Grimorio`, `Aprendiz`) en CTAs/contenido; neutro en aria-labels y auth. Activar en Ghost Admin → Settings → General → Publication language → `es`.

2. 🚧 Docker compose Ghost + MySQL 8 para pruebas locales — en rama `feat/docker-local-dev`, **sin mergear aún** (falta validar render del theme con datos seed).
   - `Dockerfile` mínimo que pre-crea `themes/dawn/` en la imagen (workaround para evitar que el bind-mount cree el directorio padre como root y rompa el entrypoint con error de symlink de casper).
   - Stack: Ghost 5-alpine + MySQL 8 (efímero, sin volumen) + Mailpit (SMTP fake con UI en `localhost:8025`, necesario porque Ghost 5.130 dispara 2FA por correo en algunos logins).
   - `npm run populate` orquesta tres subcomandos:
     - `populate:admin` → bootstrap (waitForGhost, setup owner `owner@local.test` / `aprendizlocal`, login, integración `Local Seed`, activación del theme `dawn`, guarda key en `.ghost-local.json` gitignored).
     - `populate:users` → 4 members.
     - `populate:articles` → 7 posts (featured, sin cover, members-only, paid, serie de 3 partes para `series-posts.hbs`, draft) + 1 page.
   - Idempotencia: si `.ghost-local.json` tiene key válida (verificada contra `/admin/integrations/`), salta el bootstrap. Si la key es zombie (DB borrada), la descarta y rebootea.
   - Reset: `docker compose down -v && rm .ghost-local.json`.
   - Gotcha conocido: si Ghost UI muestra el theme "Dawn" del marketplace e intentas instalarlo, falla con `EBUSY` porque el folder está bind-mounteado. La activación automática del script lo evita usando el slug `dawn` directo via API.

## Pendiente

3. Revisar `npm audit` — 13 vulnerabilidades reportadas después de instalar `@tryghost/admin-api` (4 moderate, 7 high, 2 critical). Confirmar si afectan a runtime del theme o solo a las herramientas de seed locales.

4. Evaluar qué customizaciones del theme pueden migrarse a Ghost Admin (custom theme settings o code injection) en lugar de hardcodearse en `.hbs` / `main.js`. Repasar el listado de "Cambios respecto al tema original" del README y marcar cuáles son candidatos.
