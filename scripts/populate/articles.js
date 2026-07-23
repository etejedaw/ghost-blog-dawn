const GhostAdminAPI = require('@tryghost/admin-api');
const {GHOST_URL} = require('./config');
const state = require('./state');

const api = new GhostAdminAPI({
    url: GHOST_URL,
    key: state.getApiKey(),
    version: 'v5.0',
});

const posts = [
    {
        title: 'Bienvenido al Grimorio Local',
        html: '<p>Pergamino destacado de prueba con imagen de portada.</p><p>Aquí va contenido de muestra para validar el render del feature image, la card destacada y el TOC.</p><h2>Una sección</h2><p>Texto bajo encabezado para que aparezca el TOC si está activo.</p>',
        feature_image: 'https://picsum.photos/seed/grimorio-1/1600/900',
        featured: true,
        visibility: 'public',
        tags: ['Bienvenida'],
        status: 'published',
    },
    {
        title: 'Pergamino sin portada',
        html: '<p>Texto plano sin imagen destacada para validar el layout sin cover.</p><p>Otro párrafo para tener algo de extensión.</p>',
        visibility: 'public',
        tags: ['Notas'],
        status: 'published',
    },
    {
        title: 'Susurros para miembros',
        html: '<p>Contenido oculto para no-miembros. Aquí debería aparecer el CTA de Portal.</p><p>Cuando un miembro inicia sesión, debería verse el contenido completo.</p>',
        feature_image: 'https://picsum.photos/seed/grimorio-2/1600/900',
        visibility: 'members',
        tags: ['Notas'],
        status: 'published',
    },
    {
        title: 'Capítulo arcano para suscriptores de pago',
        html: '<p>Contenido oculto para no-miembros pagados. Debería aparecer el CTA de upgrade.</p>',
        feature_image: 'https://picsum.photos/seed/grimorio-3/1600/900',
        visibility: 'paid',
        tags: ['Notas'],
        status: 'published',
    },
    {
        title: 'Serie del Aprendiz — Parte I',
        html: '<p>Primer capítulo de una serie de pergaminos. Sirve para probar series-posts.hbs.</p>',
        feature_image: 'https://picsum.photos/seed/grimorio-s1/1600/900',
        tags: ['Serie del Aprendiz'],
        status: 'published',
    },
    {
        title: 'Serie del Aprendiz — Parte II',
        html: '<p>Segundo capítulo de la serie del aprendiz.</p>',
        feature_image: 'https://picsum.photos/seed/grimorio-s2/1600/900',
        tags: ['Serie del Aprendiz'],
        status: 'published',
    },
    {
        title: 'Serie del Aprendiz — Parte III',
        html: '<p>Tercer capítulo: a partir de aquí series-posts debería aparecer (necesita 3+ posts con el mismo primary tag).</p>',
        feature_image: 'https://picsum.photos/seed/grimorio-s3/1600/900',
        tags: ['Serie del Aprendiz'],
        status: 'published',
    },
    {
        title: 'Borrador a la luz de la vela',
        html: '<p>Este pergamino está en borrador y no debe aparecer en listados públicos.</p>',
        status: 'draft',
    },
];

const pages = [
    {
        title: 'Acerca del Grimorio',
        html: '<p>Página de prueba para validar el template page.hbs.</p>',
        status: 'published',
    },
];

async function add(items, type, existing) {
    const label = type === 'posts' ? 'Post' : 'Page';
    for (const item of items) {
        if (existing.has(item.title)) {
            console.log(`- ${label} already exists: ${item.title}`);
            continue;
        }
        try {
            await api[type].add(item, {source: 'html'});
            console.log(`✓ ${label}: ${item.title}`);
        } catch (err) {
            const msg = err.context || err.message || String(err);
            console.error(`✗ ${type} "${item.title}": ${msg}`);
        }
    }
}

async function existingTitles(type) {
    const items = await api[type].browse({limit: 'all', filter: 'status:[published,draft,scheduled]', fields: 'title'});
    return new Set(items.map(i => i.title));
}

async function main() {
    await add(posts, 'posts', await existingTitles('posts'));
    await add(pages, 'pages', await existingTitles('pages'));
}

main().catch(err => {
    console.error('✗ Articles seed failed:', err.message);
    process.exit(1);
});
