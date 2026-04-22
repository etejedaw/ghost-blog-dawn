# ghost-blog-dawn

Fork personalizado del tema [Dawn](https://github.com/TryGhost/Dawn) para [blog.etejeda.dev](https://blog.etejeda.dev).

## Cambios respecto al tema original

- **Posts por pagina:** 10 (original: 5)
- **Estrella en destacados:** Solo visible en posts marcados como featured (original: oculta en posts publicos)
- **Boton Share:** Visible solo en posts, no en pages. Estilo con borde redondeado
- **Imagen de tag:** No se muestra en la pagina del tag (se mantiene para metadatos/SEO)
- **Paleta de colores:** Alineada con [etejeda.dev](https://etejeda.dev) (purpura como acento, fondos oscuros suavizados para lectura)
- **Fuente:** Inter en lugar de Mulish

## Configuracion en Ghost Admin

- **Accent color:** `#8b5cf6` (Settings > Design > Brand)

## Deploy

El tema se deploya automaticamente a Ghost al hacer push a `main` via GitHub Actions (`TryGhost/action-deploy-theme`).

Los secrets necesarios en el repo:
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

## Licencia

[MIT](LICENSE) (heredada del tema original).
