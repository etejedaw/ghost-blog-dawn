# TODO

## Hecho

1. ✅ `locales/es.json` — commit `83072a0` en `main`. Criterio híbrido: lore (`pergamino`, `Grimorio`, `Aprendiz`) en CTAs/contenido; neutro en aria-labels y auth. Activar en Ghost Admin → Settings → General → Publication language → `es`.

2. 🚧 Docker compose Ghost + MySQL 8 para pruebas locales — en rama `feat/docker-local-dev`, **sin mergear aún**. Render del theme con datos seed **validado el 2026-07-22** (screenshot vía Puppeteer: dark mode, accent púrpura, toggle, textos en `es`, carrusel de featured, 8 posts en feed).
   - `Dockerfile` mínimo que pre-crea `themes/dawn/` en la imagen (workaround para evitar que el bind-mount cree el directorio padre como root y rompa el entrypoint con error de symlink de casper).
   - Stack: Ghost 5-alpine + MySQL 8 (efímero, sin volumen) + Mailpit (SMTP fake con UI en `localhost:8025`, necesario porque Ghost 5.130 dispara 2FA por correo en algunos logins).
   - `npm run populate` orquesta tres subcomandos:
     - `populate:admin` → bootstrap (waitForGhost, setup owner `owner@local.test` / `aprendizlocal`, login, integración `Local Seed`, activación del theme `dawn`, guarda key en `.ghost-local.json` gitignored).
     - `populate:users` → 4 members.
     - `populate:articles` → 7 posts (featured, sin cover, members-only, paid, serie de 3 partes para `series-posts.hbs`, draft) + 1 page.
   - Idempotencia: si `.ghost-local.json` tiene key válida (verificada con `api.users.browse` — el cliente `@tryghost/admin-api` NO expone `integrations`), salta el bootstrap. Si la key es zombie (DB borrada), la descarta y rebootea. Si el owner ya existe pero no hay key, se recupera con login en vez de morir con 403. `populate:articles` compara por título antes de crear (antes duplicaba posts/pages en cada corrida).
   - Branding automático en `populate:admin` (`configureSite`): accent `#8b5cf6`, locale `es`, description. Las settings requieren sesión de staff (la API key de integración recibe 501); solo hace login si detecta drift contra `/admin/site/`.
   - Reset: `docker compose down -v && rm .ghost-local.json`.
   - Gotcha conocido: si Ghost UI muestra el theme "Dawn" del marketplace e intentas instalarlo, falla con `EBUSY` porque el folder está bind-mounteado. La activación automática del script lo evita usando el slug `dawn` directo via API.
   - Gotchas encontrados el 2026-07-22:
     - **2FA de Ghost**: `PUT /session/verify` valida el código; `POST` solo re-envía el email (devuelve 200 engañoso). Además Ghost persiste el flag de sesión verificada de forma asíncrona — el script reintenta `users/me` hasta que la sesión sirva.
     - **Rate limit**: muchos logins/verify seguidos disparan "Too many attempts" (429). Se limpia con `docker compose exec mysql mysql -ughost -pghost ghost -e "DELETE FROM brute;"`.
     - **Build stale**: Ghost sirve `assets/built/` (gitignored); si editas `assets/css`/`js` sin `gulp build`, el sitio local muestra una versión vieja del theme (parece "otro template"). Ahora `npm run populate` corre `gulp build` primero (hook `prepopulate`).
     - **"dawn (v1.0.0)" en el admin ES el fork** (name/version del `package.json`, heredados del upstream). La pestaña "Official themes" de Change theme solo lista el marketplace; el fork aparece en "Installed". El rename a `dawn-grimorio` de `main` elimina la ambigüedad al mergear (ajustar `THEME_NAME` en `scripts/populate/config.js` y el mount de `docker-compose.yml` juntos).
   - Tooling: `tmp/` (gitignored) tiene `puppeteer-core` para inspección visual con el Chrome del sistema (`executablePath: /Applications/Google Chrome.app/...`).

## Pendiente

3. Revisar `npm audit` — 13 vulnerabilidades reportadas después de instalar `@tryghost/admin-api` (4 moderate, 7 high, 2 critical). Confirmar si afectan a runtime del theme o solo a las herramientas de seed locales.

4. Evaluar qué customizaciones del theme pueden migrarse a Ghost Admin (custom theme settings o code injection) en lugar de hardcodearse en `.hbs` / `main.js`. Repasar el listado de "Cambios respecto al tema original" del README y marcar cuáles son candidatos.
