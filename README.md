# ghost-blog-dawn

Fork personalizado del tema [Dawn](https://github.com/TryGhost/Dawn) para [blog.etejeda.dev](https://blog.etejeda.dev).

## Cambios respecto al tema original

- **Posts por pagina:** 10 (original: 5)
- **Estrella en destacados:** Visible en todos los posts marcados como featured, sin importar visibilidad (original: oculta o inconsistente)
- **Boton Share:** Visible solo en posts, no en pages. Estilo propio con borde redondeado
- **Imagen de tag:** Oculta en la pagina del tag (se mantiene para metadatos/SEO)
- **Tabla de contenidos (TOC):** Generada automaticamente para posts a partir de los headings, con setting custom para activar/desactivar y breakpoint controlado para evitar overlap con imagenes anchas
- **Paleta de colores:** Alineada con [etejeda.dev](https://etejeda.dev) (`#8b5cf6` purpura como acento)
- **Fuente:** Inter (en lugar de Mulish, removida del bundle)
- **Lora con `font-display: swap`** para evitar FOIT
- **Light mode:** Background del navbar igualado al body
- **Dark mode:** Backgrounds suavizados para lectura nocturna comoda y contraste de grises ajustado para cumplir WCAG AA
- **Theme toggle manual:** Boton sol/luna en el header con persistencia entre navegacion (se resetea al recargar la pagina). Override del `prefers-color-scheme` del SO
- **Setting custom `show_reading_time`:** Permite ocultar el tiempo de lectura desde Ghost Admin
- **Lazy loading** en imagenes del carrusel de featured posts
- **JSON-LD BlogPosting schema** inyectado en cada post para rich snippets en buscadores
- **`error.hbs`** y **`error-404.hbs`:** Paginas de error propias en espanol con CTA de retorno y buscador, en lugar del fallback generico de Ghost
- **Seccion "Pero quizá te interesen estos posts"** en errores: muestra 3 posts destacados (con fallback a posts recientes)
- **Sin jQuery:** Removido del bundle (jQuery 3.5.1 desde CDN, ~87kb)
- **Sin Owl Carousel:** Reemplazado por scroll-snap CSS nativo + ~50 lineas de JS vanilla. Botones prev/next con estado disabled, swipe nativo en movil
- **`aria-label`** agregado a botones de navegacion del carrusel de featured
- **`aria-expanded`** sincronizado en el boton de menu hamburguesa (movil) para anunciar estado a lectores de pantalla
- **`aria-pressed`** y `aria-label` dinamico en el boton de theme toggle ("Cambiar a tema claro/oscuro" segun estado)
- **Share hibrido:** En desktop se muestran botones rapidos de WhatsApp y Telegram al lado del boton Share (que abre el modal de Ghost con Twitter/Facebook/LinkedIn/Bluesky/Copy link). En movil/tablet, el boton Share dispara la hoja nativa del SO (`navigator.share`) y los botones rapidos se ocultan
- **Barra de progreso de lectura:** Linea fina arriba del viewport (color accent) que se llena conforme el lector avanza por el cuerpo del post. Solo en posts

## Configuracion en Ghost Admin

- **Accent color:** `#8b5cf6` (Settings > Design > Brand)
- **Theme settings disponibles** (Settings > Design > Site-wide):
  - Navigation layout (Logo on the left/middle/Stacked)
  - Title font / Body font (sans-serif moderno o serif elegante)
  - Color scheme (Auto/Light/Dark)
  - Logo blanco para dark mode
  - Mostrar featured posts en home + titulo personalizable
  - Mostrar autor / reading time / related posts en cada post

## Deploy

Deploy automatico via GitHub Actions al hacer push a `main` (`.github/workflows/deploy-theme.yml`).

- Usa `TryGhost/action-deploy-theme@v1.6.6`
- Cache de npm habilitado en `actions/setup-node@v4` para builds mas rapidos

Secrets requeridos:
- `GHOST_ADMIN_API_URL`
- `GHOST_ADMIN_API_KEY`

## Desarrollo

```bash
npm install
npm run dev
```

Los archivos CSS source estan en `/assets/css/` y se compilan con Gulp a `/assets/built/`.

## Upstream

Fork de [TryGhost/Dawn](https://github.com/TryGhost/Dawn). Para traer actualizaciones:

```bash
git remote add upstream https://github.com/TryGhost/Dawn.git
git fetch upstream
git merge upstream/main
```

Algunos archivos divergen significativamente del upstream (`assets/js/main.js`, `partials/featured-posts.hbs`, `default.hbs`, multiples CSS): esperar conflictos al mergear.

## Licencia

[MIT](LICENSE) (heredada del tema original).
